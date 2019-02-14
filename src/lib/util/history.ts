import { dispatchGlobalRouterEvent } from "./events";
import { GlobalRouterEventKind } from "../model";

/**
 * Patches the history object by ensuring correct events are dispatches when the history changes.
 */
export function ensureHistoryEvents () {
	const patches = [
		["pushState", GlobalRouterEventKind.PushState],
		["replaceState", GlobalRouterEventKind.ReplaceState],
		["forward", GlobalRouterEventKind.PushState],
		["back", GlobalRouterEventKind.PopState],
		["go", GlobalRouterEventKind.PushState]
	];
	for (const [name, event] of patches) {
		attachCallback(history, name, () => dispatchGlobalRouterEvent(<GlobalRouterEventKind>event));
	}
}

/**
 * Attaches a callback after the function on the object has been invoked.
 * @param obj
 * @param name
 * @param cb
 */
export function attachCallback (obj: any, name: string, cb: ((...args: any[]) => void)) {
	const func = obj[name];
	obj[name] = (...args: any[]) => {
		func.apply(obj, args);
		cb(args);
	};
}