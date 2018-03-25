export interface IPage {
    parentRouter: Router;
}
export declare type IGuard = ((router: Router, route: IRoute) => boolean);
export interface IRoute {
    path: RegExp;
    loader?: Promise<any>;
    guards?: IGuard[];
    scrollToTop?: boolean;
    redirectTo?: string;
}
export declare class Router extends HTMLElement {
    /**
     * The parent router.
     * Is REQUIRED if this router is a child.
     */
    parentRouter: Router | null;
    /**
     * Contains the available routes.
     */
    private routes;
    /**
     * The current route.
     */
    private currentRoute;
    /**
     * The current path of the location.
     */
    static readonly currentPath: string;
    /**
     * Determines whether the router or one of its parent routers is loading a new path.
     */
    private _isLoading;
    readonly isLoading: boolean;
    /**
     * Router related events.
     */
    static readonly events: {
        didChangeRoute: string;
        onPushState: string;
    };
    constructor();
    /**
     * Hook up event listeners and create the routes.
     */
    connectedCallback(): void;
    /**
     * Remove event listeners and clean up.
     */
    disconnectedCallback(): void;
    /**
     * Sets up the routes.
     * @param {IRoute[]} routes
     * @param {boolean} replaceRoutes
     * @param {boolean} navigate
     * @returns {Promise<void>}
     */
    createRoutes(routes: IRoute[], replaceRoutes?: boolean, navigate?: boolean): Promise<void>;
    /**
     * Removes all routes.
     */
    clearRoutes(): Promise<void>;
    /**
     * Each time the path changes, load the new path.
     * Prevents the event from continuing down the router tree if a navigation was made.
     * @private
     */
    private onPathChanged(e?);
    /**
     * Matches the first route that matches the given path.
     * @private
     */
    private matchRoute(path);
    /**
     * Loads a new path based on the routes.
     * Returns true if a navigation was made to a new page.
     * @private
     */
    private loadPath(path);
    /**
     * Dispatches a did change route event.
     * @param {IRoute} route
     */
    private dispatchDidChangeRouteEvent(route);
    /**
     * Dispatches a on push state event.
     */
    private static dispatchOnPushStateEvent();
    /*******************************************
     *** Implementation of History interface ***
     *** We need to wrap the history API in  ***
     *** to dispatch the "onpushstate" event ***
     *******************************************/
    /**
     * The number of pages in the history stack.
     * @returns {number}
     */
    static readonly historyLength: number;
    /**
     * The state of the current history entry.
     * @returns {{}}
     */
    static readonly state: {};
    /**
     * The scroll restoration behavior.
     * @returns {ScrollRestoration}
     */
    /**
     * Set default scroll restoration behavior on history navigation.
     * This property can be either auto or manual.
     * @param {ScrollRestoration} value
     */
    static scrollRestoration: ScrollRestoration;
    /**
     * Goes to the previous page in session history, the same action as when the user
     * clicks the browser's Back button. Equivalent to history.go(-1).
     */
    static back(): void;
    /**
     * Goes to the next page in session history, the same action as when the
     * user clicks the browser's Forward button; this is equivalent to history.go(1).
     */
    static forward(): void;
    /**
     * Loads a page from the session history, identified by its relative location
     * to the current page, for example -1 for the previous page or 1  for the next page.
     * @param {number} delta
     */
    static go(delta: number): void;
    /**
     * Pushes the given data onto the session history stack with the specified title and, if provided, URL.
     * @param {{}} data
     * @param {string} title
     * @param {string | null} url
     */
    static pushState(data: {}, title: string, url: string | null): void;
    /**
     * Updates the most recent entry on the history stack to have the specified data, title, and, if provided, URL.
     * @param {{}} data
     * @param {string} title
     * @param {string | null} url
     */
    static replaceState(data: {} | null, title: string | null, url: string | null): void;
}
