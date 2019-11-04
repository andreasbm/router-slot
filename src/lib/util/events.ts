import { GLOBAL_ROUTER_EVENTS_TARGET } from "../config";
import { EventListenerSubscription, GlobalRouterEventKind, IRoute, IRouteMatch, RouterSlotEventKind, RoutingInfo } from "../model";

/**
 * Dispatches a did change route event.
 * @param $elem
 * @param {IRoute} detail
 */
export function dispatchRouteChangeEvent<D = any> ($elem: HTMLElement, detail: RoutingInfo<D>) {
	$elem.dispatchEvent(new CustomEvent(RouterSlotEventKind.ChangeState, {detail}));
}

/**
 * Dispatches an event on the window object.
 * @param name
 * @param detail
 */
export function dispatchGlobalRouterEvent<D = any> (name: GlobalRouterEventKind, detail?: RoutingInfo<D>) {
	GLOBAL_ROUTER_EVENTS_TARGET.dispatchEvent(new CustomEvent(name, {detail}));
}

/**
 * Adds an event listener (or more) to an element and returns a function to unsubscribe.
 * @param $elem
 * @param type
 * @param listener
 * @param options
 */
export function addListener<T extends Event> ($elem: EventTarget,
                             type: string[] | string,
                             listener: ((e: T) => void),
                             options?: boolean | AddEventListenerOptions): EventListenerSubscription {
	const types = Array.isArray(type) ? type : [type];
	types.forEach(t => $elem.addEventListener(t, listener as EventListenerOrEventListenerObject, options));
	return () => types.forEach(t => $elem.removeEventListener(t, listener as EventListenerOrEventListenerObject, options));
}


/**
 * Removes the event listeners in the array.
 * @param listeners
 */
export function removeListeners (listeners: EventListenerSubscription[]) {
	listeners.forEach(unsub => unsub());
}
