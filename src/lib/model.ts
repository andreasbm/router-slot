export interface IWebRouter extends EventTarget {
	readonly route: IRoute | null;
	readonly isChildRouter: boolean;
	readonly fragments: [PathFragment, PathFragment] | null;
	readonly routeMatch: IRouteMatch | null;
	parentRouter: IWebRouter | null | undefined;
	setup: ((routes: IRoute[], parentRouter?: IWebRouter | null, navigate?: boolean) => Promise<void>);
	clearRoutes: (() => Promise<void>);
}

export interface IPage extends HTMLElement {
	parentRouter: IWebRouter;
}

export type Guard = ((router: IWebRouter, route: IRoute) => boolean | Promise<boolean>);
export type CustomResolver = ((router: IWebRouter, route: IResolverRoute) => void | Promise<void>);

export type ModuleResolver = Promise<{default: any}>;
export type Class = {new (...args: any[]): any;};
export type Cleanup = (() => void);
export type Cancel = (() => boolean);

export type RouterTree = {router: IWebRouter} & {child?: RouterTree} | null | undefined;

/**
 * The base route interface.
 * D = the data type of the data
 */
export interface IRouteBase<D = any> {

	// The path for the route fragment
	path: PathFragment;

	// Optional metadata
	data?: D;

	// If guard returns false, the navigation is not allowed
	guards?: Guard[];

	// Whether the match is fuzzy (eg. "name" would not only match "name" or "name/" but also "nameasdpokasf")
	fuzzy?: boolean;
}

/**
 * Route type used for redirection.
 */
export interface IRedirectRoute extends IRouteBase {

	// The paths the route should redirect to. Can either be relative or absolute.
	redirectTo: string;
}

/**
 * Route type used to resolve and stamp components.
 */
export interface IComponentRoute extends IRouteBase {

	// The component loader (should return a module with a default export)
	component: Class | ModuleResolver | (() => ModuleResolver);
}

/**
 * Route type used to take control of how the route should resolve.
 */
export interface IResolverRoute extends IRouteBase {

	// A custom resolver that handles the route change
	resolve: CustomResolver;
}

export type IRoute = IRedirectRoute | IComponentRoute | IResolverRoute;
export type PathFragment = string;

export interface IRouteMatch {
	route: IRoute;
	params: Params,
	fragments: [PathFragment, PathFragment];
	match: RegExpMatchArray;
}

/**
 * The router component did change route event.
 */
export type ChangeRouteEvent = CustomEvent<IRoute>;
export type PushStateEvent = CustomEvent<null>;
export type ReplaceStateEvent = CustomEvent<null>;
export type NavigationStartEvent = CustomEvent<IRoute>;
export type NavigationSuccessEvent = CustomEvent<IRoute>;
export type NavigationCancelEvent = CustomEvent<IRoute>;
export type NavigationErrorEvent = CustomEvent<IRoute>;
export type NavigationEndEvent = CustomEvent<IRoute>;

export type Params = {[key: string]: string};

export type EventListenerSubscription = (() => void);

/**
 * RouterComponent related events.
 */
export enum WebRouterEventKind {
	RouteChange = "routechange"
}

/**
 * History related events.
 */
export enum GlobalWebRouterEventKind {

	// An event triggered when a new state is added to the history.
	PushState = "pushstate",

	// An event triggered when the current state is replaced in the history.
	ReplaceState = "replacestate",

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
