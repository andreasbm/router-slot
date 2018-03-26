import { Router } from "../../../lib/router";
import { html, LitElement, TemplateResult } from "../../base";

export default class LoginComponent extends LitElement {

	private login () {
		localStorage.setItem("session", "secretToken");
		Router.replaceState(null, null, "");
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
<p>Login Component</p>
<button on-click="${_ => this.login()}">Login</button>
		`;
	}

}

window.customElements.define("login-component", LoginComponent);
