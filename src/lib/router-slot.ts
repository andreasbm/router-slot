import { GLOBAL_ROUTER_EVENTS_TARGET, ROUTER_SLOT_TAG_NAME } from "./config";
import { Cancel, EventListenerSubscription, GlobalRouterEvent, IPathFragments, IRoute, IRouteMatch, IRouterSlot, IRoutingInfo, Params, PathFragment, RouterSlotEvent } from "./model";
import { addListener, AnchorHandler, constructAbsolutePath, dispatchGlobalRouterEvent, dispatchRouteChangeEvent, ensureHistoryEvents, handleRedirect, isRedirectRoute, isResolverRoute, matchRoutes, pathWithoutBasePath, queryParentRouterSlot, removeListeners, resolvePageComponent, shouldNavigate } from "./util";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

// Patches the history object and ensures the correct events.
ensureHistoryEvents();

/**
 * Slot for a node in the router tree.
 * @slot - Default content.
 * @event changestate - Dispatched when the router slot state changes.
 */
export class RouterSlot<D = any, P = any> extends HTMLElement implements IRouterSlot<D, P> {

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
	 * Whether the router is a root router.
	 */
	get isRoot (): boolean {
		return this.parent == null;
	}

	/**
	 * The current route match.
	 */
	private _routeMatch: IRouteMatch<D> | null = null;

	get match (): IRouteMatch<D> | null {
		return this._routeMatch;
	}

	/**
	 * The current route of the match.
	 */
	get route (): IRoute<D> | null {
		return this.match != null ? this.match.route : null;
	}

	/**
	 * The current path fragment of the match
	 */
	get fragments (): IPathFragments | null {
		return this.match != null ? this.match.fragments : null;
	}

	/**
	 * The current params of the match.
	 */
	get params (): Params | null {
		return this.match != null ? this.match.params : null;
	}

	/**
	 * The anchor link handler for the router slot
	 */
	private anchorHandler?: AnchorHandler;

	/**
	 * Hooks up the element.
	 */
	constructor () {
		super();

		this.render = this.render.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Query the parent router slot when the router slot is connected.
	 */
	connectedCallback () {
		this.parent = this.queryParentRouterSlot();
		this.setupAnchorListener();
	}

	/**
	 * Tears down the element.
	 */
	disconnectedCallback () {
		this.detachListeners();
		this.detachAnchorListener()
	}

	/**
	 * Queries the parent router.
	 */
	queryParentRouterSlot (): IRouterSlot<P> | null {
		return queryParentRouterSlot<P>(this);
	}

	/**
	 * Returns an absolute path relative to the router slot.
	 * @param path
	 */
	constructAbsolutePath (path: PathFragment): string {
		return constructAbsolutePath(this, path);
	}

	/**
	 * Adds routes to the router.
	 * Navigates automatically if the router slot is the root and is connected.
	 * @param routes
	 * @param navigate
	 */
	add (routes: IRoute<D>[], navigate: boolean = this.isRoot && this.isConnected): void {

		// Add the routes to the array
		this._routes.push(...routes);

		// Register that the path has changed so the correct route can be loaded.
		if (navigate) {
			this.render().then();
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
	async render (): Promise<void> {

		// When using ShadyDOM the disconnectedCallback in the child router slot is called async
		// in a microtask. This means that when using the ShadyDOM polyfill, sometimes child router slots
		// would not clear event listeners from the parent router slots and therefore route even though
		// it was no longer in the DOM. The solution is to check whether the isConnected flag is false
		// before rendering the path.
		if (!this.isConnected) {
			return;
		}

		// Either choose the parent fragment or the current path if no parent exists.
		// The root router slot will always use the entire path.
		const pathFragment = this.parent != null && this.parent.fragments != null
			? this.parent.fragments.rest
			: pathWithoutBasePath();

		// Route to the path
		await this.renderPath(pathFragment);
	}

	/**
	 * Attach the anchor listener
	 */
	protected setupAnchorListener(): void {
		this.anchorHandler = new AnchorHandler(this);
		window.addEventListener(
			'click',
			this.anchorHandler?.handleEvent.bind(this)
		);
	}

	protected detachAnchorListener(): void {
		if (this.anchorHandler) {
			window.removeEventListener(
				'click',
				this.anchorHandler.handleEvent
			);
		}
	}

	/**
	 * Attaches listeners, either globally or on the parent router.
	 */
	protected attachListeners (): void {

		// Add listeners that updates the route
		this.listeners.push(
			this.parent != null

				// Attach child router listeners
				? addListener<Event, RouterSlotEvent>(this.parent, "changestate", this.render)

				// Add global listeners.
				: addListener<Event, GlobalRouterEvent>(GLOBAL_ROUTER_EVENTS_TARGET, "changestate", this.render)
		);
	}

	/**
	 * Clears the children in the DOM.
	 */
	protected clearChildren () {
		while (this.firstChild != null) {
			this.firstChild.parentNode!.removeChild(this.firstChild);
		}
	}

	/**
	 * Detaches the listeners.
	 */
	protected detachListeners (): void {
		removeListeners(this.listeners);
	}

	getRouteMatch(path: string | PathFragment): IRouteMatch<D> | null {
		const match = matchRoutes(this._routes, path);
		return match;
	}

	/**
	 * Loads a new path based on the routes.
	 * Returns true if a navigation was made to a new page.
	 */
	protected async renderPath (path: string | PathFragment): Promise<boolean> {

		// Find the corresponding route.
		const match = this.getRouteMatch(path);

		// Ensure that a route was found, otherwise we just clear the current state of the route.
		if (match == null) {
			this._routeMatch = null;
			return false;
		}

		const {route} = match;
		const info: IRoutingInfo<D, P> = {match, slot: this};

		try {

			// Only change route if its a new route.
			const navigate = shouldNavigate(this.match, match);
			if (navigate) {

				// Listen for another push state event. If another push state event happens
				// while we are about to navigate we have to cancel.
				let navigationInvalidated = false;
				const cancelNavigation = () => navigationInvalidated = true;
				const removeChangeListener: EventListenerSubscription = addListener<Event, GlobalRouterEvent>(GLOBAL_ROUTER_EVENTS_TARGET, "changestate", cancelNavigation, {once: true});

				// Cleans up the routing by removing listeners and restoring the match from before
				const cleanup = () => {
					removeChangeListener();
				};

				// Cleans up and dispatches a global event that a navigation was cancelled.
				const cancel: Cancel = () => {
					cleanup();
					dispatchGlobalRouterEvent("navigationcancel", info);
					dispatchGlobalRouterEvent("navigationend", info);
					return false;
				};

				// Dispatch globally that a navigation has started
				dispatchGlobalRouterEvent("navigationstart", info);

				// Check whether the guards allow us to go to the new route.
				if (route.guards != null) {
					for (const guard of route.guards) {
						if (!(await guard(info))) {
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
					// should be cancelled. If the resolve function returns false we cancel the navigation.
					if ((await route.resolve(info)) === false) {
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

					// Remove the old page by clearing the slot
					this.clearChildren();

					// Store the new route match before we append the new page to the DOM.
					// We do this to ensure that we can find the match in the connectedCallback of the page.
					this._routeMatch = match;

					// Append the new page
					this.appendChild(page);
				}

				// Remember to cleanup after the navigation
				cleanup();
			}

			// Store the new route match
			this._routeMatch = match;

			// Always dispatch the route change event to notify the children that something happened.
			// This is because the child routes might have to change routes further down the tree.
			// The event is dispatched in an animation frame to allow route children to make the initial render first
			// and hook up the new router slot.
			requestAnimationFrame(() => {
				dispatchRouteChangeEvent(this, info);
			});

			// Dispatch globally that a navigation has ended.
			if (navigate) {
				dispatchGlobalRouterEvent("navigationsuccess", info);
				dispatchGlobalRouterEvent("navigationend", info);
			}

			return navigate;

		} catch (e) {
			dispatchGlobalRouterEvent("navigationerror", info);
			dispatchGlobalRouterEvent("navigationend", info);
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
