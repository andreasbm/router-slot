import { ChangeRouteEvent, currentPath, GlobalRouterEventKind, IRouterSlot, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationStartEvent, NavigationSuccessEvent, PushStateEvent, ReplaceStateEvent, RoutingInfo, RouterEventKind } from "../lib";
import { ROUTER_SLOT_TAG_NAME } from "../lib/config";

import "./../lib/router-link";

/**
 * Asserts that the user is authenticated.
 */
function sessionGuard () {

	if (localStorage.getItem("session") == null) {
		history.replaceState(null, "", "login");
		return false;
	}

	return true;
}

// Setup the router
customElements.whenDefined(ROUTER_SLOT_TAG_NAME).then(async () => {
	const routerSlot = document.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;

	let hasInitialized = false;
	routerSlot.addEventListener(RouterEventKind.RouteChange, (e: ChangeRouteEvent) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	window.addEventListener(GlobalRouterEventKind.PushState, (e: PushStateEvent) => {
		console.log("On push state", `'${currentPath()}'`);
	});

	window.addEventListener(GlobalRouterEventKind.ReplaceState, (e: ReplaceStateEvent) => {
		console.log("On replace state", currentPath());
	});

	window.addEventListener(GlobalRouterEventKind.PopState, (e: PopStateEvent) => {
		console.log("On pop state", currentPath(), e.state);
	});

	window.addEventListener(GlobalRouterEventKind.NavigationStart, (e: NavigationStartEvent) => {
		console.log("Navigation start", e.detail);
	});

	window.addEventListener(GlobalRouterEventKind.NavigationEnd, (e: NavigationEndEvent) => {
		window.scrollTo({top: 0, left: 0, behavior: "smooth"});
		console.log("Navigation end", e.detail);
	});

	window.addEventListener(GlobalRouterEventKind.NavigationSuccess, (e: NavigationSuccessEvent) => {
		console.log("Navigation success", e.detail);
	});

	window.addEventListener(GlobalRouterEventKind.NavigationCancel, (e: NavigationCancelEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	window.addEventListener(GlobalRouterEventKind.NavigationError, (e: NavigationErrorEvent) => {
		console.log("Navigation failed", e.detail);
	});

	await routerSlot.add([
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

	history.pushState(null, "", "/");
});
