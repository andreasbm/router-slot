import {IRoute} from "./router-component";

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

export interface IOnPushStateEvent extends CustomEvent {
	detail: null;
}

export interface IPopStateEvent extends CustomEvent {
	detail: null;
}

export interface INavigationStartEvent extends CustomEvent {
	detail: IRoute;
}

export interface INavigationCancelEvent extends CustomEvent {
	detail: IRoute;
}

export interface INavigationErrorEvent extends CustomEvent {
	detail: IRoute;
}

export interface INavigationEndEvent extends CustomEvent {
	detail: IRoute;
}

export enum RouterEventKind {

	// An event triggered when a new state is added to the history.
	OnPushState = "onPushState",

	// An event triggered when a state in the history is popped.
	PopState = "popstate",

	// An event triggered when navigation starts.
	NavigationStart = "navigationStart",

	// An event triggered when navigation is canceled. This is due to a Route Guard returning false during navigation.
	NavigationCancel = "navigationCancel",

	// An event triggered when navigation fails due to an unexpected error.
	NavigationError = "navigationError",

	// An event triggered when navigation ends successfully.
	NavigationEnd = "navigationEnd"
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
	 * Dispatches a on push state event.
	 */
	private static dispatchOnPushStateEvent () {
		Router.dispatchEvent(RouterEventKind.OnPushState);
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
	static pushState (data: {} | null, title: string | null, url: string) {
		history.pushState(data, title, normalizeUrl(url));
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Updates the most recent entry on the history stack to have the specified data, title, and, if provided, URL.
	 * @param {{}} data
	 * @param {string} title
	 * @param {string | null} url
	 */
	static replaceState (data: {} | null, title: string | null, url: string) {
		history.replaceState(data, title, normalizeUrl(url));
		this.dispatchOnPushStateEvent();
	}

	/**
	 * Adds a router event listener.
	 * @param {RouterEventKind} type
	 * @param listener
	 * @param {boolean | AddEventListenerOptions} options
	 */
	static addEventListener (type: RouterEventKind, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
		window.addEventListener(type, listener, options);
	}

	/**
	 * Removes a router event listener.
	 * @param {RouterEventKind} type
	 * @param listener
	 * @param {EventListenerOptions | boolean} options
	 */
	static removeEventListener (type: RouterEventKind, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) {
		window.removeEventListener(type, listener, options);
	}

	/**
	 * Dispatches a router event.
	 * @param type
	 * @param route
	 */
	static dispatchEvent (type: RouterEventKind, route?: IRoute) {
		window.dispatchEvent(new CustomEvent(type, {detail: route}));
	}
}
