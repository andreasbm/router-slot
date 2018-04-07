# @appnest/web-router

## 🧐 What is this?

This is a a simple router for the web.

## 😃 Benefits
- Lazy loading of routes
- Web component friendly
- Small and lightweight
- Easy to use API
- Uses the History api.

## 🎁 Step 1 -  Install the dependency

```javascript
npm i @appnest/web-router --save
```

## 🤝 Step 2 - Import it

Import the dependency in your application.

```javascript
import "@appnest/web-router";
```


## 👏 Step 3 - Add the router to the markup.

```html
<router-component></router-component>
```

## 👍 Step 4 - Add some routes!

Routes are added to the router through the `setup` function. At least one of the routes must always match. *Remember that all pages needs to implement the `IPage` interface*.

```javascript
const router: RouterComponent = document.querySelector("router-component");
await router.setup([
  {
    path: new RegExp("login.*"),
    component: import("./pages/login")    // Preferred
  },
  {
    path: /home.*/,                       // Preferred
    component: HomeComponent
  },
  {
    path: /.*/,
    redirectTo: "home"
  }
]);
```

You may want to wrap the above in a `whenDefined` callback.

```javascript
customElements.whenDefined("router-component").then(async () => {
  ...
});
```

## 🎉 Step 5 - Add some guards (optional)

A guard is a function that determines whether the route can be activated or not. The example below checks whether the user has a session saved in the local storage and redirects the user to the login page if the access is not provided.

```javascript
funtion sessionGuard (router: Router, route: IRoute) {

  if (localStorage.getItem("session") == null) {
    Router.replaceState(null, null, "login");
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

## 👶 Step 6 - Add some child routes

Child routes are routes within another route! It is super simple to add one. All children will have the `parentRouter` property set. The `parentRouter` must be passed to the child router through the `setup` method. Here's an example of how to add routes to a child router.

```javascript
export default class HomeComponent implements IPage {

  parentRouter: RouterComponent;

  connectedCallback () {
    const $router: Router = this.shadowRoot.querySelector("router-component");
    $router.setup([
      {
        path: /home\/secret.*/,
        component: import("./secret")
      },
      {
        path: /home\/user.*/,
        component: import("./user")
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

## 🙌 Step 7 - Change route!

In order to change a route you can either use the static methods on the `Router` class or the `RouterLink` component. The static methods mirrors the history API. Why not just use the `history` object directly you may ask? Because we have to keep track of when the state changes. Currently we have to dispatch our own `onpushstate` event.

Here's an example on how to use the `Router` class for navigating.

```javascript
Router.pushState(null, null, "login");
```

Or (if you want to replace the state and not keep the current one in the history)

```javascript
Router.replaceState(null, null, "login");
```

You can also go back and forth between the states!

```javascript
Router.back();
Router.forward();
```

Here's an example on how to use the `RouterLink` component for navigating.

```html
<router-link path="home/secret"><button>Go to the secret!</button></router-link>
```

## 👋 Step 8 - Global navigation events

You are able to listen to what happens in the `Router` through the events that are dispatched when something happens. They are dispatched on the `window` object. In this router we have the following events:

- **Router.events.onPushState** (An event triggered when a new state is added to the history)
- **Router.events.navigationState** (An event triggered when navigation starts)
- **Router.events.navigationCancel** (An event triggered when navigation is canceled. This is due to a Route Guard returning false during navigation)
- **Router.events.navigationError** (An event triggered when navigation fails due to an unexpected error)
- **Router.events.navigationEnd** (An event triggered when navigation ends successfully)

Here's an example of how you can listen to the events.

```javascript
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
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).