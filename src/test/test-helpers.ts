/**
 * Clears the entire history.
 */
export function clearHistory () {
	const length = history.length;
	for (let i = 0; i < length; i++) {
		history.back();
	}
}

/**
 * Add base element to head.
 * @param path
 */
export function addBaseTag (path: string = "/") {
	const $base = document.createElement("base");
	$base.href = `/`;
	document.head.appendChild($base);
	return $base;
}

/**
 * Wait X ms.
 * @param ms
 */
export function wait (ms: number) {
	return new Promise(res => setTimeout(res, ms));
}