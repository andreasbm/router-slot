export interface IRouterSlot<D = unknown, P = unknown> extends HTMLElement {
	readonly route: IRoute<D> | null;
	readonly isRoot: boolean;
	readonly fragments: IPathFragments | null;
	readonly match: IRouteMatch<D> | null;
	add: ((routes: IRoute<D>[], navigate?: boolean) => void);
	clear: (() => void);
	load: (() => Promise<void>);
	constructAbsolutePath: ((path: PathFragment) => string);
	parent: IRouterSlot<P> | null | undefined;
	queryParentRouterSlot: (() => IRouterSlot<P> | null);
}

export type RoutingInfo<D = unknown> = {slot: IRouterSlot, match: IRouteMatch<D>};
export type CustomResolver<D = unknown> = ((info: RoutingInfo<D>) => boolean | void | Promise<boolean> | Promise<void>);
export type Guard<D = unknown> = ((info: RoutingInfo<D>) => boolean | Promise<boolean>);
export type Cancel = (() => boolean);

export type PageComponent = HTMLElement;
export type ModuleResolver = Promise<{default: any; /*PageComponent*/}>;
export type Class = {new (...args: any[]): PageComponent;};
export type SetupComponent<D = unknown> = ((component: PageComponent, info: RoutingInfo<D>) => void);

export type RouterTree = {slot: IRouterSlot} & {child?: RouterTree} | null | undefined;

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

	// Whether the match is fuzzy (eg. "name" would not only match "name" or "name/" but also "path/to/name")
	fuzzy?: boolean;
}

/**
 * Route type used for redirection.
 */
export interface IRedirectRoute<D = unknown> extends IRouteBase<D> {

	// The paths the route should redirect to. Can either be relative or absolute.
	redirectTo: string;

	// Whether the query should be preserved when redirecting.
	preserveQuery?: boolean;
}

/**
 * Route type used to resolve and stamp components.
 */
export interface IComponentRoute<D = unknown> extends IRouteBase<D> {

	// The component loader (should return a module with a default export)
	component: Class | ModuleResolver | PageComponent | (() => Class) | (() => PageComponent) | (() => ModuleResolver);

	// A custom setup function for the instance of the component.
	setup?: SetupComponent;
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
export type IPathFragments = {
	consumed: PathFragment,
	rest: PathFragment
}

export interface IRouteMatch<D = unknown> {
	route: IRoute<D>;
	params: Params,
	fragments: IPathFragments;
	match: RegExpMatchArray;
}

export type PushStateEvent = CustomEvent<null>;
export type ReplaceStateEvent = CustomEvent<null>;
export type ChangeStateEvent = CustomEvent<null>;
export type NavigationStartEvent<D = unknown> = CustomEvent<RoutingInfo<D>>;
export type NavigationSuccessEvent<D = unknown> = CustomEvent<RoutingInfo<D>>;
export type NavigationCancelEvent<D = unknown> = CustomEvent<RoutingInfo<D>>;
export type NavigationErrorEvent<D = unknown> = CustomEvent<RoutingInfo<D>>;
export type NavigationEndEvent<D = unknown> = CustomEvent<RoutingInfo<D>>;

export type Params = {[key: string]: string};
export type Query = {[key: string]: string};

export type EventListenerSubscription = (() => void);

/**
 * RouterComponent related events.
 */
export enum RouterSlotEventKind {
	ChangeState = "changestate"
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

	// An event triggered when the state changes (eg. pop, push and replace)
	ChangeState = "changestate",

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

export interface ISlashOptions {
	startSlash: boolean;
	endSlash: boolean;
}