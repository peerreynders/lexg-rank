// file: test/core.ts
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as c from '../src/rank/core.js';

const fromNumber = (value: number) => value.toString(36).padStart(10, '0');
//const fromString = (digits: string) => parseInt(digits,36);

const core = suite('core');

// Initial values
core('"min" core value is "0000000000"', () => {
	assert.is(fromNumber(c.CORE.min), '0000000000');
});

core('"max" core value is "zzzzzzzzzz"', () => {
	assert.is(fromNumber(c.CORE.max), 'zzzzzzzzzz');
});

core('"mid" core value is "hzzzzzzzzz"', () => {
	assert.is(fromNumber(c.CORE.mid), 'hzzzzzzzzz');
});

core('"initialMin" core value is "1000000000"', () => {
	assert.is(fromNumber(c.CORE.initialMin), '1000000000');
});

core('"initialMax" core value is "y000000000"', () => {
	assert.is(fromNumber(c.CORE.initialMax), 'y000000000');
});

// Incrementing
core('Incrementing "min" results in "initialMin"', () => {
	const next = c.increment(c.CORE.min);
	assert.is(next, c.CORE.initialMin);
	assert.is(fromNumber(next), '1000000000');
});

core('Incrementing "min" twice results in "1000000008"', () => {
	const next = c.increment(c.increment(c.CORE.min));
	assert.is(fromNumber(next), '1000000008');
});

core('Incrementing "min" thrice results in "100000000g"', () => {
	const next = c.increment(c.increment(c.increment(c.CORE.min)));
	assert.is(fromNumber(next), '100000000g');
});

core('Incrementing "max" yields "zzzzzzzzzz"', () => {
	const next = c.increment(c.CORE.max);
	assert.is(fromNumber(next), 'zzzzzzzzzz');
});

core('Incrementing towards "max"', () => {
	const list: Array<[number, string]> = [
		[3656158440062962, 'zzzzzzzzzu'],
		[3656158440062963, 'zzzzzzzzzv'],
		[3656158440062964, 'zzzzzzzzzw'],
		[3656158440062965, 'zzzzzzzzzx'],
		[3656158440062966, 'zzzzzzzzzy'],
		[3656158440062967, 'zzzzzzzzzv'],
		[3656158440062968, 'zzzzzzzzzv'],
		[3656158440062969, 'zzzzzzzzzw'],
		[3656158440062970, 'zzzzzzzzzw'],
		[3656158440062971, 'zzzzzzzzzx'],
		[3656158440062972, 'zzzzzzzzzx'],
		[3656158440062973, 'zzzzzzzzzy'],
		[3656158440062974, 'zzzzzzzzzy'],
	];

	for (let i = 0; i < list.length; i += 1) {
		const [input, expected] = list[i];
		assert.is(fromNumber(c.increment(input)), expected);
	}
});

// Decrementing
core('Decrementing "max" results in "initialMax"', () => {
	const previous = c.decrement(c.CORE.max);
	assert.is(previous, c.CORE.initialMax);
	assert.is(fromNumber(previous), 'y000000000');
});

core('Decrementing "max" twice results in "xzzzzzzzzs"', () => {
	const previous = c.decrement(c.decrement(c.CORE.max));
	assert.is(fromNumber(previous), 'xzzzzzzzzs');
});

core('Decrementing "max" thrice results in "xzzzzzzzzk"', () => {
	const previous = c.decrement(c.decrement(c.decrement(c.CORE.max)));
	assert.is(fromNumber(previous), 'xzzzzzzzzk');
});

core('Decrementing "min" yields "0000000000"', () => {
	const previous = c.decrement(c.CORE.min);
	assert.is(fromNumber(previous), '0000000000');
});

core('Decrementing towards "min"', () => {
	const list: Array<[number, string]> = [
		[13, '0000000005'],
		[12, '0000000004'],
		[11, '0000000003'],
		[10, '0000000002'],
		[9, '0000000001'],
		[8, '0000000004'],
		[7, '0000000003'],
		[6, '0000000003'],
		[5, '0000000002'],
		[4, '0000000002'],
		[3, '0000000001'],
		[2, '0000000001'],
		[1, '0000000000'],
	];

	for (let i = 0; i < list.length; i += 1) {
		const [input, expected] = list[i];
		assert.is(fromNumber(c.decrement(input)), expected);
	}
});

export { core };
