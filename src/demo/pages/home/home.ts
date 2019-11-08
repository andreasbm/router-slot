import { LitElement, PropertyValues } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { GLOBAL_ROUTER_EVENTS_TARGET, IRoute, isPathActive, PageComponent, query, queryString, RoutingInfo } from "../../../lib";
import { sharedStyles } from "../styles";

const ROUTES: IRoute[] = [
	{
		path: "secret",
		component: () => import("./secret/secret")
	},
	{
		path: "user/:user/dashboard/:dashId",
		component: () => import("./user/user"),
		setup: (page: PageComponent, info: RoutingInfo) => {
			//page.userId = info.match.params.userId;
			console.log({page, info});
		}
	},
	{
		path: "**",
		redirectTo: "secret",
		preserveQuery: true
	}
];

export default class HomeComponent extends LitElement {
	static styles = [sharedStyles];

	firstUpdated (changedProperties: PropertyValues) {
		super.firstUpdated(changedProperties);

		console.log({
			query: query(),
			queryString: queryString()
		});

		GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("changestate", () => this.requestUpdate());
	}

	private logout () {
		localStorage.clear();
		history.replaceState(null, "", "/login");
	}

	render (): TemplateResult {
		return html`
			<p>HomeComponent</p>
			<p></p>
			<button @click="${() => this.logout()}">Logout</button>
			
			<a href="home/secret/code${queryString()}" ?data-active="${isPathActive("home/secret/code")}">Go to SecretComponent</a>
			<a href="home/user/@andreasbm/dashboard/123${queryString()}" ?data-active="${isPathActive("home/user/@andreasbm/dashboard/123")}">Go to UserComponent</a>
			
			<div id="child">
				<router-slot .routes="${ROUTES}"></router-slot>
			</div>
		`;
	}

}

window.customElements.define("home-component", HomeComponent);
