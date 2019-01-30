import { PropertyValues } from "@polymer/lit-element/src/lib/updating-element";
import { IPage, RouterComponent } from "../../../../lib";
import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class SecretComponent extends LitElement implements IPage {

	parentRouter: RouterComponent;

	firstUpdated(changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		console.log(this.parentRouter.currentRoute);

		const $router = <RouterComponent>this.shadowRoot!.querySelector("router-component");
		$router.setup([
			{
				path: /.*\/code/,
				component: () => import("./code/code")
			},
			{
				path: /.*/,
				component: () => import("./password/password")
			}
		], this.parentRouter).then();
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
			<p>SecretComponent</p>
			<router-link path="home/secret/code"><button>Go to CodeComponent</button></router-link>
			<router-link path="home/secret"><button>Go to PasswordComponent</button></router-link>
			<div id="child">
				<router-component></router-component>
			</div>
		`;
	}

}

window.customElements.define("secret-component", SecretComponent);
