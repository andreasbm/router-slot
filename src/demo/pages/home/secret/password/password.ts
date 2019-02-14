import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { IResolverRoute, IWebRouter } from "../../../../../lib/model";
import { sharedStyles } from "../../../styles";
import { data } from "../data";

export default class PasswordComponent extends LitElement {

	firstUpdated () {
		super.connectedCallback();

		const $router = this.shadowRoot!.querySelector<IWebRouter>("web-router")!;
		$router.add([
			{
				path: "dialog",
				resolve: ((router: IWebRouter, route: IResolverRoute) => {
					alert("DIALOG");
					console.log("DIALOG!", router, route);
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
			
			<web-router></web-router>
			<router-link path="/home/secret/password/dialog"><button>Dialog</button></router-link>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
