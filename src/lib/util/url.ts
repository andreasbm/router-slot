import { DEFAULT_SLASH_OPTIONS } from "../config";
import { ISlashOptions, Params, Query } from "../model";


/**
 * The current path of the location.
 * As default slashes are included at the start and end.
 * @param options
 */
export function path (options: ISlashOptions = DEFAULT_SLASH_OPTIONS): string {
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
 * Returns the query string.
 */
export function queryString (): string {
	return window.location.search;
}

/**
 * Returns the params for the current path.
 * @returns Params
 */
export function query (): Params {
	return toQuery(queryString().substr(1));
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
 * Splits a query string and returns the query.
 * @param {string} queryString (example: ("test=123&hejsa=LOL&wuhuu"))
 * @returns {Query}
 */
export function toQuery (queryString: string): Query {

	// If the query does not contain anything, return an empty object.
	if (queryString.length === 0) {
		return {};
	}

	// Grab the atoms (["test=123", "hejsa=LOL", "wuhuu"])
	const atoms = queryString.split("&");

	// Split by the values ([["test", "123"], ["hejsa", "LOL"], ["wuhuu"]])
	const arrayMap = atoms.map(atom => atom.split("="));

	// Assign the values to an object ({ test: "123", hejsa: "LOL", wuhuu: "" })
	return Object.assign({}, ...arrayMap.map(arr => ({
		[decodeURIComponent(arr[0])]: (arr.length > 1 ? decodeURIComponent(arr[1]) : "")
	})));
}

/**
 * Turns a query object into a string query.
 * @param query
 */
export function toQueryString (query: Query): string {
	return Object.entries(query).map(([key, value]) => `${key}${value != "" ? `=${value}` : ""}`).join("&");
}
