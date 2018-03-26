import { html, LitElement, TemplateResult } from "../../../base";

export default class UserComponent extends LitElement {

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
<p>UserComponent</p>
		`;
	}

}

window.customElements.define("user-component", UserComponent);
