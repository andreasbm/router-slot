import { Class, IComponentRoute, IPage, IRedirectRoute, IResolverRoute, IRoute, IRouteMatch, ModuleResolver, Params, PathFragment, RouterComponentEventKind, RouterEventKind } from "./model";

/**
 * The current path of the location.
 * The "/" at the beginning is discarded.
 */
export function currentPath (): string {
	return window.location.pathname.slice(1);
}

/**
 * Returns the params for the current path.
 * @returns Params
 */
export function query (): Params {
	const query = window.location.search.substr(1);
	return splitQuery(query);
}

/**
 * Strips the slash from the start of a path.
 * @param path
 */
export function stripSlash (path: string): string {
	if (path.charAt(0) === "/") {
		return path.slice(1);
	}

	return path;
}

/**
 * Determines whether the provided function is a class.
 * @param func
 * @returns {boolean}
 */
export function isClass (func: Function): func is Class {
	return typeof func === "function" && /^class\s/.test(Function.prototype.toString.call(func));
}

/**
 * Splits a query string and returns the params.
 * @param {string} query (example: ("test=123&hejsa=LOL&wuhuu"))
 * @returns {Params}
 */
export function splitQuery (query: string): Params {

	// If the query does not contain anything, return an empty object.
	if (query.length === 0) {
		return {};
	}

	// Grab the atoms (["test=123", "hejsa=LOL", "wuhuu"])
	const atoms = query.split("&");

	// Split by the values ([["test", "123"], ["hejsa", "LOL"], ["wuhuu"]])
	const arrayMap = atoms.map(atom => atom.split("="));

	// Assign the values to an object ({ test: "123", hejsa: "LOL", wuhuu: "" })
	return Object.assign({}, ...arrayMap.map(arr => ({
		[decodeURIComponent(arr[0])]: (arr.length > 1 ? decodeURIComponent(arr[1]) : "")
	})));
}

/**
 * Dispatches a did change route event.
 * @param $elem
 * @param {IRoute} route
 */
export function dispatchRouteChangeEvent ($elem: HTMLElement, route: IRoute) {
	$elem.dispatchEvent(new CustomEvent(RouterComponentEventKind.RouteChange, {
		detail: route
	}));
}

/**
 * Determines whether a route matches a path.
 * @param routePath
 * @param fullPath
 */
export function isPathMatch (routePath: string | RegExp, fullPath: string): boolean {
	return getPathMatch(routePath, fullPath) != null;
}

/**
 * Returns the path routeMatch for a route path and the full path.
 * @param routePath
 * @param fullPath
 */
export function getPathMatch (routePath: string | RegExp, fullPath: string): RegExpMatchArray | null {
	// We need to treat empty paths a bit different because an empty string matches every path in the regex.
	const matchPath = routePath === "" ? /^$/ : routePath;
	return fullPath.match(matchPath);
}

/**
 * Matches the first route that matches the given path.
 * @param routes
 * @param path
 */
export function matchRoutes (routes: IRoute[], path: string): IRouteMatch | null {
	for (const route of routes) {
		// We need to treat empty paths a bit different because an empty string matches every path in the regex.
		const matchPath = route.path === "" ? /^$/ : route.path;
		const match = path.match(matchPath);
		if (match != null) {
			return {
				route,
				match,
				pathFragment: stripSlash(path.slice(match[0].length, path.length))
			};
		}
	}

	return null;
}

/**
 * Dispatches an event on the window object.
 * @param name
 * @param detail
 */
export function dispatchWindowEvent<T> (name: string, detail?: T) {
	window.dispatchEvent(new CustomEvent(name, {detail}));
}

/**
 * Patches the history object by ensuring correct events are dispatches when the history changes.
 */
export function ensureHistoryEvents () {
	const patches = [
		["pushState", RouterEventKind.PushState],
		["replaceState", RouterEventKind.PushState],
		["forward", RouterEventKind.PushState],
		["back", RouterEventKind.PushState],
		["go", RouterEventKind.PushState]
	];
	for (const [name, event] of patches) {
		attachCallback(history, name, () => dispatchWindowEvent(event));
	}
}

/**
 * Attaches a callback after the function on the object has been invoked.
 * @param obj
 * @param name
 * @param cb
 */
export function attachCallback (obj: any, name: string, cb: ((...args: any[]) => void)) {
	const func = obj[name];
	obj[name] = (...args: any[]) => {
		func.apply(obj, args);
		cb(args);
	};
}

/**
 * Returns the page from the route.
 * If the component provided is a function (and not a class) call the function to get the promise.
 * @param route
 */
export async function resolvePageComponent (route: IComponentRoute): Promise<IPage> {

	let component = route.component;
	if (component instanceof Function && !isClass(component)) {
		component = (route.component! as Function)();
	}

	const module = await Promise.resolve(<ModuleResolver>component);
	return module.default ? (new module.default()) : new (<any>module)();
}

/**
 * Determines if a route is a redirect route.
 * @param route
 */
export function isRedirectRoute (route: IRoute): route is IRedirectRoute {
	return (<IRedirectRoute>route).redirectTo != null;
}

/**
 * Determines if a route is a resolver route.
 * @param route
 */
export function isResolverRoute (route: IRoute): route is IResolverRoute {
	return (<IResolverRoute>route).resolve != null;
}
