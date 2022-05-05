import { html, LitElement, TemplateResult } from "lit";
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
