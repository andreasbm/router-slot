import { currentPath, dispatchRouteChangeEvent, dispatchWindowEvent, ensureHistoryEvents, getFragments, handleRedirect, isRedirectRoute, isResolverRoute, matchRoutes, resolvePageComponent, traverseRouterTree } from "./helpers";
import { Cancel, Cleanup, IRoute, IRouteMatch, IWebRouter, PathFragment, RouterComponentEventKind, RouterEventKind } from "./model";

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
	 * Attaches listeners.
	 */
	protected attachListeners () {
		if (this.isChildRouter) {
			this.parentRouter!.addEventListener(RouterComponentEventKind.RouteChange, this.onPathChanged);
		} else {
			window.addEventListener(RouterEventKind.PopState, this.onPathChanged);
			window.addEventListener(RouterEventKind.PushState, this.onPathChanged);
		}
	}

	/**
	 * Detaches the listeners.
	 */
	protected detachListeners () {
		if (this.isChildRouter) {
			this.parentRouter!.removeEventListener(RouterComponentEventKind.RouteChange, this.onPathChanged);
		} else {
			window.removeEventListener(RouterEventKind.PopState, this.onPathChanged);
			window.removeEventListener(RouterEventKind.PushState, this.onPathChanged);
		}
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
				let cancelNavigation = false;
				const newPushStateHandler = () => cancelNavigation = true;
				window.addEventListener(RouterEventKind.PushState, newPushStateHandler, {once: true});

				// Cleans up the subscriptions
				const cleanup: Cleanup = () => window.removeEventListener(RouterEventKind.NavigationStart, newPushStateHandler);

				// Cleans up and dispatches a global event that a navigation was cancelled.
				const cancel: Cancel = () => {
					cleanup();
					dispatchWindowEvent(RouterEventKind.NavigationCancel, route);
					return false;
				};

				// Dispatch globally that a navigation has started.
				dispatchWindowEvent(RouterEventKind.NavigationStart, route);

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
					if (cancelNavigation) {
						return cancel();
					}
				}

				// If the component provided is a function (and not a class) call the function to get the promise.
				else {
					const page = await resolvePageComponent(route);
					page.parentRouter = this;

					// Cancel the navigation if another navigation event was sent while this one was loading
					if (cancelNavigation) {
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
				dispatchWindowEvent(RouterEventKind.NavigationSuccess, route);
				dispatchWindowEvent(RouterEventKind.NavigationEnd, route);
			}

			return navigate;

		} catch (e) {
			dispatchWindowEvent(RouterEventKind.NavigationError, route);
			dispatchWindowEvent(RouterEventKind.NavigationEnd, route);
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
