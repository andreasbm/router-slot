export interface IRouterComponent extends EventTarget {
	parentRouter: IRouterComponent | null | undefined;
	readonly isChildRouter: boolean;
	setup: ((routes: IRoute[], parentRouter?: IRouterComponent | null, navigate?: boolean) => Promise<void>);
	clearRoutes: (() => Promise<void>);
}

export interface IPage {
	parentRouter: IRouterComponent;
}

export type IGuard = ((router: IRouterComponent, route: IRoute) => boolean);

export type ModuleResolver = Promise<{ default: any }>;

export interface IRoute {
	/* The path match */
	path: RegExp | string;

	/* The component load (should return a module with a default export) */
	/*tslint:disable:no-any*/
	component?: ModuleResolver | any | (() => ModuleResolver);
	/*tslint:enable:no-any*/

	/* If guard returns false, the navigation is not allowed */
	guards?: IGuard[];

	/* Determines whether there should be scrolled to the top on the new page */
	scrollToTop?: boolean;

	/* A redirection route */
	redirectTo?: string;

	/* Optional metadata */
	data?: any;
}


/**
 * RouterComponent related events.
 */
export enum RouterComponentEventKind {
	DidChangeRoute = "didChangeRoute"
}

/**
 * The router component did change route event.
 */
export interface IDidChangeRouteEvent extends CustomEvent<IRoute> {
}

export type Params = { [key: string]: string };


export interface IOnPushStateEvent extends CustomEvent<null> {
}

export interface IPopStateEvent extends CustomEvent<null> {
}

export interface INavigationStartEvent extends CustomEvent<IRoute> {
}

export interface INavigationCancelEvent extends CustomEvent<IRoute> {
}

export interface INavigationErrorEvent extends CustomEvent<IRoute> {
}

export interface INavigationEndEvent extends CustomEvent<IRoute> {
}

export enum RouterEventKind {

	// An event triggered when a new state is added to the history.
	OnPushState = "onPushState",

	// An event triggered when a state in the history is popped.
	PopState = "popstate",

	// An event triggered when navigation starts.
	NavigationStart = "navigationStart",

	// An event triggered when navigation is canceled. This is due to a Route Guard returning false during navigation.
	NavigationCancel = "navigationCancel",

	// An event triggered when navigation fails due to an unexpected error.
	NavigationError = "navigationError",

	// An event triggered when navigation ends successfully.
	NavigationEnd = "navigationEnd"
}
