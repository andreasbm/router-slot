import { html, LitElement, TemplateResult } from "lit";
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
