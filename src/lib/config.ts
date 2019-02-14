import { GlobalRouterEventKind } from "./model";

export const CATCH_ALL_WILDCARD = "**";
export const TRAVERSE_FLAG = "\\.\\.\\/";
export const PARAM_IDENTIFIER = /:([^\\/]+)/g;
export const ROUTER_SLOT_TAG_NAME = "router-slot";
export const GLOBAL_ROUTER_EVENTS_TARGET = window;
export const PATH_CHANGING_EVENTS = [GlobalRouterEventKind.PopState, GlobalRouterEventKind.PushState, GlobalRouterEventKind.ReplaceState];