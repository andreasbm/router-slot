import { Router } from "./router";

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

export class RouterLink extends HTMLElement {

	/**
	 * The path of the routing.
	 */
	set path (value: string) {
		this.setAttribute("path", value);
	}

	get path (): string {
		return this.getAttribute("path");
	}

	/**
	 * Whether the component is disabled or not.
	 */
	get disabled (): boolean {
		return Boolean(this.getAttribute("disabled"));
	}

	set disabled (value: boolean) {
		if (value) {
			this.setAttribute("disabled", "true");
		} else {
			this.removeAttribute("disabled");
		}
	}

	constructor () {
		super();

		this.navigate = this.navigate.bind(this);

		// Attach the template
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}

	/**
	 * Hook up listeners.
	 */
	connectedCallback () {
		this.addEventListener("click", this.navigate);
	}

	/**
	 * Tear down listeners.
	 */
	disconnectedCallback () {
		this.removeEventListener("click", this.navigate);
	}

	/**
	 * Navigates to the specified path.
	 */
	navigate () {
		if (this.path == null) throw new Error("The RouterLink needs a path set.");
		if (this.disabled) return;

		Router.pushState(null, null, this.path);
	}

}

window.customElements.define("router-link", RouterLink);