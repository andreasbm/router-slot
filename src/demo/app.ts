import { currentPath, ChangeRouteEvent, IRoute, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationStartEvent, PushStateEvent, WebRouter, WebRouterEventKind, GlobalWebRouterEventKind, NavigationSuccessEvent, ReplaceStateEvent } from "../lib";

import "./../lib/router-link";

/**
 * Asserts that the user is authenticated.
 * @param router
 * @param {IRoute} route
 * @returns {boolean}
 */
function sessionGuard (router: WebRouter, route: IRoute) {

	if (localStorage.getItem("session") == null) {
		history.replaceState(null, "", "login");
		return false;
	}

	return true;
}

// Setup the router
customElements.whenDefined("web-router").then(async () => {
	const router = <WebRouter>document.querySelector("web-router");

	let hasInitialized = false;
	router.addEventListener(WebRouterEventKind.RouteChange, (e: ChangeRouteEvent) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	window.addEventListener(GlobalWebRouterEventKind.PushState, (e: PushStateEvent) => {
		console.log("On push state", `'${currentPath()}'`);
	});

	window.addEventListener(GlobalWebRouterEventKind.ReplaceState, (e: ReplaceStateEvent) => {
		console.log("On replace state", currentPath());
	});

	window.addEventListener(GlobalWebRouterEventKind.PopState, (e: PopStateEvent) => {
		console.log("On pop state", currentPath(), e.state);
	});

	window.addEventListener(GlobalWebRouterEventKind.NavigationStart, (e: NavigationStartEvent) => {
		console.log("Navigation start", e.detail);
	});

	window.addEventListener(GlobalWebRouterEventKind.NavigationEnd, (e: NavigationEndEvent) => {
		window.scrollTo({top: 0, left: 0, behavior: "smooth"});
		console.log("Navigation end", e.detail);
	});

	window.addEventListener(GlobalWebRouterEventKind.NavigationSuccess, (e: NavigationSuccessEvent) => {
		console.log("Navigation success", e.detail);
	});

	window.addEventListener(GlobalWebRouterEventKind.NavigationCancel, (e: NavigationCancelEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	window.addEventListener(GlobalWebRouterEventKind.NavigationError, (e: NavigationErrorEvent) => {
		console.log("Navigation failed", e.detail);
	});

	await router.setup([
		{
			path: "login",
			component: () => import("./pages/login/login")
		},
		{
			path: "home",
			component: () => import("./pages/home/home"),
			guards: [sessionGuard]
		},
		{
			path: "**",
			redirectTo: "home"
		}
	]);

});
