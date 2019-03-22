import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../../styles";

export default class EditComponent extends LitElement {
	static styles = [sharedStyles];
	render (): TemplateResult {
		return html`
			<p>EditComponent</p>
		`;
	}
}

window.customElements.define("edit-component", EditComponent);
