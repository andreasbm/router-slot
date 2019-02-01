import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../../styles";

export default class CodeComponent extends LitElement {
	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>CodeComponent</p>
		`;
	}
}

window.customElements.define("code-component", CodeComponent);
