import { CATCH_ALL_FLAG, TRAVERSE_FLAG } from "./config";
import { Class, EventListenerSubscription, IComponentRoute, IPage, IRedirectRoute, IResolverRoute, IRoute, IRouteMatch, IWebRouter, ModuleResolver, Params, PathFragment, RouterComponentEventKind, RouterEventKind, RouterTree } from "./model";

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
 * Strips the slash from the start and end of a path.
 * @param path
 */
export function stripSlash (path: string): string {
	path = path.startsWith("/") ? path.slice(1) : path;
	return path.endsWith("/") ? path.slice(0, path.length - 1) : path;
}

/**
 * Ensures the path starts with a slash
 * @param path
 */
export function ensureSlash (path: string): string {
	return `${!path.startsWith("/") ? "/" : ""}${path}`;
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
 * Matches a route.
 * @param route
 * @param path
 */
export function matchRoute (route: IRoute, path: string | PathFragment): IRouteMatch | null {

	// Construct the regex to match with the path or fragment
	// If fuzzy we simply need to match the start of the path with the route path.
	// If not fuzzy we need to match either with the route path and "/" or the route path and the end of the line.
	const regex = route.path === CATCH_ALL_FLAG ? /.*/
		: route.fuzzy
			? new RegExp(`^[\/]?${route.path}`)
			: new RegExp(`(^[\/]?${route.path}[\/])|(^[\/]?${route.path}$)`);

	// Check if there's a match
	const match = path.match(regex);
	if (match != null) {

		// Split up the path into fragments
		const consumed = stripSlash(path.slice(0, match[0].length));
		const rest = stripSlash(path.slice(match[0].length, path.length));

		return {
			route,
			match,
			fragments: [consumed, rest]
		};
	}

	return null;
}

/**
 * Matches the first route that matches the given path.
 * @param routes
 * @param path
 */
export function matchRoutes (routes: IRoute[], path: string | PathFragment): IRouteMatch | null {
	for (const route of routes) {
		const match = matchRoute(route, path);
		if (match != null) {
			return match;
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

/**
 * Traverses the router tree up to the root route.
 * @param route
 */
export function traverseRouterTree (route: IWebRouter): {tree: RouterTree, depth: number} {

	// Find the nodes from the route up to the root route
	let routes: IWebRouter[] = [route];
	while (route.parentRouter != null) {
		route = route.parentRouter;
		routes.push(route);
	}

	// Create the tree
	const tree = routes.reduce((acc: RouterTree, router: IWebRouter) => {
		return {router, child: acc};
	}, undefined);

	const depth = routes.length;

	return {tree, depth};
}

/**
 * Generates a path based on the router tree.
 * @param tree
 * @param depth
 */
export function getFragments (tree: RouterTree, depth: number): PathFragment[] {
	let child = tree;
	const fragments: PathFragment[] = [];

	// Look through all of the path fragments
	while (child != null && child.router.routeMatch != null && depth > 0) {
		fragments.push(child.router.routeMatch.fragments[0]);
		child = child.child;
		depth--;
	}

	return fragments;
}

/**
 * Constructs the path based on a router.
 * - Handles relative paths: "mypath"
 * - Handles absolute paths: "/mypath"
 * - Handles traversing paths: "../../mypath"
 * @param router
 * @param path
 */
export function constructPath (router: IWebRouter, path: string): string {

	// Grab the router tree
	const {tree, depth} = traverseRouterTree(router);

	// If the path starts with "/" its an absolute path
	if (!path.startsWith("/")) {
		let traverseDepth = 0;

		// If the path starts with "./" we can remove that part
		// because we know the path is relative to its route.
		if (path.startsWith("./")) {
			path = path.slice(2);
		}

		// Match with the traverse flag.
		const match = path.match(new RegExp(TRAVERSE_FLAG, "g"));
		if (match != null) {

			// If the path matched with the traverse flag we know that we have to construct
			// a route until a certain depth. The traverse depth will is the amount of "../" in the path
			// and the depth is the part of the path we a slicing away.
			traverseDepth = match.length;
			const length = match.reduce((acc: number, m: string) => acc + m.length, 0);
			path = path.slice(length);
		}

		// Grab the fragments and construct the new path, taking the traverse depth into account.
		// Always subtract atleast 1 because we the path is relative to its parent.
		const fragments = getFragments(tree, depth - 1 - traverseDepth);
		return ensureSlash(`${fragments.join("/")}${path != "" ? `/${path}` : ""}`);
	}

	return path;
}

/**
 * Handles a redirect.
 * @param router
 * @param route
 */
export function handleRedirect (router: IWebRouter, route: IRedirectRoute) {
	history.replaceState(history.state, "", constructPath(router, route.redirectTo));
}


/**
 * Adds an event listener (or more) to an element and returns a function to unsubscribe.
 * @param $elem
 * @param type
 * @param listener
 * @param options
 */
export function addListener ($elem: EventTarget,
                             type: string[] | string,
                             listener: ((e?: Event) => void),
                             options?: boolean | AddEventListenerOptions): EventListenerSubscription {
	const types = Array.isArray(type) ? type : [type];
	types.forEach(t => $elem.addEventListener(t, listener, options));
	return () => types.forEach(t => $elem.removeEventListener(t, listener, options));
}


/**
 * Removes the event listeners in the array.
 * @param listeners
 */
export function removeListeners (listeners: EventListenerSubscription[]) {
	listeners.forEach(unsub => unsub());
}

/**
 * Traverses the roots and returns the first match.
 * @param $elem
 * @param query
 */
export function traverseRoots<T> ($elem: Element, query: string): T | null {

	// If a shadow root doesn't exist we don't continue the traversal
	if ($elem.shadowRoot == null) {
		return null;
	}

	// Grab the rood node and query it
	const $root = (<any>$elem.shadowRoot.host).getRootNode();
	const match = $root.querySelector(query);
	if (match != null) {
		return <T>match;
	}

	// We continue the traversal if there was not matches
	return traverseRoots($root, query);
}
