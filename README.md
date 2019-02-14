# @appnest/web-router

<a href="https://npmcharts.com/compare/@appnest/web-router?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@appnest/web-router.svg" height="20"></img></a>
<a href="https://david-dm.org/andreasbm/web-router"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/web-router.svg" height="20"></img></a>
<a href="https://www.npmjs.com/package/@appnest/web-router"><img alt="NPM Version" src="https://img.shields.io/npm/v/@appnest/web-router.svg" height="20"></img></a>
<a href="https://github.com/andreasbm/web-router/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/web-router.svg" height="20"></img></a>
<a href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg" height="20"></img></a>

## What is this?

This library is a powerful web component router. Go here to see a demo [https://appnest-demo.firebaseapp.com/web-router](https://appnest-demo.firebaseapp.com/web-router).

A router interprets the browser URL and navigates to a specific views based on the configuration. This router is optimized for routing between web components.

## Benefits
- Lazy loading of routes
- Web component friendly
- Easy to use API
- Specify params in the path
- Zero dependencies
- Uses the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

## Install the dependency

```node
npm i @appnest/web-router
```

## The Basics

This section will introduce the basics of the router.

### `<base href>`

Your application should add a `<base>` element to the `index.html` in the `<head>` tag. If your file is located in the root, the `href` value should be the following:

```html
<base href="/">
```

### Router import

To import the `router` you'll need to import the dependency in your application.

```javascript
import "@appnest/web-router";
```

### `web-router`

The `web-router` component acts as a placeholder that marks the spot in the template where the router should display the components for that route part.

```html
<web-router>
	<!-- Routed components will go here -->
</web-router>
```

### Configuration

Routes are added to the router through the `add` function on a `web-router` component. Specify the parts of the path you want it to math with or use the `**` wildcard to catch all paths. The router has no routes until you configure it. The example below creates three routes. The first route path matches urls starting with `login` and will lazy load the login component. The second route matches all urls starting with `home` and will stamp the `HomeComponent` in the `web-router`. The third route matches all paths that the two routes before didn't catch and redirects to home. This can also be useful for displaying "404 - Not Found" pages.

```typescript
const router = <IWebRouter>document.querySelector("web-router");
await router.add([
  {
    path: "login",
    component: () => import("./pages/login") // Lazy loaded
  },
  {
    path: "home",
    component: HomeComponent // Not lazy loaded
  },
  {
    path: "**",
    redirectTo: "home"
  }
]);
```

You may want to wrap the above in a `whenDefined` callback to ensure the `web-router` exists before using its logic.

```javascript
customElements.whenDefined("web-router").then(async () => {
  ...
});
```

### Navigation

In order to change a route you can either use the [`history`](https://developer.mozilla.org/en-US/docs/Web/API/History) API directly or the `router-link` component.

#### History API

Here's an example on how to navigate.

```javascript
history.pushState(null, "", "/login");
```

Or (if you want to replace the state and not keep the current one in the history)

```javascript
history.replaceState(null, "", "/login");
```

You can also go back and forth between the states!

```javascript
history.back();
history.forward();
```

#### `router-link`

With the `router-link` component you add `<router-link>` to your markup and specify a path. Whenever the component is clicked it will navigate to the specified path. Whenever the path of the router link is active the active attribute is set.

```html
<router-link path="/home/secret">
  <button>Go to the secret page!</button>
</router-link>
```

Paths can be specified either in relative or absolute terms. To specify an absolute path you simply pass `/home/secret`. To specify a relative path you first have to be aware of the router context  you are navigating within. The `router-link` component will for navigate based on the nearest `web-router` component. If you give the component a path (without the slash) as path, the navigation will be done in relation to the parent router. You can also specify `../login` to traverse up the router tree.


## Advanced

You can customize a lot in this library. Continue reading to learn how to handle your new superpowers.

### Guards

A guard is a function that determines whether the route can be activated or not. The example below checks whether the user has a session saved in the local storage and redirects the user to the login page if the access is not provided. If a guard returns false the routing is cancelled.

```typescript
funtion sessionGuard (router: IWebRouter, route: IRoute) {

  if (localStorage.getItem("session") == null) {
    history.replaceState(null, "", "/login");
    return false;
  }

  return true;
}
```

Add this guard to the add function in the `guards` array.

```typescript
...
await router.add([
  ...
  {
    path: "home",
    component: HomeComponent,
    guards: [sessionGuard]
  },
  ...
]);
```

### Params

If you want params in your URL you can do it by using the `:name` syntax. Below is an example on how to specify a path that matches params as well. This route would match urls such as `user/123`, `user/@andreas`, `user/abc` and so on.

```typescript
...
await router.add([
  {
    path: "user/:userId",
    component: UserComponent
  }
]);
```

To grab the params in the `UserComponent` you can use the `routeMatch` from the parent router as shown in the example below.

```typescript
export default class UserComponent extends LitElement {

  get params (): Params {
    return queryParentRouter(this)!.routeMatch!.params;
  }

  render (): TemplateResult {
    const {userId} = this.params;
    return html`
      <p>:userId = <b>${userId}</b></p>
    `;
  }
}

window.customElements.define("user-component", UserComponent);
```

### Deep dive into the different route kinds

There exists three different kinds of routes. We are going to take a look at those different kinds in a bit, but first you should be familiar with what all routes have in common.

```typescript
export interface IRouteBase<T = any> {

  // The path for the route fragment
  path: PathFragment;

  // Optional metadata
  data?: T;

  // If guard returns false, the navigation is not allowed
  guards?: Guard[];

  // Whether the match is fuzzy (eg. "name" would not only match "name" or "name/" but also "nameasdpokasf") 
  fuzzy?: boolean;
}
```

#### Component routes

Component routes resolves a specified component. You can provide the `component` property with either a class that instantiates a `web component` or a function that imports the component lazily.

```typescript
export interface IComponentRoute extends IRouteBase {

  // The component loader (should return a module with a default export)
  component: Class | ModuleResolver | (() => ModuleResolver);
}
```

#### Redirection routes

A redirection route is good to use to catch all of the paths that the routes before did not catch. This could for example be used to handle "404 - Page not found" cases.

```typescript
export interface IRedirectRoute extends IRouteBase {

  // The paths the route should redirect to. Can either be relative or absolute. 
  redirectTo: string;
}
```

#### Resolver routes

Use the resolver routes when you want to customize what should happen when the path matches the route. This is good to use if you for example want to show a dialog instead of navigating to a new component.

```typescript
export interface IResolverRoute extends IRouteBase {
  
  // A custom resolver that handles the route change
  resolve: CustomResolver;
}
```

### Global navigation events

You are able to listen to the navigation related events that are dispatched each time something important happens. They are dispatched on the `window` object.

```typescript
export enum GlobalWebRouterEventKind {

  // An event triggered when a new state is added to the history.
  PushState = "pushstate",

  // An event triggered when the current state is replaced in the history.
  ReplaceState = "replacestate",

  // An event triggered when a state in the history is popped from the history.
  PopState = "popstate",

  // An event triggered when navigation starts.
  NavigationStart = "navigationstart",

  // An event triggered when navigation is canceled. This is due to a Route Guard returning false during navigation.
  NavigationCancel = "navigationcancel",

  // An event triggered when navigation fails due to an unexpected error.
  NavigationError = "navigationerror",

  // An event triggered when navigation successfully completes.
  NavigationSuccess = "navigationsuccess",

  // An event triggered when navigation ends.
  NavigationEnd = "navigationend"
}
```

Here's an example of how you can listen to the events.

```typescript
window.addEventListener(GlobalWebRouterEventKind.PushState, (e: PushStateEvent) => {
  console.log("On push state", currentPath());
});

window.addEventListener(GlobalWebRouterEventKind.ReplaceState, (e: ReplaceStateEvent) => {
  console.log("On replace state", currentPath());
});

window.addEventListener(GlobalWebRouterEventKind.PopState, (e: PopStateEvent) => {
  console.log("On pop state", currentPath());
});

window.addEventListener(GlobalWebRouterEventKind.NavigationStart, (e: NavigationStartEvent) => {
  console.log("Navigation start", e.detail);
});

window.addEventListener(GlobalWebRouterEventKind.NavigationEnd, (e: NavigationEndEvent) => {
  console.log("Navigation end", e.detail);
});

window.addEventListener(GlobalWebRouterEventKind.NavigationCancel, (e: NavigationCancelEvent) => {
  console.log("Navigation cancelled", e.detail);
});

window.addEventListener(GlobalWebRouterEventKind.NavigationError, (e: NavigationErrorEvent) => {
  console.log("Navigation failed", e.detail);
});

window.addEventListener(GlobalWebRouterEventKind.NavigationSuccess, (e: NavigationSuccessEvent) => {
  console.log("Navigation failed", e.detail);
});
```

## Be careful when navigating to the root!

From my testing I found that Chrome and Safari treat an empty string as url when navigating differently. As an example `history.pushState(null, null, "")` will navigate to the root of the website in Chrome but in Safari the path won't change. The workaround I found was to simply pass "/" when navigating to the root of the website instead.

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).