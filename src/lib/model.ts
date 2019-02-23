export interface IRouterSlot extends HTMLElement {
	readonly route: IRoute | null;
	readonly isRoot: boolean;
	readonly fragments: [PathFragment, PathFragment] | null;
	readonly match: IRouteMatch | null;
	parent: IRouterSlot | null | undefined;
	add: ((routes: IRoute[], navigate?: boolean) => void);
	clearRoutes: (() => void);
}

export type RoutingInfo = {slot: IRouterSlot, route: IRoute, match: IRouteMatch};
export type CustomResolver = ((info: RoutingInfo) => void | Promise<void>);
export type Guard = ((info: RoutingInfo) => boolean | Promise<boolean>);
export type Cancel = (() => boolean);

export type ModuleResolver = Promise<{default: any}>;
export type Class = {new (...args: any[]): any;};

export type RouterTree = {router: IRouterSlot} & {child?: RouterTree} | null | undefined;

/**
 * The base route interface.
 * D = the data type of the data
 */
export interface IRouteBase<D = unknown> {

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
export interface IRedirectRoute<D = unknown> extends IRouteBase<D> {

	// The paths the route should redirect to. Can either be relative or absolute.
	redirectTo: string;
}

/**
 * Route type used to resolve and stamp components.
 */
export interface IComponentRoute<D = unknown> extends IRouteBase<D> {

	// The component loader (should return a module with a default export)
	component: Class | ModuleResolver | (() => ModuleResolver);
}

/**
 * Route type used to take control of how the route should resolve.
 */
export interface IResolverRoute<D = unknown> extends IRouteBase<D> {

	// A custom resolver that handles the route change
	resolve: CustomResolver;
}

export type IRoute<D = unknown> = IRedirectRoute<D> | IComponentRoute<D> | IResolverRoute<D>;
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
export enum RouterEventKind {
	RouteChange = "routechange"
}

/**
 * History related events.
 */
export enum GlobalRouterEventKind {

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
