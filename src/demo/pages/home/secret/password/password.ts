import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../../styles";
import { data } from "../data";

export default class PasswordComponent extends LitElement {
	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>PasswordComponent</p>
			<span>Resolved password: ${data.secretPassword}</span>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
