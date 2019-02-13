import { Params } from "../model";

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
