import { currentPath, dispatchRouteChangeEvent, dispatchWindowEvent, ensureHistoryEvents, resolvePageComponent, matchRoutes } from "./helpers";
import { IRoute, IRouterComponent, RouterComponentEventKind, RouterEventKind } from "./model";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

// Patches the history object and ensures the correct events.
ensureHistoryEvents();

export class WebRouter extends HTMLElement implements IRouterComponent {

	/**
	 * Contains the available routes.
	 */
	private routes: IRoute[] = [];

	/**
	 * The parent router.
	 * Is REQUIRED if this router is a child.
	 * When set, the relevant listeners are added or teared down because they depend on the parent.
	 */
	_parentRouter: IRouterComponent | null | undefined;
	get parentRouter () {
		return this._parentRouter;
	}

	set parentRouter (router: IRouterComponent | null | undefined) {
		this.detachListeners();
		this._parentRouter = router;
		this.attachListeners();
	}

	/**
	 * The current route.
	 */
	private _currentRoute: IRoute | null;
	get currentRoute () {
		return this._currentRoute;
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
	async setup (routes: IRoute[], parentRouter?: IRouterComponent | null, navigate = true) {

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
		await this.loadPath(currentPath());
	}

	/**
	 * Loads a new path based on the routes.
	 * Returns true if a navigation was made to a new page.
	 * @private
	 */
	protected async loadPath (path: string): Promise<boolean> {

		// Find the corresponding route.
		const route = matchRoutes(this.routes, path);

		// Ensure that a route was found.
		if (route == null) {
			throw new Error(`No routes matches the path "${path}".`);
		}

		// Check whether the component or redirectTo is specified (and that both are not specified)
		if (route.component == null && route.redirectTo == null && !(route.component != null && route.redirectTo != null)) {
			throw new Error(`The route "${route.path}" needs to have either a component or a redirectTo set (and not both).`);
		}

		try {

			// Only change route if its a new route.
			const navigate = (this.currentRoute !== route);
			if (navigate) {

				// Dispatch globally that a navigation has started.
				dispatchWindowEvent(RouterEventKind.NavigationStart, route);

				// Listen for another navigation start event
				let cancelNavigation = false;
				const newNavigationHandler = () => cancelNavigation = true;
				window.addEventListener(RouterEventKind.NavigationStart, newNavigationHandler, {once: true});
				const cleanup = () => window.removeEventListener(RouterEventKind.NavigationStart, newNavigationHandler);

				// Check whether the guards allow us to go to the new route.
				if (route.guards != null) {

					// @ts-ignore
					for (const guard of route.guards) {
						if (!(await Promise.resolve(guard(this, route)))) {
							// Dispatch globally that a navigation was cancelled.
							cleanup();
							dispatchWindowEvent(RouterEventKind.NavigationCancel, route);
							return false;
						}
					}
				}

				// Redirect if necessary
				if (route.redirectTo != null) {
					cleanup();
					history.replaceState(history.state, "", route.redirectTo);
					return false;
				}

				// If the component provided is a function (and not a class) call the function to get the promise.
				const page = await resolvePageComponent(route);
				page.parentRouter = this;

				cleanup();

				// Cancel the navigation if another navigation event was sent while this one was loading
				if (cancelNavigation) {
					dispatchWindowEvent(RouterEventKind.NavigationCancel, route);
					return false;
				}

				// Remove the old page
				if (this.childNodes.length > 0) {
					const previousPage = this.childNodes[0];
					this.removeChild(previousPage);
				}

				// Append the new page
				this.appendChild(page);
				this._currentRoute = route;
			}

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
