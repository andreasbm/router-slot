import { IPage, Router } from "../../../../lib/router";
import { html, LitElement, TemplateResult } from "../../../base";

export default class SecretComponent extends LitElement implements IPage {

	parentRouter: Router;

	connectedCallback () {
		super.connectedCallback();

		const $router: Router = this.shadowRoot.querySelector("router-component");
		$router.setup([
			{
				path: new RegExp("home/secret/code"),
				loader: import("./code/code")
			},
			{
				path: new RegExp("home/secret.*"),
				loader: import("./password/password")
			},
		], this.parentRouter).then();
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
<p>SecretComponent</p>
<router-link path="home/secret/code"><button>Go to CodeComponent</button></router-link>
<router-link path="home/secret"><button>Go to PasswordComponent</button></router-link>
<div id="child">
	<router-component></router-component>
</div>
		`;
	}

}

window.customElements.define("secret-component", SecretComponent);
