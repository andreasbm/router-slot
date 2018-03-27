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

Routes are added to the router through the `createRoutes` function. At least one of the routes must always match. *Remember that all pages needs to implement the `IPage` interface.

```javascript
const router: Router = document.querySelector("router-component");
await router.setup([
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

## 👶 Step 6 - Add some child routes

Child routes are routes within another route! It is super simple to add one. All children will have the `parentRouter` property set. The `parentRouter` must be set on the child router through the `setup` method. Here's an example of how to add routes to a child router.

```javascript
export default class HomeComponent implements IPage {

  parentRouter: Router;

  connectedCallback () {
    const $router: Router = this.shadowRoot.querySelector("router-component");
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
     ], this.parentRouter).then();
  }

  render () {
    return html`<router-component></router-component>`;
  }
}

window.customElements.define("home-component", HomeComponent);
```

## 🙌 Step 7 - Change route!

In order to change a route you can either use the static methods on the `Router` class or the `RouterLink` component. The static methods mirrors the History API. Why not just use the `history` object directly you may ask? Because we have to keep track of when the state changes. Currently we have to dispatch our own `onpushstate` event.

Here's an example on how to use the `Router` class for navigating.

```javascript
Router.pushState(null, null, "login");
```

Or (if you want to replace the route)

```javascript
Router.replaceState(null, null, "login");
```

You can also go back and forth!

```javascript
Router.back();
Router.forward();
```

Here's an example on how to use the `RouterLink` component for navigating.

```html
<router-link path="home/secret"><button>Go to the secret!</button></router-link>
```

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).