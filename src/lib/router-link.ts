import { GLOBAL_ROUTER_EVENTS_TARGET, ROUTER_SLOT_TAG_NAME } from "./config";
import { EventListenerSubscription, GlobalRouterEventKind, IRouterSlot, PathFragment } from "./model";
import { addListener, constructAbsolutePath, currentPath, isPathActive, queryParentRoots, removeListeners } from "./util";

const template = document.createElement("template");
template.innerHTML = `</style><slot></slot>`;

export class RouterLink extends HTMLElement {

	private listeners: EventListenerSubscription[] = [];
	private _context: IRouterSlot | null = null;

	/**
	 * The path of the navigation.
	 */
	set path (value: string | PathFragment) {
		this.setAttribute("path", value);
	}

	get path (): string | PathFragment {
		return this.getAttribute("path") || "/";
	}

	/**
	 * Whether the component is disabled or not.
	 */
	get disabled (): boolean {
		return this.hasAttribute("disabled");
	}

	set disabled (value: boolean) {
		value ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
	}

	/**
	 * Whether the component is active or not.
	 */
	get active (): boolean {
		return this.hasAttribute("active");
	}

	set active (value: boolean) {
		value ? this.setAttribute("active", "") : this.removeAttribute("active");
	}

	/**
	 * Whether the query should be preserved or not.
	 */
	get preserve (): boolean {
		return this.hasAttribute("preserve");
	}

	set preserve (value: boolean) {
		value ? this.setAttribute("preserve", "") : this.removeAttribute("preserve");
	}

	/**
	 * The current router slot context.
	 */
	get context (): IRouterSlot | null {
		return this._context;
	}

	set context (value: IRouterSlot | null) {
		this._context = value;
	}

	/**
	 * Returns the absolute path constructed relative to the context.
	 * If no router parent was found the path property is the absolute one.
	 */
	get absolutePath (): string {

		// If a router context is present, navigate relative to that one
		if (this.context != null) {
			return constructAbsolutePath(this.context, this.path);
		}

		return this.path;
	}

	constructor () {
		super();

		this.navigate = this.navigate.bind(this);
		this.updateActive = this.updateActive.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Hook up listeners.
	 */
	connectedCallback () {
		this.listeners.push(
			addListener(this, "click", this.navigate),
			addListener(GLOBAL_ROUTER_EVENTS_TARGET, GlobalRouterEventKind.NavigationEnd, this.updateActive)
		);

		// Query the nearest router
		this.context = queryParentRoots(this, ROUTER_SLOT_TAG_NAME);
	}

	/**
	 * Tear down listeners.
	 */
	disconnectedCallback () {
		removeListeners(this.listeners);
	}

	/**
	 * Updates whether the route is active or not.
	 */
	protected updateActive () {
		const active = isPathActive(this.absolutePath, currentPath());
		if (active !== this.active) {
			this.active = active;
		}
	}

	/**
	 * Navigates to the specified path.
	 */
	navigate (e: Event) {

		// If disabled, we just prevent the navigation already now.
		if (this.disabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		history.pushState(null, "", `${this.absolutePath}${this.preserve ? window.location.search : ""}`);
	}

}

window.customElements.define("router-link", RouterLink);

declare global {
	interface HTMLElementTagNameMap {
		"router-link": RouterLink;
	}
}