/**
 * Hook up a click listener to the window that, for all anchor tags
 * that has a relative HREF, uses the history API instead.
 */
export function ensureAnchorHistory () {
	window.addEventListener("click", (e: MouseEvent) => {

		// Find the target by using the composed path to get the element through the shadow boundaries.
		const $anchor = ("composedPath" in e as any) ? e.composedPath()[0] : e.target;

		// Abort if the event is not about the anchor tag
		if (!($anchor instanceof HTMLAnchorElement)) {
			return;
		}

		// Get the HREF value from the anchor tag
		const href = $anchor.href;

		// Make sure the path is relative to the origin or abort
		// We want to allow links to absolute paths without
		// using the history API.
		if (!href.startsWith(location.origin)) {
			return;
		}

		// Remove the origin from the start of the HREF to get the path
		const path = href.replace(new RegExp(`^${location.origin}`), "");

		// Prevent the default behavior
		e.preventDefault();

		// Change the history!
		history.pushState(null, "", path);
	});
}