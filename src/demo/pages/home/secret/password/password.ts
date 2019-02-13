import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { IPage, IResolverRoute, IWebRouter } from "../../../../../lib/model";
import { sharedStyles } from "../../../styles";
import { data } from "../data";

export default class PasswordComponent extends LitElement implements IPage {
	parentRouter: IWebRouter;

	firstUpdated () {
		super.connectedCallback();

		const $router = <IWebRouter>this.shadowRoot!.querySelector("web-router");
		$router.setup([
			{
				path: "dialog",
				resolve: ((router: IWebRouter, route: IResolverRoute) => {
					alert("DIALOG :D");
					console.log("DIALOG! :D", router, route);
					history.replaceState(null, "", "/home/secret/password");
				})
			}
		], this.parentRouter).then();
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
