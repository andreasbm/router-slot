import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class CodeComponent extends LitElement {
	_render (): TemplateResult {
		return html`
<p>CodeComponent</p>
		`;
	}
}

window.customElements.define("code-component", CodeComponent);
