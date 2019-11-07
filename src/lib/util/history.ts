import { GLOBAL_ROUTER_EVENTS_TARGET, HISTORY_PATCH_NATIVE_KEY } from "../config";
import { GlobalRouterEvent } from "../model";
import { dispatchGlobalRouterEvent } from "./events";

// Mapping a history functions to the events they are going to dispatch.
export const historyPatches: [string, GlobalRouterEvent[]][] = [
	["pushState", ["pushstate", "changestate"]],
	["replaceState", ["replacestate", "changestate"]],
	["forward", ["pushstate", "changestate"]],
	["go", ["pushstate", "changestate"]],

	// We need to handle the popstate a little differently when it comes to the change state event.
	["back", ["popstate"]],
];


/**
 * Patches the history object by ensuring correct events are dispatches when the history changes.
 */
export function ensureHistoryEvents () {
	for (const [name, events] of historyPatches) {
		for (const event of events) {
			attachCallback(history, name, () => dispatchGlobalRouterEvent(event));
		}
	}

	// The popstate is the only event natively dispatched when using the hardware buttons.
	// Therefore we need to handle this case a little different. To ensure the changestate event
	// is fired also when the hardware back button is used, we make sure to listen for the popstate
	// event and dispatch a change state event right after. The reason for the setTimeout is because we
	// want the popstate event to bubble up before the changestate event is dispatched.
	window.addEventListener("popstate", (e: PopStateEvent) => {

			// Check if the state should be allowed to change
			if (shouldCancelChangeState()) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			// Dispatch the global router event to change the routes after the popstate has bubbled up
			setTimeout(() => dispatchGlobalRouterEvent("changestate"), 0)
		}
	);
}

/**
 * Attaches a callback after the function on the object has been invoked.
 * Stores the original function at the _name.
 * @param obj
 * @param name
 * @param cb
 */
export function attachCallback (obj: any, name: string, cb: ((...args: any[]) => void)) {
	const func = obj[name];
	saveNativeFunction(obj, name, func);
	obj[name] = (...args: any[]) => {

		// Check if the state should be allowed to change
		if (shouldCancelChangeState()) return;

		// Navigate
		func.apply(obj, args);
		cb(args);
	};
}

/**
 * Saves the native function on the history object.
 * @param obj
 * @param name
 * @param func
 */
export function saveNativeFunction (obj: any, name: string, func: (() => void)) {

	// Ensure that the native object exists.
	if (obj[HISTORY_PATCH_NATIVE_KEY] == null) {
		obj[HISTORY_PATCH_NATIVE_KEY]= {};
	}

	// Save the native function.
	obj[HISTORY_PATCH_NATIVE_KEY][`${name}`] = func.bind(obj);
}

/**
 * Dispatches and event and returns whether the state change should be cancelled.
 * The state will be considered as cancelled if the "willChangeState" event was cancelled.
 */
function shouldCancelChangeState (): boolean {
	return !GLOBAL_ROUTER_EVENTS_TARGET.dispatchEvent(new CustomEvent("willchangestate", {cancelable: true}));
}

// Expose the native history functions.
declare global {
	interface History {
		"native": {
			"back": ((distance?: any) => void);
			"forward": ((distance?: any) => void);
			"go": ((delta?: any) => void);
			"pushState": ((data: any, title?: string, url?: string | null) => void);
			"replaceState": ((data: any, title?: string, url?: string | null) => void);
		}
	}
}