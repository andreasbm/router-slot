import { html, LitElement, TemplateResult } from "../../../../base";

export default class PasswordComponent extends LitElement {
	render (): TemplateResult {
		return html`
<p>PasswordComponent</p>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
