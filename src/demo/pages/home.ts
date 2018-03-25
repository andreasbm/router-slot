import { IPage, Router } from "../../lib/router";
import { html, LitElement, TemplateResult } from "../base";

export default class HomeComponent extends LitElement implements IPage {

	parentRouter: Router;

	connectedCallback () {
		super.connectedCallback();

		const $router: Router = this.shadowRoot.querySelector("router-component");
		$router.parentRouter = this.parentRouter;
		$router.createRoutes([
			{
				path: new RegExp("home/secret.*"),
				loader: (import("./secret"))
			},
			{
				path: new RegExp("home/user.*"),
				loader: (import("./user"))
			},
			{
				path: new RegExp(""),
				redirectTo: "home/secret"
			}
		]).then();
	}

	private logout () {
		localStorage.clear();
		Router.replaceState(null, null, "login");
	}

	render (): TemplateResult {
		return html`
<p>HomeComponent</p>
<button on-click="${_ => this.logout()}">Logout</button>
<button on-click="${_ => Router.pushState(null, null, "home/secret")}">Go to SecretComponent</button>
<button on-click="${_ => Router.pushState(null, null, "home/user")}">Go to UserComponent</button>
<div id="child">
	<router-component></router-component>
</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
