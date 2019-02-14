import { LitElement, PropertyValues } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { IWebRouter, query } from "../../../lib";
import { sharedStyles } from "../styles";

export default class HomeComponent extends LitElement {

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		const $router = this.shadowRoot!.querySelector<IWebRouter>("web-router")!;
		$router.add([
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
		]);

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
