import { css, html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../styles";
import "weightless/card";
import "weightless/button";

export default class LoginComponent extends LitElement {

	static styles = [sharedStyles, css`
		#container {
			margin: 70px auto;
			max-width: 700px;
			width: 100%;
			padding: 30px;
		}
		
		h2 {
			margin: 0;
		}
	`];

	private login () {
		localStorage.setItem("session", "secretToken");
		history.replaceState(null, "", "/");
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
			<wl-card id="container">
				<h2>Login to continue</h2>
				<p>The routes are guarded behind a login. In order to get to the app you need to have a session.</p>
				<wl-button @click="${() => this.login()}">Login</wl-button>
			</wl-card>
		`;
	}

}

window.customElements.define("login-component", LoginComponent);
