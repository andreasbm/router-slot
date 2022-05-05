import { html, LitElement, TemplateResult } from "lit";
import { sharedStyles } from "../../pages/styles";

export default class StepTwoComponent extends LitElement {
	static styles = [sharedStyles];
	render (): TemplateResult {
		return html`
			<p>Step 2</p>
		`;
	}
}

window.customElements.define("step-two-component", StepTwoComponent);
