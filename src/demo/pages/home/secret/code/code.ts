import { html, LitElement, TemplateResult } from "../../../../base";

export default class CodeComponent extends LitElement {
	render (): TemplateResult {
		return html`
<p>CodeComponent</p>
		`;
	}
}

window.customElements.define("code-component", CodeComponent);
