import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { GLOBAL_ROUTER_EVENTS_TARGET } from "../../../../../lib/config";
import { GlobalRouterEventKind, WillChangeStateEvent } from "../../../../../lib/model";
import { sharedStyles } from "../../../styles";

export default class EditComponent extends LitElement {
	static styles = [sharedStyles];

	connectedCallback () {
		super.connectedCallback();
		const confirmNavigation = (e: WillChangeStateEvent) => {

			// Check if we should navigate away from this page
			if (!confirm("You have unsafed data. Do you wish to discard it?")) {
				e.preventDefault();
				return;
			}

			GLOBAL_ROUTER_EVENTS_TARGET.removeEventListener(GlobalRouterEventKind.WillChangeState, confirmNavigation);
		};
		GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.WillChangeState, confirmNavigation);
	}

	render (): TemplateResult {
		return html`
			<p>EditComponent</p>
		`;
	}
}

window.customElements.define("edit-component", EditComponent);
