import { GlobalWebRouterEventKind } from "./model";

export const CATCH_ALL_WILDCARD = "**";
export const TRAVERSE_FLAG = "\\.\\.\\/";
export const PARAM_IDENTIFIER = /:([^\\/]+)/g;
export const WEB_ROUTER_TAG_NAME = "web-router";
export const GLOBAL_ROUTER_EVENTS_TARGET = window;
export const PATH_CHANGING_EVENTS = [GlobalWebRouterEventKind.PopState, GlobalWebRouterEventKind.PushState, GlobalWebRouterEventKind.ReplaceState];