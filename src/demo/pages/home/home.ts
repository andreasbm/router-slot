import { LitElement, PropertyValues } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { IPage, IRouterComponent, RouterComponent } from "../../../lib";
import { query } from "../../../lib/helpers";
import { sharedStyles } from "../styles";

export default class HomeComponent extends LitElement implements IPage {

	parentRouter: IRouterComponent;

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		const $router = <RouterComponent>this.shadowRoot!.querySelector("web-router");
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

		console.log(query());
	}

	private logout () {
		localStorage.clear();
		history.replaceState(null, "", "/login");
	}

	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>HomeComponent</p>
			<p></p>
			<button @click="${() => this.logout()}">Logout</button>
			<router-link path="home/secret"><button>Go to SecretComponent</button></router-link>
			<router-link path="home/user"><button>Go to UserComponent</button></router-link>
			<div id="child">
				<web-router></web-router>
			</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
