import { html, LitElement, property, PropertyValues } from "lit-element";
import { TemplateResult } from "lit-html";
import { ROUTER_SLOT_TAG_NAME } from "../../lib/config";
import { IRouterSlot } from "../../lib/model";
import { sharedStyles } from "../pages/styles";

export default class DialogComponent extends LitElement {
	static styles = [sharedStyles];

	@property({type: Object}) parent: IRouterSlot | null;

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
		this.dispatchEvent(new CustomEvent("close"))
	}

	/**
	 * Renders the component.
	 * @returns {TemplateResult}
	 */
	render (): TemplateResult {
		return html`
			<style>
				:host {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 123456;
				}
				
				#backdrop {
					background: rgba(0, 0, 0, 0.6);
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
				}
				
				#content {
					background: white;
					position: relative;
					z-index: 1;
					padding: 10px;
					width: 200px;
					height: 200px;
				}
			</style>
			<div id="backdrop" @click="${this.close}"></div>
			<div id="content">
				<p>Dialog</p>
				<router-link path="step-one">Go to StepOneComponent</router-link>
				<br />
				<router-link path="step-two">Go to StepTwoComponent</router-link>
				<router-slot id="dialog"></router-slot>
				<button @click="${this.close}">Close dialog</button>
			</div>
		`;
	}

}

window.customElements.define("dialog-component", DialogComponent);
