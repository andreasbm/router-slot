# an-router

## Benefits
- Async loading of routes
- Web component friendly
- Small and lightweight
- Easy to use API
- Uses the History api.

## 🎁 Step 1 -  Install the library

```
npm i _____ --save
```

## 👏 Step 2 - Add the router to the markup.

```
<router-component></router-component>
```

## 👍 Step 3 - Add some routes!

Routes are added to the router through the `createRoutes` function. At least one of the routes must always match. *Remember that all pages needs to implement the `IPage` interface.

```
const router: Router = document.querySelector("router-component");
await router.createRoutes([
  {
    path: new RegExp("/login.*"),
    loader: import("./pages/login")
  },
  {
    path: new RegExp("/home.*"),
    loader: import("./pages/home")
  },
  {
    path: new RegExp("/.*"),
    redirectTo: "home"
  }
]);
```

You may want to wrap the above in a `whenDefined` callback.

```
customElements.whenDefined("router-component").then(async () => {
  ...
});
```

## 🎉 Step 4 - Add some guards (optional)

A guard is a function that determines whether the route can be activated or not. The example below checks whether the user has a session saved in the local storage and redirects the user to the login page if the access is not provided.

```
funtion sessionGuard (router: Router, route: IRoute) {

  if (localStorage.getItem("session") == null) {
    Router.replaceState(null, null, "login");
    return false;
  }

  return true;
}

...

await router.createRoutes([
  ...
  {
    path: new RegExp("/home.*"),
    loader: import("./pages/home"),
    guards: [sessionGuard]
  },
  ...
]);
```

## 👶 Step 5 - Add some child routes

Child routes are routes within another route! It is super simple to add one. All children will have the `parentRouter` property set. The `parentRouter` must be set on the child router. Here's an example of how to add routes to a child router.

```
export default class HomeComponent implements IPage {

  parentRouter: Router;

  connectedCallback () {
    const $router: Router = this.shadowRoot.querySelector("router-component");
    $router.parentRouter = this.parentRouter;
    $router.createRoutes([
      {
        path: new RegExp("home/secret.*"),
        loader: (import("./secret"))
      },
      {
        path: new RegExp("home/user.*"),
        loader: (import("./user"))
      },
      {
         path: new RegExp(""),
         redirectTo: "home/secret"
       }
     ]).then();
  }

  render () {
    return html`<router-component></router-component>`;
  }
}

window.customElements.define("home-component", HomeComponent);
```

## 🙌 Step 6 - Change route!

In order to change a route you will have to use the static methods on the `Router` class. These methods mirrors the History API. Why not just use the `history` object directly you may ask? Because we have to keep track of when the state changes. Currently we have to dispatch our own `onpushstate` event.

```
Router.pushState(null, null, "login");
```






