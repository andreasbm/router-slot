import { currentPath, GlobalRouterEventKind, IRouterSlot, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationStartEvent, NavigationSuccessEvent, PushStateEvent, ReplaceStateEvent, RoutingInfo, RouterSlotEventKind, GLOBAL_ROUTER_EVENTS_TARGET, ChangeStateEvent } from "../lib";
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
	routerSlot.addEventListener(RouterSlotEventKind.ChangeState, () => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.PushState, (e: PushStateEvent) => {
		console.log("On push state", `'${currentPath()}'`);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.ReplaceState, (e: ReplaceStateEvent) => {
		console.log("On replace state", currentPath());
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.PopState, (e: PopStateEvent) => {
		console.log("On pop state", currentPath(), e.state);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.ChangeState, (e: ChangeStateEvent) => {
		console.log("On change state", currentPath());
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.NavigationStart, (e: NavigationStartEvent) => {
		console.log("Navigation start", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.NavigationEnd, (e: NavigationEndEvent) => {
		window.scrollTo({top: 0, left: 0, behavior: "smooth"});
		console.log("Navigation end", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.NavigationSuccess, (e: NavigationSuccessEvent) => {
		console.log("Navigation success", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.NavigationCancel, (e: NavigationCancelEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(GlobalRouterEventKind.NavigationError, (e: NavigationErrorEvent) => {
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
});
