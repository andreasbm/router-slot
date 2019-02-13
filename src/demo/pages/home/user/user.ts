import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { IPage, IWebRouter, Params } from "../../../../lib/model";
import { sharedStyles } from "../../styles";

export default class UserComponent extends LitElement implements IPage {
	parentRouter: IWebRouter;

	get params (): Params {
		return this.parentRouter.routeMatch!.params;
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		const {user, dashId} = this.params;
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>UserComponent</p>
			<p>:user = <b>${user}</b></p>
			<p>:dashId = <b>${dashId}</b></p>
		`;
	}

}

window.customElements.define("user-component", UserComponent);
