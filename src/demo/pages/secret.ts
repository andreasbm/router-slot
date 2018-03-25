import { html, LitElement, TemplateResult } from "../base";

export default class SecretComponent extends LitElement {

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
<p>SecretComponent</p>
		`;
	}

}

window.customElements.define("secret-component", SecretComponent);
