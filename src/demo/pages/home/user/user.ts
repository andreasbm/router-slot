import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class UserComponent extends LitElement {

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	_render (): TemplateResult {
		return html`
<p>UserComponent</p>
		`;
	}

}

window.customElements.define("user-component", UserComponent);
