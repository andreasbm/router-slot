import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import "weightless/dialog";
import "weightless/title";
import { ROUTER_SLOT_TAG_NAME } from "../../lib/config";
import { IRouterSlot } from "../../lib/model";
import { sharedStyles } from "../pages/styles";

export default class DialogComponent extends LitElement {
	static styles = [sharedStyles];

	@property({type: Object}) parent: IRouterSlot | null = null;

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		const $routerSlot = this.shadowRoot!.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;
		if (this.parent != null) {
			$routerSlot.parent = this.parent;
		}

		$routerSlot.add([
			{
				path: "step-one",
				component: () => import("./step-one/step-one")
			},
			{
				path: "step-two",
				component: () => import("./step-two/step-two")
			},
			{
				path: "**",
				redirectTo: "step-one"
			}
		]);
	}

	private close () {
		this.dispatchEvent(new CustomEvent("close"));
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
			<wl-dialog open fixed backdrop id="content" @didHide="${this.close}" size="large">
			   <wl-title level="3" slot="header">This is a dialog</wl-title>
			   <div slot="content">
					<router-link path="step-one">Go to StepOneComponent</router-link>
					<br />
					<router-link path="step-two">Go to StepTwoComponent</router-link>
					<router-slot id="dialog"></router-slot>
			   </div>
			   <div slot="footer">
					<wl-button @click="${this.close}" inverted flat>Close dialog</wl-button>
			   </div>
			</wl-dialog>
		`;
	}

}

window.customElements.define("dialog-component", DialogComponent);
