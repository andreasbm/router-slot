import { html, LitElement, TemplateResult } from "lit";
import { GLOBAL_ROUTER_EVENTS_TARGET } from "../../../../../lib/config";
import { WillChangeStateEvent } from "../../../../../lib/model";
import { sharedStyles } from "../../../styles";

export default class EditComponent extends LitElement {
	static styles = [sharedStyles];

	connectedCallback () {
		super.connectedCallback();
		const confirmNavigation = (e: WillChangeStateEvent) => {
			console.log(e);

			// Check if we should navigate away from this page
			if (!confirm("You have unsafed data. Do you wish to discard it?")) {
				e.preventDefault();
				return;
			}

			GLOBAL_ROUTER_EVENTS_TARGET.removeEventListener("willchangestate", confirmNavigation);
		};
		GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("willchangestate", confirmNavigation);
	}

	render (): TemplateResult {
		return html`
			<p>EditComponent</p>
		`;
	}
}

window.customElements.define("edit-component", EditComponent);
