import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../../styles";

export default class EditComponent extends LitElement {
	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>EditComponent</p>
		`;
	}
}

window.customElements.define("edit-component", EditComponent);
