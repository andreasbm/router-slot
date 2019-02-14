import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { ROUTER_SLOT_TAG_NAME } from "../../../../../lib/config";
import { IRouterSlot, RoutingInfo } from "../../../../../lib/model";
import { sharedStyles } from "../../../styles";
import { data } from "../data";

export default class PasswordComponent extends LitElement {

	firstUpdated () {
		super.connectedCallback();

		const $routerSlot = this.shadowRoot!.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;
		$routerSlot.add([
			{
				path: "dialog",
				resolve: (({slot, route, match}: RoutingInfo) => {
					alert("DIALOG");
					console.log("DIALOG!", slot, route, match);
					history.replaceState(null, "", "/home/secret/password");
				})
			}
		]);
	}

	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>PasswordComponent</p>
			<span>Resolved password: ${data.secretPassword}</span>
			
			<router-slot></router-slot>
			<router-link path="/home/secret/password/dialog"><button>Dialog</button></router-link>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
