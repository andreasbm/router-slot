import { html, LitElement, PropertyValues } from "lit-element";
import { TemplateResult } from "lit-html";
import { IPage, WebRouter } from "../../../../lib";
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

export default class SecretComponent extends LitElement implements IPage {

	parentRouter: WebRouter;

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		console.log(this.parentRouter.route);

		const $router = <WebRouter>this.shadowRoot!.querySelector("web-router");
		$router.setup([
			{
				path: "code",
				component: () => import("./code/code")
			},
			{
				path: "password",
				component: () => import("./password/password"),
				guards: [resolveSecretPasswordGuard]
			},
			{
				path: "*",
				redirectTo: "code"
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
				<web-router></web-router>
			</div>
		`;
	}

}

window.customElements.define("secret-component", SecretComponent);
