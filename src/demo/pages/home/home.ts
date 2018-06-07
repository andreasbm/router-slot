import { IPage, Router, RouterComponent } from "../../../lib";
import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class HomeComponent extends LitElement implements IPage {

	parentRouter: RouterComponent;

	connectedCallback () {
		super.connectedCallback();

		const $router: RouterComponent = this.shadowRoot.querySelector("router-component");
		$router.setup([
			{
				path: /.*\/secret.*/,
				component: () => import("./secret/secret")
			},
			{
				path: /.*\/user.*/,
				component: () => import("./user/user")
			},
			{
				path: "",
				redirectTo: "home/secret"
			}
		], this.parentRouter).then();

		console.log(Router.params);
	}

	private logout () {
		localStorage.clear();
		Router.replaceState(null, null, "login");
	}

	_render (): TemplateResult {
		return html`
<p>HomeComponent</p>
<p></p>
<button on-click="${_ => this.logout()}">Logout</button>
<router-link path="home/secret"><button>Go to SecretComponent</button></router-link>
<router-link path="home/user"><button>Go to UserComponent</button></router-link>
<div id="child">
	<router-component></router-component>
</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
