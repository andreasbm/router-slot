import { html, LitElement } from "lit-element";
import { TemplateResult } from "lit-html";
import { GLOBAL_ROUTER_EVENTS_TARGET, ROUTER_SLOT_TAG_NAME } from "../../../../../lib/config";
import { Class, GlobalRouterEventKind, IRouterSlot, RoutingInfo } from "../../../../../lib/model";
import { addListener } from "../../../../../lib/util/events";
import { currentPath } from "../../../../../lib/util/url";
import { sharedStyles } from "../../../styles";
import { data } from "../data";

export default class PasswordComponent extends LitElement {

	firstUpdated () {
		super.connectedCallback();

		const $routerSlot = this.shadowRoot!.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;
		$routerSlot.add([
			{
				path: "dialog",
				resolve: (async ({slot, match}: RoutingInfo) => {
					const DialogComponent: Class = (await import("../../../../dialog/dialog")).default;
					const $dialog = new DialogComponent() as {parent: IRouterSlot | null} & HTMLElement;
					$dialog.parent = slot;

					function cleanup () {
						if (document.body.contains($dialog)) {
							document.body.removeChild($dialog);
						}
					}

					$dialog.addEventListener("close", () => {
						history.pushState(null, "", "/home/secret/password");
						cleanup();
					});

					const unsub = addListener(GLOBAL_ROUTER_EVENTS_TARGET, GlobalRouterEventKind.PopState, () => {
						if (!currentPath().includes("dialog")) {
							cleanup();
							unsub();
						}
					});

					document.body.appendChild($dialog);
				})
			}
		]);
	}

	/**
	 * Opens a dialog without routing inside it.
	 */
	private openDialogWithoutRouting () {
		history._pushState(null, "", `item/1234`);
		GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.PopState, close, {once: true});

		alert(`This is a dialog!`);

		GLOBAL_ROUTER_EVENTS_TARGET.removeEventListener(GlobalRouterEventKind.PopState, close);
		history._back();
	}

	render (): TemplateResult {
		return html`
			<style>
				${sharedStyles}
			</style>
			<p>PasswordComponent</p>
			<span>Resolved password: ${data.secretPassword}</span>
			
			<router-slot></router-slot>
			<router-link path="/home/secret/password/dialog"><button>Open dialog with routes</button></router-link>
			<button @click="${this.openDialogWithoutRouting}">Open dialog WITHOUT routes</button>
		`;
	}
}

window.customElements.define("password-component", PasswordComponent);
