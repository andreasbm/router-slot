import { ensureAnchorHistory } from "../lib/util/anchor";
import { ensureHistoryEvents } from "../lib/util/history";
import { path } from "../lib/util/url";
import { addBaseTag, clearHistory } from "./test-helpers";

const testPath = `/about`;

describe("anchor", () => {
	const {expect} = chai;
	let $anchor!: HTMLAnchorElement;

	before(() => {
		ensureHistoryEvents();
		ensureAnchorHistory();
		addBaseTag();
	});
	beforeEach(() => {
		document.body.innerHTML = `
			<a id="anchor" href="${testPath}">Anchor</a>
		`;

		$anchor = document.body.querySelector<HTMLAnchorElement>("#anchor")!;
	});
	after(() => {
		clearHistory();
	});

	it("[ensureAnchorHistory] should change anchors to use history API", done => {
		window.addEventListener("pushstate", () => {
			expect(path({end: false})).to.equal(testPath);
			done();
		});

		$anchor.click();
	});

	it("[ensureAnchorHistory] should not change anchors with target _blank", done => {
		window.addEventListener("pushstate", () => {
			expect(true).to.equal(false);
		});

		$anchor.target = "_blank";
		$anchor.click();
		done();
	});

	it("[ensureAnchorHistory] should not change anchors with [data-router-slot]='disabled'", done => {
		window.addEventListener("pushstate", () => {
			expect(true).to.equal(false);
		});

		$anchor.setAttribute("data-router-slot", "disabled");
		$anchor.click();
		done();
	});
});
