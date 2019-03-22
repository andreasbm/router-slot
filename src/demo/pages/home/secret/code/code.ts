import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../../styles";

export default class CodeComponent extends LitElement {
	static styles = [sharedStyles];
	render (): TemplateResult {
		return html`
			<p>CodeComponent</p>
		`;
	}
}

window.customElements.define("code-component", CodeComponent);
