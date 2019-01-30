import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class LoginComponent extends LitElement {

	private login () {
		localStorage.setItem("session", "secretToken");
		history.replaceState(null, "", "");
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
			<p>Login Component</p>
			<button @click="${() => this.login()}">Login</button>
		`;
	}

}

window.customElements.define("login-component", LoginComponent);
