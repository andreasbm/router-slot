import { GLOBAL_ROUTER_EVENTS_TARGET, PATH_CHANGING_EVENTS, ROUTER_SLOT_TAG_NAME } from "./config";
import { Cancel, EventListenerSubscription, GlobalRouterEventKind, IRoute, IRouteMatch, IRouterSlot, PathFragment, RouterEventKind } from "./model";
import { addListener, currentPath, dispatchGlobalRouterEvent, dispatchRouteChangeEvent, ensureHistoryEvents, handleRedirect, isRedirectRoute, isResolverRoute, matchRoutes, queryParentRouterSlot, removeListeners, resolvePageComponent } from "./util";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

// Patches the history object and ensures the correct events.
ensureHistoryEvents();

export class RouterSlot extends HTMLElement implements IRouterSlot {

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
	_parent: IRouterSlot | null | undefined;
	get parent () {
		return this._parent;
	}

	set parent (router: IRouterSlot | null | undefined) {
		this.detachListeners();
		this._parent = router;
		this.attachListeners();
	}

	/**
	 * The current route.
	 */
	get route (): IRoute | null {
		return this.match != null ? this.match.route : null;
	}

	/**
	 * The current path fragment.
	 */
	get fragments (): [PathFragment, PathFragment] | null {
		return this.match != null ? this.match.fragments : null;
	}

	/**
	 * The current path routeMatch.
	 */
	private _routeMatch: IRouteMatch | null;
	get match () {
		return this._routeMatch;
	}

	/**
	 * Whether the router is a root router.
	 */
	get isRoot () {
		return this.parent == null;
	}

	constructor () {
		super();

		this.onPathChanged = this.onPathChanged.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Hooks up the component.
	 */
	connectedCallback () {
		this.queryParentRouter();
	}

	/**
	 * Tears down the component.
	 */
	disconnectedCallback () {
		this.detachListeners();
	}

	/**
	 * Queries the parent router.
	 */
	protected queryParentRouter () {
		this.parent = queryParentRouterSlot(this);
	}

	/**
	 * Adds routes to the router.
	 * @param routes
	 * @param navigate
	 */
	add (routes: IRoute[], navigate: boolean = true) {

		// Add the routes to the array
		this.routes = routes;

		// Register that the path has changed so the correct route can be loaded.
		if (navigate) {
			this.onPathChanged().then();
		}
	}

	/**
	 * Removes all routes.
	 */
	clearRoutes () {
		this.routes.length = 0;
	}

	/**
	 * Attaches listeners, either globally or on the parent router.
	 */
	protected attachListeners () {

		// Attach root router listeners
		if (this.isRoot) {

			// Add global listeners.
			this.listeners.push(
				addListener(GLOBAL_ROUTER_EVENTS_TARGET, PATH_CHANGING_EVENTS, this.onPathChanged)
			);

			return;
		}

		// Attach child router listeners
		this.listeners.push(
			addListener(this.parent!, RouterEventKind.RouteChange, this.onPathChanged)
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
		const pathFragment = this.parent != null && this.parent.fragments != null
			? this.parent.fragments[1]
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
					dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationCancel, route);
					return false;
				};

				// Dispatch globally that a navigation has started
				dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationStart, route);

				// Use this object for the callbacks to the routes
				const routingInfo = {slot: this, route, match};

				// Check whether the guards allow us to go to the new route.
				if (route.guards != null) {
					for (const guard of route.guards) {
						if (!(await Promise.resolve(guard(routingInfo)))) {
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
					await Promise.resolve(route.resolve(routingInfo));

					// Cancel the navigation if another navigation event was sent while this one was loading
					if (navigationInvalidated) {
						return cancel();
					}
				}

				// If the component provided is a function (and not a class) call the function to get the promise.
				else {
					const page = await resolvePageComponent(route);

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
				dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationSuccess, route);
				dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationEnd, route);
			}

			return navigate;

		} catch (e) {
			dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationError, route);
			dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationEnd, route);
			throw e;
		}
	}

}

window.customElements.define(ROUTER_SLOT_TAG_NAME, RouterSlot);

declare global {
	interface HTMLElementTagNameMap {
		"router-slot": RouterSlot;
	}
}
