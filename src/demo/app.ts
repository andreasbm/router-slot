import {
	INavigationCancelEvent,
	INavigationEndEvent, INavigationErrorEvent,
	INavigationStartEvent,
	IOnPushStateEvent,
	IRoute,
	Router,
	RouterComponent,
	RouterEventKind
} from "../lib";
import {IPopStateEvent} from "../lib/router";
import {RouterComponentEventKind} from "../lib/router-component";
import HomeComponent from "./pages/home/home";

export * from "./../lib/router-link";

/**
 * Asserts that the user is authenticated.
 * @param router
 * @param {IRoute} route
 * @returns {boolean}
 */
function sessionGuard (router: RouterComponent, route: IRoute) {

	if (localStorage.getItem("session") == null) {
		Router.replaceState(null, null, "login");
		return false;
	}

	return true;
}

// Setup the router
customElements.whenDefined("router-component").then(async () => {
	const router: RouterComponent = document.querySelector("router-component");

	let hasInitialized = false;
	router.addEventListener(RouterComponentEventKind.DidChangeRoute, (e) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	Router.addEventListener(RouterEventKind.OnPushState, (e: IOnPushStateEvent) => {
		console.log("On push state", `'${Router.currentPath}'`);
	});

	Router.addEventListener(RouterEventKind.PopState, (e: IPopStateEvent) => {
		console.log("On pop state", Router.currentPath);
	});

	Router.addEventListener(RouterEventKind.NavigationStart, (e: INavigationStartEvent) => {
		console.log("Navigation start", e.detail);
	});

	Router.addEventListener(RouterEventKind.NavigationEnd, (e: INavigationEndEvent) => {
		console.log("Navigation end", e.detail);
	});

	Router.addEventListener(RouterEventKind.NavigationCancel, (e: INavigationCancelEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	Router.addEventListener(RouterEventKind.NavigationError, (e: INavigationErrorEvent) => {
		console.log("Navigation failed", e.detail);
	});

	await router.setup([
		{
			path: new RegExp("login.*"),
			component: () => import("./pages/login/login")
		},
		{
			path: /home.*/,
			component: HomeComponent,
			guards: [sessionGuard]
		},
		{
			path: /.*/,
			redirectTo: "home"
		}
	]);

});
