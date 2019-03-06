import { GLOBAL_ROUTER_EVENTS_TARGET } from "../lib/config";
import { ensureHistoryEvents, historyPatches } from "../lib/util/history";
import { clearHistory } from "./test-helpers";

describe("history", () => {
	before(() => {
		ensureHistoryEvents();
	});
	beforeEach(() => {
	});
	after(() => {
		clearHistory();
	});

	it("[ensureHistoryEvents] should patch history object", (done) => {
		const expectedEventCount = historyPatches.reduce((acc, patch) => acc + patch[1].length, 0);
		let eventCount = 0;

		// Checks whether the amount of events that have been called is correct.
		const testExpectedEventCount = () => {
			if (eventCount >= expectedEventCount) {
				done();
			}
		};

		// Hook up expected events
		for (const [name, events] of historyPatches) {
			for (const event of events) {
				GLOBAL_ROUTER_EVENTS_TARGET.addEventListener(event, () => {
					eventCount += 1;
					testExpectedEventCount();
				}, {once: true});
			}
		}

		// Dispatch events with garbage data (the data doesn't matter)
		for (const [name] of historyPatches) {
			(<any>history)[name](...["", "", ""]);
		}
	});
});
