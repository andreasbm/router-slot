import { Params } from "./model";

/**
 * Determines whether the provided function is a class.
 * @param func
 * @returns {boolean}
 */
export function isClass(func: Function) {
	return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
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
 * Normalizes an url.
 * Safari won't navigate if the doesn't start with "/". Other browser vendors do not care.
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrl (url: string): string {
	if (url.charAt(0) != '/') {
		url = `/${url}`;
	}

	return url;
}
