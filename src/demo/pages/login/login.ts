import { Router } from "../../../lib";
import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class LoginComponent extends LitElement {

	private login () {
		localStorage.setItem("session", "secretToken");
		Router.replaceState(null, null, "");
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	_render (): TemplateResult {
		return html`
<p>Login Component</p>
<button on-click="${_ => this.login()}">Login</button>
		`;
	}

}

window.customElements.define("login-component", LoginComponent);
