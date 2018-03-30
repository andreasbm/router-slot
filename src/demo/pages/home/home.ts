import { IPage, Router, RouterComponent } from "../../../lib";
import { html, LitElement, TemplateResult } from "../../base";

export default class HomeComponent extends LitElement implements IPage {

	parentRouter: RouterComponent;

	connectedCallback () {
		super.connectedCallback();

		const $router: RouterComponent = this.shadowRoot.querySelector("router-component");
		$router.setup([
			{
				path: new RegExp("home/secret.*"),
				component: (import("./secret/secret"))
			},
			{
				path: new RegExp("home/user.*"),
				component: (import("./user/user"))
			},
			{
				path: new RegExp(""),
				redirectTo: "home/secret"
			}
		], this.parentRouter).then();
	}

	private logout () {
		localStorage.clear();
		Router.replaceState(null, null, "login");
	}

	render (): TemplateResult {
		return html`
<p>HomeComponent</p>
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
