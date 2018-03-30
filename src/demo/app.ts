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
	router.addEventListener(Router.events.didChangeRoute, (e) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	await router.setup([
		{
			path: new RegExp("/login.*"),
			component: import("./pages/login/login")
		},
		{
			path: new RegExp("/home.*"),
			component: HomeComponent,
			guards: [sessionGuard]
		},
		{
			path: new RegExp("/.*"),
			redirectTo: "home"
		}
	]);

});
