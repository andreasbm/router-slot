import { html, LitElement, PropertyValues } from "lit-element";
import { TemplateResult } from "lit-html";
import { IPage, RouterComponent } from "../../../../lib";
import { sharedStyles } from "../../styles";
import { data } from "./data";

function resolveSecretPasswordGuard (): Promise<boolean> {
	return new Promise(res => {
		if (data.secretPassword != null) res(true);
		setTimeout(() => {
			data.secretPassword = `1234`;
			res(true);
		}, 4000);
	});
}

export default class SecretComponent extends LitElement implements IPage {

	parentRouter: RouterComponent;

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		console.log(this.parentRouter.currentRoute);

		const $router = <RouterComponent>this.shadowRoot!.querySelector("router-component");
		$router.setup([
			{
				path: /.*\/code/,
				component: () => import("./code/code")
			},
			{
				path: /.*\/password/,
				component: () => import("./password/password"),
				guards: [resolveSecretPasswordGuard]
			},
			{
				path: /.*/,
				redirectTo: "home/secret/code"
			}
		], this.parentRouter).then();
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
			<router-link path="home/secret/code"><button>Go to CodeComponent</button></router-link>
			<router-link path="home/secret/password"><button>Go to PasswordComponent</button></router-link>
			<div id="child">
				<router-component></router-component>
			</div>
		`;
	}

}

window.customElements.define("secret-component", SecretComponent);
