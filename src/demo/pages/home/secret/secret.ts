import { html, LitElement, PropertyValues } from "lit-element";
import { TemplateResult } from "lit-html";
import { IRouterSlot, PageComponent, query, RoutingInfo } from "../../../../lib";
import { ROUTER_SLOT_TAG_NAME } from "../../../../lib/config";
import { sharedStyles } from "../../styles";
import { data } from "./data";

function resolveSecretPasswordGuard (): Promise<boolean> {
	return new Promise(res => {
		if (data.secretPassword != null) res(true);
		setTimeout(() => {
			data.secretPassword = `1234`;
			res(true);
		}, 1000);
	});
}

export default class SecretComponent extends LitElement {

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		const $routerSlot = this.shadowRoot!.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;
		$routerSlot.add([
			{
				path: "code",
				component: () => import("./code/code"),
				setup: (component: PageComponent, info: RoutingInfo) => {
					component.style.color = query()["yellow"] != null ? `yellow` : `blue`;
				}
			},
			{
				path: "password",
				component: () => import("./password/password"),
				guards: [resolveSecretPasswordGuard]
			},
			{
				path: "**",
				redirectTo: "code",
				preserveQuery: true
			}
		]);
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>SecretComponent</p>
			<router-link path="code"><button>Go to CodeComponent</button></router-link>
			<router-link path="password"><button>Go to PasswordComponent (1sec delay)</button></router-link>
			<div id="child">
				<router-slot></router-slot>
			</div>
		`;
	}

}

window.customElements.define("secret-component", SecretComponent);
