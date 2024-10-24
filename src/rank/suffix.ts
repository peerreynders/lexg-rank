// file: src/rank/suffix.ts
import { CODE } from './digit.js';

const DEFAULT_STEP = 8;
const SUFFIX_BASE = 36;
const FIRST_LETTER_INDEX = 10;
const LAST_INDEX = SUFFIX_BASE - 1;

function fromDigit(source: string, index: number) {
	const code = source.charCodeAt(index);
	// source is assumed to only contain valid characters
	// so default character is numeric digit
	return CODE.letterMin <= code && code <= CODE.letterMax
		? FIRST_LETTER_INDEX + (code - CODE.letterMin)
		: code - CODE.numberMin;
}

function fromIndex(index: number) {
	const i = index - FIRST_LETTER_INDEX;
	return String.fromCharCode(
		i >= 0 ? CODE.letterMin + i : CODE.numberMin + index
	);
}

const halfOf = (value: number) => Math.trunc(value / 2);
const midAboveIndex = (low: number, high: number) =>
	low + halfOf(high - low + 1);

// i.e. '0'
const FIRST_DIGIT = fromIndex(0);
const FIRST_CODE = FIRST_DIGIT.charCodeAt(0);

// i.e. index for 'i'
const MID_INDEX = midAboveIndex(0, LAST_INDEX);
const MID_DIGIT = fromIndex(MID_INDEX);

// i.e. 'z'
//const LAST_DIGIT = fromIndex(LAST_INDEX);
//const LAST_CODE = LAST_DIGIT.charCodeAt(0);

function increment(suffix?: string, step?: number, initial?: string) {
	if (!step) step = DEFAULT_STEP;

	if (!suffix) return initial ? initial : fromIndex(step);

	const last = suffix.length - 1;
	const index = fromDigit(suffix, last);
	let newIndex = index + step;

	if (newIndex <= LAST_INDEX)
		return suffix.slice(0, last) + fromIndex(newIndex);

	// See if we can ratchet up a more significant digit
	// if index equal or above skipLow
	// step addition would land beyond 'z'.
	const skipLow = LAST_INDEX - step + 1;
	for (let i = last - 1; i >= 0; i -= 1) {
		const digitIndex = fromDigit(suffix, i);
		if (digitIndex >= skipLow) continue;

		// not end; ratchet this digit
		const newDigit = fromIndex(digitIndex + step);
		return i > 0 ? suffix.slice(0, i) + newDigit : newDigit;
	}

	// if we're here we need to extend
	return suffix.slice(0, last) + 'z' + fromIndex(step);
}

function decrement(suffix?: string, step?: number, initial?: string) {
	if (!step) step = DEFAULT_STEP;

	if (!suffix) return initial ? initial : fromIndex(LAST_INDEX - step);

	const last = suffix.length - 1;
	const index = fromDigit(suffix, last);
	let newIndex = index - step;

	// Don't want trailing zeroes so exclude it.
	if (newIndex > 0) return suffix.slice(0, last) + fromIndex(newIndex);

	// See if we can ratchet down a more significant digit
	// if index equal or below skipHigh
	// step subtraction would land on '1' or below.
	const skipHigh = step;
	for (let i = last - 1; i >= 0; i -= 1) {
		const digitIndex = fromDigit(suffix, i);
		// i.e. is the digit '0' or '1'
		if (digitIndex <= skipHigh) continue;

		// above '1'; ratchet this digit down
		const newDigit = fromIndex(digitIndex - step);
		return i > 0 ? suffix.slice(0, i) + newDigit : newDigit;
	}

	// if we're here (lead 'zero' or '1') we need to prefix
	let pos = 0;
	// 1. scan through leading zeros and
	for (; ; pos += 1) if (FIRST_CODE !== suffix.charCodeAt(pos)) break;

	// 2. replace first non zero digit with '0*' (whatever step dictates)
	return suffix.slice(0, pos) + '0' + fromIndex(LAST_INDEX - step);
}

function fromBefore(
	suffix: string,
	index: number,
	bIndex: number | undefined,
	aIndex: number | undefined
) {
	if (suffix.length <= index) {
		// Need to append to suffix, perhaps even pad.
		let digitIndex = MID_INDEX;
		let extend = 0;

		if (aIndex !== undefined) {
			if (aIndex < 2) extend = 1;
			else digitIndex = midAboveIndex(0, aIndex);
		} else if (suffix.length < index) {
			throw new Error(
				'`aIndex` at `index` is required when `suffix.length < index`'
			);
		}

		return (
			suffix +
			'0'.repeat(index - suffix.length + extend) +
			fromIndex(digitIndex)
		);
	}

	if (bIndex === undefined)
		throw new Error(
			'`bIndex` at `index` is required when `suffix.length > index`'
		);

	const afterIndex = aIndex === undefined ? LAST_INDEX : aIndex;
	return suffix.slice(0, index) + fromIndex(midAboveIndex(bIndex, afterIndex));
}

function between(
	before: string | undefined,
	after: string | undefined,
	step?: number
) {
	if (!step) step = DEFAULT_STEP;

	if (!before) {
		if (!after) return MID_DIGIT;

		const afterLast = after.length - 1;
		const index = fromDigit(after, afterLast);
		return index > 1
			? after.slice(0, afterLast) + fromIndex(halfOf(index))
			: decrement(after, step);
	}

	if (!after) {
		const beforeLast = before.length - 1;
		const index = fromDigit(before, beforeLast);
		return index < LAST_INDEX
			? before.slice(0, beforeLast) +
					fromIndex(midAboveIndex(index, LAST_INDEX))
			: increment(before, step);
	}
	/*
	// Both `before` and `after` are supplied
	const length = after.length > before.length ? before.length : after.length;
	let i = 0;
	for (; i < length; i += 1) {
		const bIndex = fromDigit(before, i);
		const aIndex = fromDigit(after, i);
		console.log(before[i], bIndex, after[i], aIndex);
		if (aIndex <= bIndex) continue;

		if (bIndex + 1 < aIndex) return fromBefore(before, i, bIndex, aIndex);

		// digits are adjacent values;
		// scan to the next digit where
		// we can generate a mid point
		let index = -1,
			j = i + 1;
		for (; j < before.length; j += 1) {
			index = fromDigit(before, j);
			if (index !== LAST_INDEX) break;
		}
		console.log(i, j, before[j], index);
		return fromBefore(before, j, index, undefined);
		// TODO: add digit index for after
	}

	// Given that `before` < `after` just
	// extend the shortest part of `before`
	return fromBefore(before, length, undefined, undefined);
*/

	// -1 `before` is longer
	// 1 `after` is longer
	// 0 both same length
	const relation = Math.sign(after.length - before.length);
	const [min, max] =
		relation > 0
			? [before.length, after.length]
			: [after.length, before.length];

	// Scan over the shortest common length
	for (let i = 0; i < min; i += 1) {
		const bIndex = fromDigit(before, i);
		const aIndex = fromDigit(after, i);
		// When the `after` digit is less than or equal
		// to the `before` digit then move onto the digit
		// to the right
		if (bIndex + 1 >= aIndex) continue;

		// `before` digit is less than the `after` digit
		// AND digits are NOT adjacent
		return fromBefore(before, i, bIndex, aIndex);
	}

	// … still looking
	switch (relation) {
		case -1: {
			// scan to a place in `before` where a digit can be fit after
			for (let i = min; i < before.length; i += 1) {
				const bIndex = fromDigit(before, i);
				// Can't fit anything after `z`
				if (bIndex >= LAST_INDEX) continue;

				return fromBefore(before, i, bIndex, undefined);
			}
		}

		case 1: {
			// scan to a place in `after` where a digit can fit in front
			for (let i = min; i < after.length; i += 1) {
				const aIndex = fromDigit(after, i);
				// Can't fit anything in front of `0`
				if (aIndex < 1) continue;

				return fromBefore(before, i, undefined, aIndex);
			}
		}
	}

	// … still looking, so just extend `before`
	return fromBefore(before, max, undefined, undefined);
}

export {
	DEFAULT_STEP,
	between,
	decrement,
	increment,
	// for testing only
	fromBefore,
	fromDigit,
	fromIndex,
};
