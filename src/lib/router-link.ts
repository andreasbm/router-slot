import { currentPath, isPathMatch } from "./helpers";
import { RouterEventKind } from "./model";

const template = document.createElement("template");
template.innerHTML = `</style><slot></slot>`;

export class RouterLink extends HTMLElement {

	/**
	 * The path of the navigation.
	 */
	set path (value: string) {
		this.setAttribute("path", value);
	}

	get path (): string {
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
		this.addEventListener("click", this.navigate);
		window.addEventListener(RouterEventKind.NavigationEnd, this.updateActive);
	}

	/**
	 * Tear down listeners.
	 */
	disconnectedCallback () {
		this.removeEventListener("click", this.navigate);
		window.removeEventListener(RouterEventKind.NavigationEnd, this.updateActive);
	}

	/**
	 * Updates whether the route is active or not.
	 */
	updateActive () {
		const active = isPathMatch(this.path, currentPath());
		console.log(this.path, currentPath(), active);
		if (active !== this.active) {
			this.active = active;
		}
	}

	/**
	 * Navigates to the specified path.
	 */
	navigate (e: Event) {
		if (this.disabled) {
			e.preventDefault();
			return;
		}

		history.pushState(null, "", this.path);
	}

}

window.customElements.define("router-link", RouterLink);