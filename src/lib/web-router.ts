import { GLOBAL_ROUTER_EVENTS_TARGET, PATH_CHANGING_EVENTS } from "./config";
import { Cancel, Cleanup, EventListenerSubscription, GlobalWebRouterEventKind, IRoute, IRouteMatch, IWebRouter, PathFragment, WebRouterEventKind } from "./model";
import { addListener, currentPath, dispatchGlobalRouterEvent, dispatchRouteChangeEvent, ensureHistoryEvents, handleRedirect, isRedirectRoute, isResolverRoute, matchRoutes, removeListeners, resolvePageComponent } from "./util";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

// Patches the history object and ensures the correct events.
ensureHistoryEvents();

export class WebRouter extends HTMLElement implements IWebRouter {

	/**
	 * Contains the available routes.
	 */
	private routes: IRoute[] = [];

	/**
	 * Listeners on the router.
	 */
	private listeners: EventListenerSubscription[] = [];

	/**
	 * The parent router.
	 * Is REQUIRED if this router is a child.
	 * When set, the relevant listeners are added or teared down because they depend on the parent.
	 */
	_parentRouter: IWebRouter | null | undefined;
	get parentRouter () {
		return this._parentRouter;
	}

	set parentRouter (router: IWebRouter | null | undefined) {
		this.detachListeners();
		this._parentRouter = router;
		this.attachListeners();
	}

	/**
	 * The current route.
	 */
	get route (): IRoute | null {
		return this.routeMatch != null ? this.routeMatch.route : null;
	}

	/**
	 * The current path fragment.
	 */
	get fragments (): [PathFragment, PathFragment] | null {
		return this.routeMatch != null ? this.routeMatch.fragments : null;
	}

	/**
	 * The current path routeMatch.
	 */
	private _routeMatch: IRouteMatch | null;
	get routeMatch () {
		return this._routeMatch;
	}

	/**
	 * Whether the router is a child router.
	 */
	get isChildRouter () {
		return this.parentRouter != null;
	}

	constructor () {
		super();

		this.onPathChanged = this.onPathChanged.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Remove event listeners and clean up.
	 */
	disconnectedCallback () {
		this.detachListeners();
	}

	/**
	 * Initializes the router.
	 * @param routes
	 * @param parentRouter
	 * @param navigate
	 */
	async setup (routes: IRoute[], parentRouter?: IWebRouter | null, navigate = true) {

		// Clean up the current routes
		await this.clearRoutes();

		// Add the routes to the array
		this.routes = routes;

		// Store the reference to the parent router.
		this.parentRouter = parentRouter;

		// Register that the path has changed so the correct route can be loaded.
		if (navigate) {
			await this.onPathChanged();
		}
	}

	/**
	 * Removes all routes.
	 */
	async clearRoutes () {
		this.routes.length = 0;
	}

	/**
	 * Attaches listeners, either globally or on the parent router.
	 */
	protected attachListeners () {

		// Attach child router listeners
		if (this.isChildRouter) {
			this.listeners.push(
				addListener(this.parentRouter!, WebRouterEventKind.RouteChange, this.onPathChanged)
			);

			return;
		}

		// Add global listeners.
		this.listeners.push(
			addListener(GLOBAL_ROUTER_EVENTS_TARGET, PATH_CHANGING_EVENTS, this.onPathChanged)
		);
	}

	/**
	 * Detaches the listeners.
	 */
	protected detachListeners () {
		removeListeners(this.listeners);
	}

	/**
	 * Each time the path changes, load the new path.
	 * Prevents the event from continuing down the router tree if a navigation was made.
	 * @private
	 */
	protected async onPathChanged () {

		// Either choose the parent fragment or the current path if no parent exists.
		const pathFragment = this.parentRouter != null && this.parentRouter.fragments != null
			? this.parentRouter.fragments[1]
			: currentPath();

		await this.loadPath(pathFragment);
	}

	/**
	 * Loads a new path based on the routes.
	 * Returns true if a navigation was made to a new page.
	 * @private
	 */
	protected async loadPath (path: string | PathFragment): Promise<boolean> {

		// Find the corresponding route.
		const match = matchRoutes(this.routes, path);

		// Ensure that a route was found, otherwise we just clear the current state of the route.
		if (match == null) {
			this._routeMatch = null;
			return false;
		}

		const {route} = match;

		try {

			// Only change route if its a new route.
			const navigate = (this.route !== route);
			if (navigate) {

				// Listen for another push state event. If another push state event happens
				// while we are about to navigate we have to cancel.
				let navigationInvalidated = false;
				const cancelNavigation = () => navigationInvalidated = true;
				const cleanup: EventListenerSubscription = addListener(GLOBAL_ROUTER_EVENTS_TARGET, PATH_CHANGING_EVENTS, cancelNavigation, {once: true});

				// Cleans up and dispatches a global event that a navigation was cancelled.
				const cancel: Cancel = () => {
					cleanup();
					dispatchGlobalRouterEvent(GlobalWebRouterEventKind.NavigationCancel, route);
					return false;
				};

				// Dispatch globally that a navigation has started
				dispatchGlobalRouterEvent(GlobalWebRouterEventKind.NavigationStart, route);

				// Check whether the guards allow us to go to the new route.
				if (route.guards != null) {
					for (const guard of route.guards) {
						if (!(await Promise.resolve(guard(this, route)))) {
							return cancel();
						}
					}
				}

				// Redirect if necessary
				if (isRedirectRoute(route)) {
					cleanup();
					handleRedirect(this, route);
					return false;
				}

				// Handle custom resolving if necessary
				else if (isResolverRoute(route)) {
					await Promise.resolve(route.resolve(this, route));

					// Cancel the navigation if another navigation event was sent while this one was loading
					if (navigationInvalidated) {
						return cancel();
					}
				}

				// If the component provided is a function (and not a class) call the function to get the promise.
				else {
					const page = await resolvePageComponent(route);
					page.parentRouter = this;

					// Cancel the navigation if another navigation event was sent while this one was loading
					if (navigationInvalidated) {
						return cancel();
					}

					// Remove the old page
					if (this.childNodes.length > 0) {
						const previousPage = this.childNodes[0];
						this.removeChild(previousPage);
					}

					// Append the new page
					this.appendChild(page);
				}

				cleanup();
			}

			// Store the new route match
			this._routeMatch = match;

			// Always dispatch the route change event to notify the children that something happened.
			// This is because the child routes might have to change routes further down the tree.
			dispatchRouteChangeEvent(this, route);

			// Dispatch globally that a navigation has ended.
			if (navigate) {
				dispatchGlobalRouterEvent(GlobalWebRouterEventKind.NavigationSuccess, route);
				dispatchGlobalRouterEvent(GlobalWebRouterEventKind.NavigationEnd, route);
			}

			return navigate;

		} catch (e) {
			dispatchGlobalRouterEvent(GlobalWebRouterEventKind.NavigationError, route);
			dispatchGlobalRouterEvent(GlobalWebRouterEventKind.NavigationEnd, route);
			throw e;
		}
	}

}

window.customElements.define("web-router", WebRouter);

declare global {
	interface HTMLElementTagNameMap {
		"web-router": WebRouter;
	}
}
