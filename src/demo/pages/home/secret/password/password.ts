import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

export default class PasswordComponent extends LitElement {
	render (): TemplateResult {
		return html`
<p>PasswordComponent</p>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
