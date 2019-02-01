import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../styles";

export default class UserComponent extends LitElement {

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	_render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>UserComponent</p>
		`;
	}

}

window.customElements.define("user-component", UserComponent);
