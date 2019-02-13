import { LitElement, PropertyValues } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { IPage, IWebRouter, query, WebRouter } from "../../../lib";
import { sharedStyles } from "../styles";

export default class HomeComponent extends LitElement implements IPage {

	parentRouter: IWebRouter;

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		const $router = <WebRouter>this.shadowRoot!.querySelector("web-router");
		$router.setup([
			{
				path: "secret",
				component: () => import("./secret/secret")
			},
			{
				path: "user/:user/dashboard/:dashId",
				component: () => import("./user/user")
			},
			{
				path: "**",
				redirectTo: "secret"
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
			<router-link path="secret"><button>Go to SecretComponent</button></router-link>
			<router-link path="user/@andreasbm/dashboard/123"><button>Go to UserComponent</button></router-link>
			<div id="child">
				<web-router></web-router>
			</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
