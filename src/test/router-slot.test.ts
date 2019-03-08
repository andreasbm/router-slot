import { customElement, html, LitElement, PropertyValues, query } from "lit-element";
import { IRoute } from "../lib/model";
import { RouterSlot } from "../lib/router-slot";
import "../lib/router-slot";
import { ensureHistoryEvents } from "../lib/util/history";
import { traverseRouterTree } from "../lib/util/router";
import { queryParentRouterSlot } from "../lib/util/shadow";
import { currentPath } from "../lib/util/url";
import { clearHistory } from "./test-helpers";

class RouterElement extends LitElement {
	@query("#slot") $slot: RouterSlot;

	protected routes!: IRoute[];

	firstUpdated (props: PropertyValues) {
		super.firstUpdated(props);
		this.$slot.add(this.routes);
	}

	render () {
		return html`
			<router-slot id="slot"></router-slot>
		`;
	}
}

@customElement("leaf-element")
class LeafElement extends LitElement {
	render () {
		return html`
			<span>Leaf</span>
		`;
	}
}

const pageOneRoutes: IRoute[] = [
	{
		path: "leaf-one",
		component: LeafElement
	},
	{
		path: "**",
		redirectTo: "leaf-one"
	}
];

@customElement("page-one")
class PageOne extends RouterElement {
	routes = pageOneRoutes;
}

const pageTwoRoutes: IRoute[] = [
	{
		path: "leaf-two",
		component: LeafElement
	},
	{
		path: "**",
		redirectTo: "leaf-two"
	}
];

@customElement("page-two")
class PageTwo extends RouterElement {
	routes = pageTwoRoutes;
}

// Main routes
const mainRoutes: IRoute[] = [
	{
		path: "one",
		component: PageOne
	},
	{
		path: "two/:id",
		component: PageTwo
	},
	{
		path: "**",
		redirectTo: "one"
	}
];

@customElement("root-element")
class RootElement extends RouterElement {
	routes = mainRoutes;
}

describe("router-slot", () => {
	const {expect} = chai;
	let $root!: RootElement;

	before(() => {
		ensureHistoryEvents();

		const $base = document.createElement("base");
		$base.href = `/`;
		document.head.appendChild($base);
	});
	beforeEach(() => {
		document.body.innerHTML = `
			<root-element></root-element>
		`;

		$root = document.body.querySelector<RootElement>("root-element")!;
	});
	after(() => {
		clearHistory();
	});

	// TODO: Listen for events and do this more elegant
	function waitForNavigation (cb: (() => void)) {
		setTimeout(cb, 100);
	}

	it("should redirect properly down the router tree", () => {
		waitForNavigation(() => {
			expect(currentPath()).to.equal(`/one/leaf-one/`);
		});
	});

	it("should have correct isRoot value", (done) => {
		waitForNavigation(() => {
			const $pageOne = $root.$slot.querySelector<PageOne>("page-one")!;

			expect($root.$slot.isRoot).to.be.true;
			expect($pageOne.$slot.isRoot).to.be.false;
			done();
		});
	});

	it("should find correct parent router slots", (done) => {
		waitForNavigation(() => {
			const $pageOne = $root.$slot.querySelector<PageOne>("page-one")!;
			const $leafElement = $pageOne.$slot.querySelector<LeafElement>("leaf-element")!;

			expect(queryParentRouterSlot($leafElement)).to.equal($pageOne.$slot);
			expect(queryParentRouterSlot($pageOne)).to.equal($root.$slot);
			done();
		});
	});

	it("should construct correct router tree", (done) => {
		waitForNavigation(() => {
			const $pageOne = $root.$slot.querySelector<PageOne>("page-one")!;

			expect(traverseRouterTree($pageOne.$slot).depth).to.equal(2);
			expect(traverseRouterTree($root.$slot).depth).to.equal(1);
			done();
		});
	});

	it("should pick up params", (done) => {
		waitForNavigation(() => {
			const param = "1234";
			history.pushState(null, "", `two/${param}`);

			waitForNavigation(() => {
				expect(currentPath()).to.equal(`/two/${param}/leaf-two/`);
				expect(JSON.stringify($root.$slot.match!.params)).to.equal(JSON.stringify({id: param}));
				done();
			});
		});
	});
});
