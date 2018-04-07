import { IRoute, Router, RouterComponent } from "../lib";
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
	router.addEventListener(RouterComponent.events.didChangeRoute, (e) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	window.addEventListener(Router.events.onPushState, (e: CustomEvent) => {
		console.log("On push state", e.detail);
	});

	window.addEventListener(Router.events.navigationStart, (e: CustomEvent) => {
		console.log("Navigation start", e.detail);
	});

	window.addEventListener(Router.events.navigationEnd, (e: CustomEvent) => {
		console.log("Navigation end", e.detail);
	});

	window.addEventListener(Router.events.navigationCancel, (e: CustomEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	window.addEventListener(Router.events.navigationError, (e: CustomEvent) => {
		console.log("Navigation failed", e.detail);
	});

	await router.setup([
		{
			path: new RegExp("login.*"),
			component: import("./pages/login/login")
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
