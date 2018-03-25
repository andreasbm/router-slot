import { IRoute, Router } from "../lib/router";

/**
 * Asserts that the user is authenticated.
 * @param router
 * @param {IRoute} route
 * @returns {boolean}
 */
function sessionGuard (router: Router, route: IRoute) {

	if (localStorage.getItem("session") == null) {
		Router.replaceState(null, null, "login");
		return false;
	}

	return true;
}

// Setup the router
customElements.whenDefined("router-component").then(async () => {
	const router: Router = document.querySelector("router-component");

	let hasInitialized = false;
	router.addEventListener(Router.events.didChangeRoute, (e) => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	await router.createRoutes([
		{
			path: new RegExp("/login.*"),
			loader: import("./pages/login")
		},
		{
			path: new RegExp("/home.*"),
			loader: import("./pages/home"),
			guards: [sessionGuard]
		},
		{
			path: new RegExp("/.*"),
			redirectTo: "home"
		}
	]);



});
