export interface IRouterComponent extends EventTarget {
	readonly currentRoute: IRoute | null;
	readonly isChildRouter: boolean;
	parentRouter: IRouterComponent | null | undefined;
	setup: ((routes: IRoute[], parentRouter?: IRouterComponent | null, navigate?: boolean) => Promise<void>);
	clearRoutes: (() => Promise<void>);
}

export interface IPage extends HTMLElement {
	parentRouter: IRouterComponent;
}

export type IGuard = ((router: IRouterComponent, route: IRoute) => boolean | Promise<boolean>);

export type IResolver = () => Promise<void>;

export type ModuleResolver = Promise<{default: any}>;
export type Class = {new (...args: any[]): any;};

export interface IRoute<T = any> {

	/* The path match */
	path: RegExp | string;

	/* The component loader (should return a module with a default export) */
	component?: Class | ModuleResolver | (() => ModuleResolver);

	/* If guard returns false, the navigation is not allowed */
	guards?: IGuard[];

	/* A redirection route */
	redirectTo?: string;

	/* Optional metadata */
	data?: T;
}


/**
 * The router component did change route event.
 */
export type ChangeRouteEvent = CustomEvent<IRoute>;
export type PushStateEvent = CustomEvent<null>;
// export type PopStateEvent = CustomEvent<null>;
export type NavigationStartEvent = CustomEvent<IRoute>;
export type NavigationSuccessEvent = CustomEvent<IRoute>;
export type NavigationCancelEvent = CustomEvent<IRoute>;
export type NavigationErrorEvent = CustomEvent<IRoute>;
export type NavigationEndEvent = CustomEvent<IRoute>;

export type Params = {[key: string]: string};

/**
 * RouterComponent related events.
 */
export enum RouterComponentEventKind {
	RouteChange = "routechange"
}

/**
 * History related events.
 */
export enum RouterEventKind {

	// An event triggered when a new state is added to the history.
	PushState = "pushstate",

	// An event triggered when a state in the history is popped from the history.
	PopState = "popstate",

	// An event triggered when navigation starts.
	NavigationStart = "navigationstart",

	// An event triggered when navigation is canceled. This is due to a route guard returning false during navigation.
	NavigationCancel = "navigationcancel",

	// An event triggered when navigation fails due to an unexpected error.
	NavigationError = "navigationerror",

	// An event triggered when navigation successfully completes.
	NavigationSuccess = "navigationsuccess",

	// An event triggered when navigation ends.
	NavigationEnd = "navigationend"
}
