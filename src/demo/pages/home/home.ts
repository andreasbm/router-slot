import { LitElement, PropertyValues } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { IRouterSlot, query, queryString } from "../../../lib";
import { ROUTER_SLOT_TAG_NAME } from "../../../lib/config";
import { sharedStyles } from "../styles";

export default class HomeComponent extends LitElement {
	static styles = [sharedStyles];

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		console.log({
			query: query(),
			queryString: queryString()
		});

		const $routerSlot = this.shadowRoot!.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;
		$routerSlot.add([
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
				redirectTo: "secret",
				preserveQuery: true
			}
		]);

	}

	private logout () {
		localStorage.clear();
		history.replaceState(null, "", "/login");
	}

	render (): TemplateResult {
		return html`
			<p>HomeComponent</p>
			<p></p>
			<button @click="${() => this.logout()}">Logout</button>
			<router-link path="secret">Go to SecretComponent</router-link>
			<router-link path="user/@andreasbm/dashboard/123">Go to UserComponent</router-link>
			<div id="child">
				<router-slot></router-slot>
			</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
