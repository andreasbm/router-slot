import { currentPath, ChangeRouteEvent, IRoute, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationStartEvent, PushStateEvent, RouterComponent, RouterComponentEventKind, RouterEventKind } from "../lib";

import "./../lib/router-link";

/**
 * Asserts that the user is authenticated.
 * @param router
 * @param {IRoute} route
 * @returns {boolean}
 */
function sessionGuard (router: RouterComponent, route: IRoute) {

	if (localStorage.getItem("session") == null) {
		history.replaceState(null, "", "login");
		return false;
	}

	return true;
}

// Setup the router
customElements.whenDefined("router-component").then(async () => {
	const router = <RouterComponent>document.querySelector("router-component");

	let hasInitialized = false;
	router.addEventListener(RouterComponentEventKind.RouteChange, (e: ChangeRouteEvent) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	window.addEventListener(RouterEventKind.PushState, (e: PushStateEvent) => {
		console.log("On push state", `'${currentPath()}'`);
	});

	window.addEventListener(RouterEventKind.PopState, (e: PopStateEvent) => {
		console.log("On pop state", currentPath(), e.state);
	});

	window.addEventListener(RouterEventKind.NavigationStart, (e: NavigationStartEvent) => {
		console.log("Navigation start", e.detail);
	});

	window.addEventListener(RouterEventKind.NavigationEnd, (e: NavigationEndEvent) => {
		window.scrollTo({top: 0, left: 0, behavior: "smooth"});
		console.log("Navigation end", e.detail);
	});

	window.addEventListener(RouterEventKind.NavigationCancel, (e: NavigationCancelEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	window.addEventListener(RouterEventKind.NavigationError, (e: NavigationErrorEvent) => {
		console.log("Navigation failed", e.detail);
	});

	await router.setup([
		{
			path: /^login.*/,
			component: () => import("./pages/login/login")
		},
		{
			path: /^home.*/,
			component: () => import("./pages/home/home"),
			guards: [sessionGuard]
		},
		{
			path: /.*/,
			redirectTo: "home"
		}
	]);

});
