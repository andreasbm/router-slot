import { basePath, currentPath, query } from "../lib/util/url";
import { clearHistory } from "./test-helpers";

describe("url", () => {
	const {expect} = chai;
	let $base: HTMLBaseElement;

	before(() => {
		$base = document.createElement("base");
		document.head.appendChild($base);
	});
	beforeEach(async () => {
		$base.href = `/`;
	});
	after(() => {
		clearHistory();
	});

	it("[currentPath] should return the correct current path", () => {
		history.pushState(null, "", "");
		expect(currentPath()).to.equal(`/`);

		history.pushState(null, "", "/");
		expect(currentPath()).to.equal(`/`);

		history.pushState(null, "", "cool");
		expect(currentPath()).to.equal(`/cool/`);

		history.pushState(null, "", "login/forgot-password");
		expect(currentPath()).to.equal(`/login/forgot-password/`);
	});

	it("[basepath] should return correct base path", () => {
		const basePaths = [
			[`/my-path`, `/my-path/`],
			[`/my-path/`, `/my-path/`]
		];

		for (const [path, expected] of basePaths) {
			$base.href = path;
			expect(basePath()).to.equal(expected);
		}
	});

	it("[query] should return the correct query", () => {
		history.pushState(null, "", "?key1=value1&key2=value2");
		expect(JSON.stringify(query())).to.equal(`{"key1":"value1","key2":"value2"}`);
	});
});
