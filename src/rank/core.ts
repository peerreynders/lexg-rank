// file: src/rank/core
const CORE = (() => {
	// '0000000000'
	const min = 0;
	// 'zzzzzzzzzz'
	const max = 3656158440062975;
	// 'hzzzzzzzzz'
	const mid = between(min, max);
	// '1000000000'
	const initialMin = 101559956668416;
	// 'y000000000'
	const initialMax = max - initialMin - initialMin + 1;
	// Default gap
	const gap = 8;

	return Object.freeze({
		gap,
		initialMax,
		initialMin,
		max,
		mid,
		min,
	});
})();

function between(before: number, after: number) {
	return before + Math.trunc((after - before) / 2);
}

function increment(value: number, gap: number = CORE.gap) {
	if (value === CORE.min) return CORE.initialMin;

	return CORE.max - value > gap ? value + gap : between(value, CORE.max);
}

function decrement(value: number, gap: number = CORE.gap) {
	if (value === CORE.max) return CORE.initialMax;

	return value - CORE.min > gap ? value - gap : between(CORE.min, value);
}

export { CORE, between, increment, decrement };
