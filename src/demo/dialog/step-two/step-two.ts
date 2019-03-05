import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { sharedStyles } from "../../pages/styles";

export default class StepTwoComponent extends LitElement {
	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>Step 2</p>
		`;
	}
}

window.customElements.define("step-two-component", StepTwoComponent);
