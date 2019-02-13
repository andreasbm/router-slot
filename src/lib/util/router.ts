import { CATCH_ALL_WILDCARD, TRAVERSE_FLAG } from "../config";
import { Class, IComponentRoute, IPage, IRedirectRoute, IResolverRoute, IRoute, IRouteMatch, IWebRouter, ModuleResolver, PathFragment, RouterTree } from "../model";
import { ensureSlash, stripSlash } from "./url";

/**
 * If the full path starts with the path, the path is active.
 * @param path
 * @param fullPath
 */
export function isPathActive (path: string | PathFragment, fullPath: string): boolean {
	return stripSlash(fullPath).startsWith(stripSlash(path));
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
	const regex = route.path === CATCH_ALL_WILDCARD ? /.*/
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
		// Always subtract at least 1 because we the path is relative to its parent.
		const fragments = getFragments(tree, depth - 1 - traverseDepth);
		path = ensureSlash(`${fragments.join("/")}${path != "" ? `/${path}` : ""}`);
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
 * Determines whether the provided function is a class.
 * @param func
 * @returns {boolean}
 */
export function isClass (func: Function): func is Class {
	return typeof func === "function" && /^class\s/.test(Function.prototype.toString.call(func));
}
