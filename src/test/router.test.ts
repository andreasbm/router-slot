import { IRoute, IRouteMatch } from "../lib/model";
import { matchRoute } from "../lib/util/router";

const component = document.createElement("div");
const TEST_CASES: {route: IRoute, path: string, expectedMatch: IRouteMatch<any> | null | any}[] = [
	{
		route: {
			path: "**",
			redirectTo: "404"
		},
		path: "wrong/path",
		expectedMatch: {
			"route": {
				"path": "**",
				"redirectTo": "404"
			},
			"match": [
				""
			],
			"params": {},
			"fragments": {
				"consumed": "",
				"rest": "wrong/path"
			}
		}
	},
	{
		route: {
			path: "home",
			component
		},
		path: "home",
		expectedMatch: {
			"route": {
				"path": "home",
				"component": {}
			},
			"match": [
				"home"
			],
			"params": {},
			"fragments": {
				"consumed": "home",
				"rest": ""
			}
		}
	},
	{
		route: {
			path: "user/:id/edit",
			component
		},
		path: "user/1234/edit",
		expectedMatch: {
			"route": {
				"path": "user/:id/edit",
				"component": {}
			},
			"match": [
				"user/1234/edit",
				"1234"
			],
			"params": {
				"id": "1234"
			},
			"fragments": {
				"consumed": "user/1234/edit",
				"rest": ""
			}
		}
	},
	{
		route: {
			path: "",
			component
		},
		path: "test",
		expectedMatch: {
			"route": {
				"path": "",
				"component": {}
			},
			"match": [
				""
			],
			"params": {},
			"fragments": {
				"consumed": "",
				"rest": "test"
			}
		}
	},
	{
		route: {
			path: "",
			component
		},
		path: "/test",
		expectedMatch: {
			"route": {
				"path": "",
				"component": {}
			},
			"match": [
				""
			],
			"params": {},
			"fragments": {
				"consumed": "",
				"rest": "test"
			}
		}
	},
	{
		route: {
			path: "",
			component
		},
		path: "test",
		expectedMatch: {
			"route": {
				"path": "",
				"component": {}
			},
			"match": [
				""
			],
			"params": {},
			"fragments": {
				"consumed": "",
				"rest": "test"
			}
		}
	},
	{
		route: {
			path: "",
			pathMatch: "full",
			component
		},
		path: "test",
		expectedMatch: null
	},
	{
		route: {
			path: "overview",
			pathMatch: "suffix",
			component
		},
		path: "home/overview",
		expectedMatch: {
			"route": {
				"path": "overview",
				"pathMatch": "suffix",
				"component": {},
			},
			"match": [
				"home/overview"
			],
			"params": {},
			"fragments": {
				"consumed": "home/overview",
				"rest": ""
			}
		}
	},
	{
		route: {
			path: "manage",
			pathMatch: "fuzzy",
			component
		},
		path: "users/manage/invite",
		expectedMatch: {
			"route": {
				"path": "manage",
				"pathMatch": "fuzzy",
				"component": {}
			},
			"match": [
				"users/manage/invite"
			],
			"params": {},
			"fragments": {
				"consumed": "users/manage/invite",
				"rest": ""
			}
		}
	},
];

describe("router", () => {
	const {expect} = chai;

	it("[matchRoute] should match the correct route", () => {
		for (const {route, path, expectedMatch} of TEST_CASES) {
			const match = matchRoute(route, path);
			expect(JSON.stringify(match)).to.equal(JSON.stringify(expectedMatch));
		}
	});
});
