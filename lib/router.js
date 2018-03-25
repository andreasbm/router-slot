"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var template = document.createElement("template");
template.innerHTML = "<slot></slot>";
var Router = /** @class */ (function (_super) {
    __extends(Router, _super);
    function Router() {
        var _this = _super.call(this) || this;
        /**
         * Contains the available routes.
         */
        _this.routes = [];
        /**
         * Determines whether the router or one of its parent routers is loading a new path.
         */
        _this._isLoading = false;
        _this.onPathChanged = _this.onPathChanged.bind(_this);
        // Attach the template
        var shadow = _this.attachShadow({ mode: "open" });
        shadow.appendChild(template.content.cloneNode(true));
        return _this;
    }
    Object.defineProperty(Router, "currentPath", {
        /**
         * The current path of the location.
         */
        get: function () {
            return window.location.pathname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router.prototype, "isLoading", {
        get: function () {
            if (this.parentRouter && this.parentRouter.isLoading)
                return true;
            return this._isLoading;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router, "events", {
        /**
         * Router related events.
         */
        get: function () {
            return {
                didChangeRoute: "didChangeRoute",
                onPushState: "onPushState"
            };
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Hook up event listeners and create the routes.
     */
    Router.prototype.connectedCallback = function () {
        window.addEventListener("popstate", this.onPathChanged);
        window.addEventListener(Router.events.onPushState, this.onPathChanged);
    };
    /**
     * Remove event listeners and clean up.
     */
    Router.prototype.disconnectedCallback = function () {
        window.removeEventListener("popstate", this.onPathChanged);
        window.removeEventListener(Router.events.onPushState, this.onPathChanged);
    };
    /**
     * Sets up the routes.
     * @param {IRoute[]} routes
     * @param {boolean} replaceRoutes
     * @param {boolean} navigate
     * @returns {Promise<void>}
     */
    Router.prototype.createRoutes = function (routes, replaceRoutes, navigate) {
        if (replaceRoutes === void 0) { replaceRoutes = false; }
        if (navigate === void 0) { navigate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, routes_1, route;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!replaceRoutes) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.clearRoutes()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Add the routes to the array
                        for (_i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
                            route = routes_1[_i];
                            this.routes.push(route);
                        }
                        if (!navigate) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.onPathChanged()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes all routes.
     */
    Router.prototype.clearRoutes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.routes.length = 0;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Each time the path changes, load the new path.
     * Prevents the event from continuing down the router tree if a navigation was made.
     * @private
     */
    Router.prototype.onPathChanged = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Ensure that the parent router is NOT loading (else we can get endless loops)
                        if (this.parentRouter != null && this.parentRouter.isLoading) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.loadPath(Router.currentPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Matches the first route that matches the given path.
     * @private
     */
    Router.prototype.matchRoute = function (path) {
        for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
            var route = _a[_i];
            if (path.match(route.path) != null)
                return route;
        }
        return null;
    };
    /**
     * Loads a new path based on the routes.
     * Returns true if a navigation was made to a new page.
     * @private
     */
    Router.prototype.loadPath = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var route, _i, _a, guard, navigate, module_1, page_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._isLoading = true;
                        route = this.matchRoute(path);
                        // Ensure that a route was found.
                        if (route == null) {
                            this._isLoading = false;
                            throw new Error("No routes matches the path '" + path + "'.");
                        }
                        // Check whether the loader or redirectTo is specified.
                        if (route.loader == null && route.redirectTo == null && !(route.loader != null && route.redirectTo != null)) {
                            this._isLoading = false;
                            throw new Error("The route \u00B4" + route.path + "\u00B4 needs to have either a loader or a redirectTo set.");
                        }
                        // Check whether the guards allows us to go to the new route.
                        if (route.guards != null) {
                            for (_i = 0, _a = route.guards; _i < _a.length; _i++) {
                                guard = _a[_i];
                                if (!guard(this, route)) {
                                    this._isLoading = false;
                                    return [2 /*return*/, false];
                                }
                            }
                        }
                        navigate = (this.currentRoute !== route);
                        if (!navigate) return [3 /*break*/, 2];
                        // Redirect if nessesary
                        if (route.redirectTo != null) {
                            this._isLoading = false;
                            Router.replaceState(null, null, route.redirectTo);
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, route.loader];
                    case 1:
                        module_1 = _b.sent();
                        page_1 = (new module_1["default"]());
                        page_1.parentRouter = this;
                        // Add the new page to the DOM
                        // this.innerHTML = "";
                        // this.appendChild(page);
                        requestAnimationFrame(function () {
                            if (_this.childNodes.length > 0) {
                                var previousPage = _this.childNodes[0];
                                _this.removeChild(previousPage);
                            }
                            _this.appendChild(page_1);
                        });
                        this.currentRoute = route;
                        this.dispatchDidChangeRouteEvent(route);
                        _b.label = 2;
                    case 2:
                        // Scroll to the top of the new page if nessesary.
                        // Scrolling to the top is the default behavior.
                        if (route.scrollToTop == null || route.scrollToTop) {
                            window.scrollTo(0, 0);
                        }
                        this._isLoading = false;
                        return [2 /*return*/, navigate];
                }
            });
        });
    };
    /**
     * Dispatches a did change route event.
     * @param {IRoute} route
     */
    Router.prototype.dispatchDidChangeRouteEvent = function (route) {
        this.dispatchEvent(new CustomEvent(Router.events.didChangeRoute, {
            detail: {
                route: route
            }
        }));
    };
    /**
     * Dispatches a on push state event.
     */
    Router.dispatchOnPushStateEvent = function () {
        window.dispatchEvent(new CustomEvent(Router.events.onPushState));
    };
    Object.defineProperty(Router, "historyLength", {
        /*******************************************
         *** Implementation of History interface ***
         *** We need to wrap the history API in  ***
         *** to dispatch the "onpushstate" event ***
         *******************************************/
        /**
         * The number of pages in the history stack.
         * @returns {number}
         */
        get: function () {
            return history.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router, "state", {
        /**
         * The state of the current history entry.
         * @returns {{}}
         */
        get: function () {
            return history.state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router, "scrollRestoration", {
        /**
         * The scroll restoration behavior.
         * @returns {ScrollRestoration}
         */
        get: function () {
            return history.scrollRestoration;
        },
        /**
         * Set default scroll restoration behavior on history navigation.
         * This property can be either auto or manual.
         * @param {ScrollRestoration} value
         */
        set: function (value) {
            history.scrollRestoration = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Goes to the previous page in session history, the same action as when the user
     * clicks the browser's Back button. Equivalent to history.go(-1).
     */
    Router.back = function () {
        history.back();
    };
    /**
     * Goes to the next page in session history, the same action as when the
     * user clicks the browser's Forward button; this is equivalent to history.go(1).
     */
    Router.forward = function () {
        history.forward();
        this.dispatchOnPushStateEvent();
    };
    /**
     * Loads a page from the session history, identified by its relative location
     * to the current page, for example -1 for the previous page or 1  for the next page.
     * @param {number} delta
     */
    Router.go = function (delta) {
        history.go(delta);
        this.dispatchOnPushStateEvent();
    };
    /**
     * Pushes the given data onto the session history stack with the specified title and, if provided, URL.
     * @param {{}} data
     * @param {string} title
     * @param {string | null} url
     */
    Router.pushState = function (data, title, url) {
        history.pushState(data, title, url);
        this.dispatchOnPushStateEvent();
    };
    /**
     * Updates the most recent entry on the history stack to have the specified data, title, and, if provided, URL.
     * @param {{}} data
     * @param {string} title
     * @param {string | null} url
     */
    Router.replaceState = function (data, title, url) {
        history.replaceState(data, title, url);
        this.dispatchOnPushStateEvent();
    };
    return Router;
}(HTMLElement));
exports.Router = Router;
window.customElements.define("router-component", Router);
