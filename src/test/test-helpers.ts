/**
 * Clears the entire history.
 */
export function clearHistory () {
	const length = history.length;
	for (let i = 0; i < length; i++) {
		history.back();
	}
}
