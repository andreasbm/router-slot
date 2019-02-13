import { dispatchGlobalRouterEvent } from "./events";
import { GlobalWebRouterEventKind } from "../model";

/**
 * Patches the history object by ensuring correct events are dispatches when the history changes.
 */
export function ensureHistoryEvents () {
	const patches = [
		["pushState", GlobalWebRouterEventKind.PushState],
		["replaceState", GlobalWebRouterEventKind.ReplaceState],
		["forward", GlobalWebRouterEventKind.PushState],
		["back", GlobalWebRouterEventKind.PopState],
		["go", GlobalWebRouterEventKind.PushState]
	];
	for (const [name, event] of patches) {
		attachCallback(history, name, () => dispatchGlobalRouterEvent(<GlobalWebRouterEventKind>event));
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