import { GLOBAL_ROUTER_EVENTS_TARGET, ROUTER_SLOT_TAG_NAME } from "./config";
import { Cancel, EventListenerSubscription, GlobalRouterEventKind, IPathFragments, IRoute, IRouteMatch, IRouterSlot, PathFragment, RouterSlotEventKind, RoutingInfo } from "./model";
import { addListener, constructAbsolutePath, dispatchGlobalRouterEvent, dispatchRouteChangeEvent, ensureHistoryEvents, handleRedirect, isRedirectRoute, isResolverRoute, matchRoutes, path, queryParentRouterSlot, removeListeners, resolvePageComponent } from "./util";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

// Patches the history object and ensures the correct events.
ensureHistoryEvents();

/**
 * Slot for a node in the router tree.
 * @slot - Default content.
 */
export class RouterSlot<D = unknown, P = unknown> extends HTMLElement implements IRouterSlot {

	/**
	 * Listeners on the router.
	 */
	private listeners: EventListenerSubscription[] = [];

	/**
	 * The available routes.
	 */
	private _routes: IRoute<D>[] = [];
	get routes (): IRoute<D>[] {
		return this._routes;
	}

	set routes (routes: IRoute<D>[]) {
		this.clear();
		this.add(routes);
	}

	/**
	 * The parent router.
	 * Is REQUIRED if this router is a child.
	 * When set, the relevant listeners are added or teared down because they depend on the parent.
	 */
	_parent: IRouterSlot<P> | null | undefined;
	get parent (): IRouterSlot<P> | null | undefined {
		return this._parent;
	}

	set parent (router: IRouterSlot<P> | null | undefined) {
		this.detachListeners();
		this._parent = router;
		this.attachListeners();
	}

	/**
	 * The current route.
	 */
	get route (): IRoute<D> | null {
		return this.match != null ? this.match.route : null;
	}

	/**
	 * The current path fragment.
	 */
	get fragments (): IPathFragments | null {
		return this.match != null ? this.match.fragments : null;
	}

	/**
	 * The current path routeMatch.
	 */
	private _routeMatch: IRouteMatch<D> | null;

	get match (): IRouteMatch<D> | null {
		return this._routeMatch;
	}

	/**
	 * Whether the router is a root router.
	 */
	get isRoot (): boolean {
		return this.parent == null;
	}

	/**
	 * Hooks up the element.
	 */
	constructor () {
		super();

		this.load = this.load.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Query the parent router slot when the router slot is connected.
	 */
	connectedCallback (): void {
		this.parent = this.queryParentRouterSlot();
	}

	/**
	 * Tears down the element.
	 */
	disconnectedCallback (): void {
		this.detachListeners();
	}

	/**
	 * Queries the parent router.
	 */
	queryParentRouterSlot (): IRouterSlot<P> | null {
		return queryParentRouterSlot<P>(this);
	}

	/**
	 * Returns an absolute path from this router slot.
	 * @param path
	 */
	constructAbsolutePath (path: PathFragment): string {
		return constructAbsolutePath(this, path);
	}

	/**
	 * Adds routes to the router.
	 * @param routes
	 * @param navigate
	 */
	add (routes: IRoute<D>[], navigate: boolean = this.isRoot): void {

		// Add the routes to the array
		this._routes.push(...routes);

		// Register that the path has changed so the correct route can be loaded.
		if (navigate) {
			this.load().then();
		}
	}

	/**
	 * Removes all routes.
	 */
	clear (): void {
		this._routes.length = 0;
	}

	/**
	 * Each time the path changes, load the new path.
	 */
	async load (): Promise<void> {

		// Either choose the parent fragment or the current path if no parent exists.
		const pathFragment = this.parent != null && this.parent.fragments != null
			? this.parent.fragments.rest
			: path();

		await this.loadPath(pathFragment);
	}

	/**
	 * Attaches listeners, either globally or on the parent router.
	 */
	protected attachListeners (): void {

		// Add listeners that updates the route
		this.listeners.push(
			this.isRoot

				// Add global listeners.
				? addListener(GLOBAL_ROUTER_EVENTS_TARGET, GlobalRouterEventKind.ChangeState, this.load)

				// Attach child router listeners
				: addListener(this.parent!, RouterSlotEventKind.ChangeState, this.load)
		);
	}

	/**
	 * Detaches the listeners.
	 */
	protected detachListeners (): void {
		removeListeners(this.listeners);
	}

	/**
	 * Loads a new path based on the routes.
	 * Returns true if a navigation was made to a new page.
	 */
	protected async loadPath (path: string | PathFragment): Promise<boolean> {

		// Find the corresponding route.
		const match = matchRoutes(this._routes, path);

		// Ensure that a route was found, otherwise we just clear the current state of the route.
		if (match == null) {
			this._routeMatch = null;
			return false;
		}

		const {route} = match;
		const info: RoutingInfo = {match, slot: this};

		try {

			// Only change route if its a new route.
			const navigate = (this.route !== route);
			if (navigate) {

				// Listen for another push state event. If another push state event happens
				// while we are about to navigate we have to cancel.
				let navigationInvalidated = false;
				const cancelNavigation = () => navigationInvalidated = true;
				const cleanup: EventListenerSubscription = addListener(GLOBAL_ROUTER_EVENTS_TARGET, GlobalRouterEventKind.ChangeState, cancelNavigation, {once: true});

				// Cleans up and dispatches a global event that a navigation was cancelled.
				const cancel: Cancel = () => {
					cleanup();
					dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationCancel, info);
					return false;
				};

				// Dispatch globally that a navigation has started
				dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationStart, info);

				// Check whether the guards allow us to go to the new route.
				if (route.guards != null) {
					for (const guard of route.guards) {
						if (!(await Promise.resolve(guard(info)))) {
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

					// The resolve will handle the rest of the navigation. This includes whether or not the navigation
					// should be cancelled.
					navigationInvalidated = await Promise.resolve<void | boolean>(route.resolve(info)) || false;

					// Cancel the navigation if the resolver specifies it.
					if (navigationInvalidated) {
						return cancel();
					}
				}

				// If the component provided is a function (and not a class) call the function to get the promise.
				else {
					const page = await resolvePageComponent(route, info);

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
			// The event is dispatched in an animation frame to allow route children to setup listeners first.
			requestAnimationFrame(() => {
				dispatchRouteChangeEvent(this, info);
			});

			// Dispatch globally that a navigation has ended.
			if (navigate) {
				dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationSuccess, info);
				dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationEnd, info);
			}

			return navigate;

		} catch (e) {
			dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationError, info);
			dispatchGlobalRouterEvent(GlobalRouterEventKind.NavigationEnd, info);
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
