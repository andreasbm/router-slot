import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../pages/styles";

export default class StepOneComponent extends LitElement {
	static styles = [sharedStyles];
	render (): TemplateResult {
		return html`
			<p>Step 1</p>
		`;
	}
}

window.customElements.define("step-one-component", StepOneComponent);
