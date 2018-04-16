export type Params = { [key: string]: string };

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
	const values = atoms.map(atom => atom.split("="));

	// Assign the values to an object ({ test: "123", hejsa: "LOL", wuhuu: "" })
	return Object.assign({}, ...values.map(arr => ({
		[arr[0]]: (arr.length > 1 ? decodeURIComponent(arr[1]) : "")
	})));
}

export class Router {

	/**
	 * The current path of the location.
	 * The "/" at the beginning is discarded.
	 */
	static get currentPath (): string {
		return window.location.pathname.slice(1);
	}

	/**
	 * Returns the params for the current path.
	 * @returns Params
	 */
	static get params (): Params {
		const query = window.location.search.substr(1);
		return splitQuery(query);
	}

	/**
	 * Router related events.
	 */
	static get events () {
		return {

			// An event triggered when a new state is added to the history.
			onPushState: "onPushState",

			// An event triggered when navigation starts.
			navigationStart: "navigationStart",

			// An event triggered when navigation is canceled. This is due to a Route Guard returning false during navigation.
			navigationCancel: "navigationCancel",

			// An event triggered when navigation fails due to an unexpected error.
			navigationError: "navigationError",

			// An event triggered when navigation ends successfully.
			navigationEnd: "navigationEnd"
		};
	}

	/**
	 * Dispatches a on push state event.
	 */
	private static dispatchOnPushStateEvent () {
		window.dispatchEvent(new CustomEvent(Router.events.onPushState));
	}

	/*******************************************
	 *** Implementation of History interface ***
	 *** We need to wrap the history API in  ***
	 *** to dispatch the "onpushstate" event ***
	 *******************************************/

	/**
	 * The number of pages in the history stack.
	 * @returns {number}
	 */
	static get historyLength (): number {
		return history.length;
	}

	/**
	 * The state of the current history entry.
	 * @returns {{}}
	 */
	static get state (): {} {
		return history.state;
	}

	/**
	 * Set default scroll restoration behavior on history navigation.
	 * This property can be either auto or manual.
	 * @param {ScrollRestoration} value
	 */
	static set scrollRestoration (value: ScrollRestoration) {
		history.scrollRestoration = value;
	}

	/**
	 * The scroll restoration behavior.
	 * @returns {ScrollRestoration}
	 */
	static get scrollRestoration (): ScrollRestoration {
		return history.scrollRestoration;
	}

	/**
	 * Goes to the previous page in session history, the same action as when the user
	 * clicks the browser's Back button. Equivalent to history.go(-1).
	 */
	static back () {
		history.back();
	}

	/**
	 * Goes to the next page in session history, the same action as when the
	 * user clicks the browser's Forward button; this is equivalent to history.go(1).
	 */
	static forward () {
		history.forward();
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Loads a page from the session history, identified by its relative location
	 * to the current page, for example -1 for the previous page or 1  for the next page.
	 * @param {number} delta
	 */
	static go (delta: number) {
		history.go(delta);
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Pushes the given data onto the session history stack with the specified title and, if provided, URL.
	 * @param {{}} data
	 * @param {string} title
	 * @param {string | null} url
	 */
	static pushState (data: {} | null, title: string | null, url: string | null) {
		history.pushState(data, title, url);
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Updates the most recent entry on the history stack to have the specified data, title, and, if provided, URL.
	 * @param {{}} data
	 * @param {string} title
	 * @param {string | null} url
	 */
	static replaceState (data: {} | null, title: string | null, url: string | null) {
		history.replaceState(data, title, url);
		this.dispatchOnPushStateEvent();
	}
}