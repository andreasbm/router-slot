# @appnest/web-router

<a href="https://npmcharts.com/compare/@appnest/web-router?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@appnest/web-router.svg" height="20"></img></a>
<a href="https://david-dm.org/andreasbm/web-router"><img alt="Dependencies" src="https://img.shields.io/david/andreasbm/web-router.svg" height="20"></img></a>
<a href="https://www.npmjs.com/package/@appnest/web-router"><img alt="NPM Version" src="https://img.shields.io/npm/v/@appnest/web-router.svg" height="20"></img></a>
<a href="https://github.com/andreasbm/web-router/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/andreasbm/web-router.svg" height="20"></img></a>
<a href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg" height="20"></img></a>

## What is this?

This is a simple web component router. Go here to see a demo [https://appnest-demo.firebaseapp.com/web-router](https://appnest-demo.firebaseapp.com/web-router).

## Benefits
- Lazy loading of routes
- Web component friendly
- Small and lightweight
- Easy to use API
- Zero dependencies
- Uses the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

## Step 1 -  Install the dependency

```node
npm i @appnest/web-router
```

## Step 2 - Import it

Import the dependency in your application.

```javascript
import "@appnest/web-router";
```

## Step 3 - Add the router to the markup.

```html
<router-component></router-component>
```

## Step 4 - Add some routes!

Routes are added to the router through the `setup` function. At least one of the routes must always match.

```typescript
const router = <IRouterComponent>document.querySelector("router-component");
await router.setup([
  {
    path: /^login.*/,
    component: () => import("./pages/login")
  },
  {
    path: /^home.*/,
    component: HomeComponent
  },
  {
    path: /.*/,
    redirectTo: "home"
  }
]);
```

You may want to wrap the above in a `whenDefined` callback to ensure the `router-component` exists before using its logic.

```javascript
customElements.whenDefined("router-component").then(async () => {
  ...
});
```

## Step 5 - Add some guards (optional)

A guard is a function that determines whether the route can be activated or not. The example below checks whether the user has a session saved in the local storage and redirects the user to the login page if the access is not provided.

```typescript
funtion sessionGuard (router: Router, route: IRoute) {

  if (localStorage.getItem("session") == null) {
    Router.replaceState(null, "", "login");
    return false;
  }

  return true;
}

...

await router.setup([
  ...
  {
    path: /home.*/,
    component: HomeComponent,
    guards: [sessionGuard]
  },
  ...
]);
```

## Step 6 - Add some child routes

Child routes are routes within another route! It is super simple to add one. All children will have the `parentRouter` property set. The `parentRouter` must be passed to the child router through the `setup` method. Here's an example of how to add routes to a child router.

```typescript
export default class HomeComponent extends LitElement implements IPage {

  parentRouter: IRouterComponent;

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    const $router = <IRouterComponent>this.shadowRoot!.querySelector("router-component");
    $router.setup([
      {
        path: /^home\/secret.*/,
        component: () => import("./secret")
      },
      {
        path: /^home\/user.*/,
        component: () => import("./user")
      },
      {
         path: "",
         redirectTo: "home/secret"
       }
     ], this.parentRouter).then();
  }

  render () {
    return html`<router-component></router-component>`;
  }
}

window.customElements.define("home-component", HomeComponent);
```

## Step 7 - Navigate!

In order to change a route you can either use the [`history`](https://developer.mozilla.org/en-US/docs/Web/API/History) API directly or the `RouterLink` component.

## History API
Here's an example on how to navigate.

```javascript
history.pushState(null, "", "login");
```

Or (if you want to replace the state and not keep the current one in the history)

```javascript
history.replaceState(null, """, "login");
```

## `RouterLink` component

With the `RouterLink` component you add the `<router-link>` to your markup and specifies a path. When ever the component is clicked it will navigate to the specified path. Whenever the router link is active the active attribute is set.

```html
<router-link path="home/secret"><button>Go to SecretComponent</button></router-link>
```

You can also go back and forth between the states!

```javascript
history.back();
history.forward();
```

Here's an example on how to use the `RouterLink` component for navigating. Whenever you use a router link component you can

```html
<router-link path="home/secret"><button>Go to the secret page!</button></router-link>
```

## Step 8 - Global navigation events

You are able to listen to the navigation related events that are dispatched each time something important happens. They are dispatched on the `window` object.

```typescript
export enum RouterEventKind {

  // An event triggered when a new state is added to the history.
  PushState = "pushstate",

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
window.addEventListener(RouterEventKind.OnPushState, (e: PushStateEvent) => {
  console.log("On push state", Router.currentPath);
});

window.addEventListener(RouterEventKind.PopState, (e: PopStateEvent) => {
  console.log("On pop state", Router.currentPath);
});

window.addEventListener(RouterEventKind.NavigationStart, (e: NavigationStartEvent) => {
  console.log("Navigation start", e.detail);
});

window.addEventListener(RouterEventKind.NavigationEnd, (e: NavigationEndEvent) => {
  console.log("Navigation end", e.detail);
});

window.addEventListener(RouterEventKind.NavigationCancel, (e: NavigationCancelEvent) => {
  console.log("Navigation cancelled", e.detail);
});

window.addEventListener(RouterEventKind.NavigationError, (e: NavigationErrorEvent) => {
  console.log("Navigation failed", e.detail);
});

window.addEventListener(RouterEventKind.NavigationSuccess, (e: NavigationSuccessEvent) => {
  console.log("Navigation failed", e.detail);
});
```

## Be careful when navigating to the root!

From my testing I found that Chrome and Safari treat an empty string as url when navigating differently. As an example `history.pushState(null, null, "")` will navigate to the root of the website in Chrome but in Safari the path won't change. The workaround I found was to simply pass "/" when navigating to the root of the website instead.

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).