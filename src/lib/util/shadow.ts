/**
 * Traverses the roots and returns the first match.
 * @param $elem
 * @param query
 */
export function traverseRoots<T> ($elem: Element, query: string): T | null {

	// If a shadow root doesn't exist we don't continue the traversal
	if ($elem.shadowRoot == null) {
		return null;
	}

	// Grab the rood node and query it
	const $root = (<any>$elem.shadowRoot.host).getRootNode();
	const match = $root.querySelector(query);
	if (match != null) {
		return <T>match;
	}

	// We continue the traversal if there was not matches
	return traverseRoots($root, query);
}
