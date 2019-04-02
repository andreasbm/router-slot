import { GlobalRouterEventKind } from "../model";
import { dispatchGlobalRouterEvent } from "./events";

// Mapping a history functions to the events they are going to dispatch.
export const historyPatches: [string, GlobalRouterEventKind[]][] = [
	["pushState", [GlobalRouterEventKind.PushState, GlobalRouterEventKind.ChangeState]],
	["replaceState", [GlobalRouterEventKind.ReplaceState, GlobalRouterEventKind.ChangeState]],
	["forward", [GlobalRouterEventKind.PushState, GlobalRouterEventKind.ChangeState]],
	["back", [GlobalRouterEventKind.PopState]],
	["go", [GlobalRouterEventKind.PushState, GlobalRouterEventKind.ChangeState]]
];

/**
 * Patches the history object by ensuring correct events are dispatches when the history changes.
 */
export function ensureHistoryEvents () {
	for (const [name, events] of historyPatches) {
		for (const event of events) {
			attachCallback(history, name, () => dispatchGlobalRouterEvent(<GlobalRouterEventKind>event));
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

			// Dispatch the global router event to change the routes
			setTimeout(() => dispatchGlobalRouterEvent(GlobalRouterEventKind.ChangeState), 0)
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
	obj[`_${name}`] = func;
	obj[name] = (...args: any[]) => {

		// Check if the state should be allowed to change
		if (shouldCancelChangeState()) return;

		// Navigate
		func.apply(obj, args);
		cb(args);
	};
}

/**
 * Dispatches and event and returns whether the state change should be cancelled.
 * The state will be considered as cancelled if the "willChangeState" event was cancelled.
 */
function shouldCancelChangeState (): boolean {
	return !window.dispatchEvent(new CustomEvent(GlobalRouterEventKind.WillChangeState, {cancelable: true}));
}

// Expose the original history functions.
declare global {
	interface History {
		"_back": ((distance?: any) => void);
		"_forward": ((distance?: any) => void);
		"_go": ((delta?: any) => void);
		"_pushState": ((data: any, title?: string, url?: string | null) => void);
		"_replaceState": ((data: any, title?: string, url?: string | null) => void);
	}
}