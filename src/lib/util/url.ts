import { DEFAULT_SLASH_OPTIONS } from "../config";
import { ISlashOptions, Params } from "../model";


/**
 * The current path of the location.
 * As default slashes are included at the start and end.
 * @param options
 */
export function currentPath (options: ISlashOptions = DEFAULT_SLASH_OPTIONS): string {
	return ensureSlash(window.location.pathname.slice(1), options);
}

/**
 * The base path as defined in the <base> tag in the head.
 * As default tt will return the base path with slashes in front and at the end.
 * If eg. <base href="/web-router/"> is defined this function will return "/web-router/".
 * @param options
 */
export function basePath (options: ISlashOptions = DEFAULT_SLASH_OPTIONS): string | null {
	return document.baseURI && ensureSlash(document.baseURI.substring(location.origin.length), options) || null;
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
 * @param start
 * @param end
 */
export function stripSlash (path: string, {start, end}: ISlashOptions = DEFAULT_SLASH_OPTIONS): string {
	path = start && path.startsWith("/") ? path.slice(1) : path;
	return end && path.endsWith("/") ? path.slice(0, path.length - 1) : path;
}

/**
 * Ensures the path starts and ends with a slash
 * @param path
 * @param start
 * @param end
 */
export function ensureSlash (path: string, {start, end}: ISlashOptions = DEFAULT_SLASH_OPTIONS): string {
	path = start && !path.startsWith("/") ? `/${path}` : path;
	return end && !path.endsWith("/") ? `${path}/` : path;
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
