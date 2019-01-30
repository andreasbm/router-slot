import { LitElement, PropertyValues } from "@polymer/lit-element";
import { html, TemplateResult } from "lit-html";
import { IPage, IRouterComponent, RouterComponent } from "../../../lib";
import { params } from "../../../lib/helpers";

export default class HomeComponent extends LitElement implements IPage {

	parentRouter: IRouterComponent;

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		const $router = <RouterComponent>this.shadowRoot!.querySelector("router-component");
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
				path: /.*/,
				redirectTo: "home/secret"
			}
		], this.parentRouter).then();

		console.log(params());
	}

	private logout () {
		localStorage.clear();
		history.replaceState(null, "", "login");
	}

	render (): TemplateResult {
		return html`
			<p>HomeComponent</p>
			<p></p>
			<button @click="${() => this.logout()}">Logout</button>
			<router-link path="home/secret"><button>Go to SecretComponent</button></router-link>
			<router-link path="home/user"><button>Go to UserComponent</button></router-link>
			<div id="child">
				<router-component></router-component>
			</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
