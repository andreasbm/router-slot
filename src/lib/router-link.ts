import { GLOBAL_ROUTER_EVENTS_TARGET, WEB_ROUTER_TAG_NAME } from "./config";
import { EventListenerSubscription, GlobalWebRouterEventKind, IWebRouter, PathFragment } from "./model";
import { addListener, constructAbsolutePath, currentPath, isPathActive, queryParentRoots, removeListeners } from "./util";

const template = document.createElement("template");
template.innerHTML = `</style><slot></slot>`;

export class RouterLink extends HTMLElement {

	private listeners: EventListenerSubscription[] = [];
	private _router: IWebRouter | null = null;

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
	 * The current router context.
	 */
	get router (): IWebRouter | null {
		return this._router;
	}

	set router (value: IWebRouter | null) {
		this._router = value;
	}

	/**
	 * Returns the absolute path constructed relative to the router.
	 * If no router parent was found the path property is the absolute one.
	 */
	get absolutePath (): string {

		// If a router context is present, navigate relative to that one
		if (this.router != null) {
			return constructAbsolutePath(this.router, this.path);
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
			addListener(GLOBAL_ROUTER_EVENTS_TARGET, GlobalWebRouterEventKind.NavigationEnd, this.updateActive)
		);

		// Query the nearest router
		this.router = queryParentRoots(this, WEB_ROUTER_TAG_NAME);
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

		history.pushState(null, "", this.absolutePath);
	}

}

window.customElements.define("router-link", RouterLink);

declare global {
	interface HTMLElementTagNameMap {
		"router-link": RouterLink;
	}
}