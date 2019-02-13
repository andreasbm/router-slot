import { GLOBAL_ROUTER_EVENTS_TARGET } from "../config";
import { EventListenerSubscription, IRoute, RouterComponentEventKind, RouterEventKind } from "../model";

/**
 * Dispatches a did change route event.
 * @param $elem
 * @param {IRoute} route
 */
export function dispatchRouteChangeEvent ($elem: HTMLElement, route: IRoute) {
	$elem.dispatchEvent(new CustomEvent(RouterComponentEventKind.RouteChange, {
		detail: route
	}));
}

/**
 * Dispatches an event on the window object.
 * @param name
 * @param detail
 */
export function dispatchGlobalRouterEvent<T> (name: RouterEventKind, detail?: T) {
	GLOBAL_ROUTER_EVENTS_TARGET.dispatchEvent(new CustomEvent(name, {detail}));
}

/**
 * Adds an event listener (or more) to an element and returns a function to unsubscribe.
 * @param $elem
 * @param type
 * @param listener
 * @param options
 */
export function addListener ($elem: EventTarget,
                             type: string[] | string,
                             listener: ((e?: Event) => void),
                             options?: boolean | AddEventListenerOptions): EventListenerSubscription {
	const types = Array.isArray(type) ? type : [type];
	types.forEach(t => $elem.addEventListener(t, listener, options));
	return () => types.forEach(t => $elem.removeEventListener(t, listener, options));
}


/**
 * Removes the event listeners in the array.
 * @param listeners
 */
export function removeListeners (listeners: EventListenerSubscription[]) {
	listeners.forEach(unsub => unsub());
}
