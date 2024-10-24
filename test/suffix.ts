// file: test/suffix.ts
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as s from '../src/rank/suffix.js';

const DIGITS_ORDERED = '0123456789abcdefghijklmnopqrstuvwxyz';

const suffix = suite('suffix');

suffix('all digits are correctly mapped to their index', () => {
	for (let i = 0; i < DIGITS_ORDERED.length; i += 1)
		assert.is(s.fromDigit(DIGITS_ORDERED, i), i);
});

suffix('all indices are correctly mapped to their digit', () => {
	for (let i = 0; i < DIGITS_ORDERED.length; i += 1)
		assert.is(s.fromIndex(i), DIGITS_ORDERED[i]);
});

suffix('all indices are correctly mapped to their digit', () => {
	for (let i = 0; i < DIGITS_ORDERED.length; i += 1)
		assert.is(s.fromIndex(i), DIGITS_ORDERED[i]);
});

suffix('increment initializes to expected default', () => {
	// i.e. '0' + 8 (default step is 8)
	const expected = s.fromIndex(8);
	const actual = s.increment();
	assert.is(actual, expected);
});

suffix('increment initializes to expected default with specified step', () => {
	// i.e. '0' + 1 (specified step is 1)
	const expected = s.fromIndex(1);
	const actual = s.increment(undefined, 1);
	assert.is(actual, expected);
});

suffix('increment initializes to supplied default', () => {
	const initial = '000001';
	// i.e. step has no effect
	const actual = s.increment(undefined, 1, initial);
	assert.is(actual, initial);
});

suffix('increment with step 1', () => {
	// prettier-ignore
	const expected = [
		 '1',  '2',  '3',  '4',
		 '5',  '6',  '7',  '8',
		 '9',  'a',  'b',  'c',
		 'd',  'e',  'f',  'g',
		 'h',  'i',  'j',  'k',
		 'l',  'm',  'n',  'o',
		 'p',  'q',  'r',  's',
		 't',  'u',  'v',  'w',
		 'x',  'y',  'z', 'z1',
		'z2', 'z3', 'z4', 'z5',
	];
	let actual = s.increment(undefined, 1);
	for (let i = 0; ; ) {
		assert.is(actual, expected[i]);
		i += 1;
		if (i >= expected.length) break;
		actual = s.increment(actual, 1);
	}
});

suffix('increment with default step', () => {
	// prettier-ignore
	const expected = [
		   '8',   'g',   'o',   'w',
		  'z8',  'zg',  'zo',  'zw',
		 'zz8', 'zzg', 'zzo', 'zzw',
	];
	let actual = s.increment(undefined);
	for (let i = 0; ; ) {
		assert.is(actual, expected[i]);
		i += 1;
		if (i >= expected.length) break;
		actual = s.increment(actual);
	}
});

suffix('500 increments step 1; each greater than the previous', () => {
	let previous = '00000001';
	for (let i = 0; i < 500; i += 1) {
		const actual = s.increment(previous, 1);
		assert.ok(
			actual > previous,
			`${actual} should be greater than ${previous}`
		);
		previous = actual;
	}
});

suffix('500 increments default step; each greater than the previous', () => {
	let previous =
		'000000000000000000000000000000000000000000000000000000000000001';
	for (let i = 0; i < 500; i += 1) {
		const actual = s.increment(previous);
		assert.ok(
			actual > previous,
			`${actual} should be greater than ${previous}`
		);
		previous = actual;
	}
});

suffix('decrement initializes to expected default', () => {
	// i.e. 'z' - 8 (default step is 8)
	const expected = s.fromIndex(35 - 8);
	const actual = s.decrement();
	assert.is(actual, expected);
});

suffix('decrement initializes to expected default with specified step', () => {
	// i.e. 'z' - 1 (specified step is 1)
	const expected = s.fromIndex(35 - 1);
	const actual = s.decrement(undefined, 1);
	assert.is(actual, expected);
});

suffix('decrement initializes to supplied default', () => {
	const initial = 'zzzzzz';
	// i.e. step has no effect
	const actual = s.decrement(undefined, 1, initial);
	assert.is(actual, initial);
});

suffix('decrement with step 1', () => {
	// prettier-ignore
	const expected = [
		 'y',   'x',   'w',   'v',
		 'u',   't',   's',   'r',
		 'q',   'p',   'o',   'n',
		 'm',   'l',   'k',   'j',
		 'i',   'h',   'g',   'f',
		 'e',   'd',   'c',   'b',
		 'a',   '9',   '8',   '7',
		 '6',   '5',   '4',   '3',
		 '2',   '1',   '0y',  '0x',
		 '0w',  '0v',  '0u',  '0t',
		 '0s',  '0r',  '0q',  '0p',
		 '0o',  '0n',  '0m',  '0l',
		 '0k',  '0j',  '0i',  '0h',
		 '0g',  '0f',  '0e',  '0d',
		 '0c',  '0b',  '0a',  '09',
		 '08',  '07',  '06',  '05',
		 '04',  '03',  '02',  '01',
		 '00y', '00x', '00w', '00v',
	];
	let actual = s.decrement(undefined, 1);
	for (let i = 0; ; ) {
		assert.is(actual, expected[i]);
		i += 1;
		if (i >= expected.length) break;
		actual = s.decrement(actual, 1);
	}
});

suffix('decrement with default step', () => {
	// prettier-ignore
	const expected = [
		 'r',    'j',    'b',    '3',
		 '0r',   '0j',   '0b',   '03',
		 '00r',  '00j',  '00b',  '003',
		 '000r', '000j', '000b', '0003',
	];
	let actual = s.decrement(undefined);
	for (let i = 0; ; ) {
		assert.is(actual, expected[i]);
		i += 1;
		if (i >= expected.length) break;
		actual = s.decrement(actual);
	}
});

suffix('500 decrements step 1; each lesser than the previous', () => {
	let previous = 'zzzzzzzz';
	for (let i = 0; i < 500; i += 1) {
		const actual = s.decrement(previous, 1);
		assert.ok(actual < previous, `${actual} should be lesser than ${previous}`);
		previous = actual;
	}
});

suffix('500 decrements default step; each lesser than the previous', () => {
	let previous =
		'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
	for (let i = 0; i < 500; i += 1) {
		const actual = s.decrement(previous);
		assert.ok(actual < previous, `${actual} should be lesser than ${previous}`);
		previous = actual;
	}
});

suffix('fromBefore', () => {
	let before = 'h';
	let after = 'hh';
	let index = 1;
	let bIndex = s.fromDigit(before, 1); // should be ignored
	let aIndex = s.fromDigit(after, index);
	let actual = s.fromBefore(before, index, bIndex, aIndex);
	assert.is(actual, 'h9');

	after = 'h1';
	aIndex = s.fromDigit(after, index);
	actual = s.fromBefore(before, index, bIndex, aIndex);
	assert.is(actual, 'h0i');

	after = 'h01';
	index = 2;
	aIndex = s.fromDigit(after, index);
	actual = s.fromBefore(before, index, bIndex, aIndex);
	assert.is(actual, 'h00i');

	// `aIndex` has to be `undefined`
	// when `index` is beyond both
	after = 'i';
	index = 1;
	actual = s.fromBefore(before, index, bIndex, undefined);
	assert.is(actual, 'hi');
});

suffix('between edge case—both before and after are empty', () => {
	let actual = s.between('', '');
	assert.is(actual, 'i', 'initial between using default step');

	actual = s.between('', '', 1);
	assert.is(actual, 'i', 'initial between using step 1');
});

suffix('between—empty before', () => {
	// mid point below last digit-highest digit
	let actual = s.between('', 'hslz');
	assert.is(actual, 'hslh');

	// mid point below last digit
	actual = s.between('', 'hsl4');
	assert.is(actual, 'hsl2');

	// mid point below last digit-tighter
	actual = s.between('', 'hsl3');
	assert.is(actual, 'hsl1');

	// mid point below last digit-tightest
	actual = s.between('', 'hsl2');
	assert.is(actual, 'hsl1');

	// forcing decrement-step 1
	actual = s.between('', 'hsl1', 1);
	assert.is(actual, 'hsk');

	// forcing decrement-default step
	actual = s.between('', 'hsl1');
	assert.is(actual, 'hsd');

	// forcing decrement - not tight with step 1
	actual = s.between('', 'hs91', 1);
	assert.is(actual, 'hs8');

	// forcing decrement - tightest with default step
	actual = s.between('', 'hs91');
	assert.is(actual, 'hs1');

	// forcing decrement - losing only 1 digit with step 1 …
	actual = s.between('', 'hs81', 1);
	assert.is(actual, 'hs7');

	// forcing decrement - … but losing 2 digits as
	// penulitimate digit is tight with default step
	actual = s.between('', 'hs81');
	assert.is(actual, 'hk');

	// mid point below, tightest with single digit
	actual = s.between('', '2');
	assert.is(actual, '1');

	// forcing decrement on single digit with step 1
	actual = s.between('', '1', 1);
	assert.is(actual, '0y');

	// forcing decrement on single digit with default step
	actual = s.between('', '1');
	assert.is(actual, '0r');
});

suffix('between—empty after', () => {
	// mid point above last digit-lowest digit (no trailing zeros)
	let actual = s.between('hsl1', '');
	assert.is(actual, 'hsli');

	// mid point above last digit
	actual = s.between('hslw', '');
	assert.is(actual, 'hsly');

	// mid point above last digit-tighter
	actual = s.between('hslx', '');
	assert.is(actual, 'hsly');

	// mid point above last digit-tightest
	actual = s.between('hsly', '');
	assert.is(actual, 'hslz');

	// forcing increment-step 1
	actual = s.between('hslz', '', 1);
	assert.is(actual, 'hsm');

	// forcing increment-default step
	actual = s.between('hslz', '');
	assert.is(actual, 'hst');

	// forcing decrement - losing only 1 digit with step 1 …
	actual = s.between('hrsz', '', 1);
	assert.is(actual, 'hrt');

	// forcing increment - … but losing 2 digits as
	// penulitimate digit is tight with default step
	actual = s.between('hrsz', '');
	assert.is(actual, 'hz');

	// mid point above, tightest with single digit
	actual = s.between('y', '');
	assert.is(actual, 'z');

	// forcing increment on single digit with step 1 (no trailing zeros)
	actual = s.between('z', '', 1);
	assert.is(actual, 'z1');

	// forcing increment on single digit with default step
	actual = s.between('z', '');
	assert.is(actual, 'z8');
});

suffix('between—midpoint single digit', () => {
	let actual = s.between('1', 'z');
	assert.is(actual, 'i');

	actual = s.between('2', 'z');
	assert.is(actual, 'j');

	actual = s.between('v', 'z');
	assert.is(actual, 'x');

	actual = s.between('w', 'z');
	assert.is(actual, 'y');

	actual = s.between('x', 'z');
	assert.is(actual, 'y');

	actual = s.between('1', 'y');
	assert.is(actual, 'i');

	actual = s.between('1', 'x');
	assert.is(actual, 'h');

	actual = s.between('1', 'w');
	assert.is(actual, 'h');

	actual = s.between('1', '6');
	assert.is(actual, '4');

	actual = s.between('1', '5');
	assert.is(actual, '3');

	actual = s.between('1', '4');
	assert.is(actual, '3');

	actual = s.between('1', '3');
	assert.is(actual, '2');
});

suffix('between—midpoint two digit first match', () => {
	let actual = s.between('h1', 'hz');
	assert.is(actual, 'hi');

	actual = s.between('h2', 'hz');
	assert.is(actual, 'hj');

	actual = s.between('hv', 'hz');
	assert.is(actual, 'hx');

	actual = s.between('hw', 'hz');
	assert.is(actual, 'hy');

	actual = s.between('hx', 'hz');
	assert.is(actual, 'hy');

	actual = s.between('h1', 'hy');
	assert.is(actual, 'hi');

	actual = s.between('h1', 'hx');
	assert.is(actual, 'hh');

	actual = s.between('h1', 'hw');
	assert.is(actual, 'hh');

	actual = s.between('h1', 'h6');
	assert.is(actual, 'h4');

	actual = s.between('h1', 'h5');
	assert.is(actual, 'h3');

	actual = s.between('h1', 'h4');
	assert.is(actual, 'h3');

	actual = s.between('h1', 'h3');
	assert.is(actual, 'h2');
});

suffix('between—midpoint three digit first two match', () => {
	let actual = s.between('hh1', 'hhz');
	assert.is(actual, 'hhi');

	actual = s.between('hh2', 'hhz');
	assert.is(actual, 'hhj');

	actual = s.between('hhv', 'hhz');
	assert.is(actual, 'hhx');

	actual = s.between('hhw', 'hhz');
	assert.is(actual, 'hhy');

	actual = s.between('hhx', 'hhz');
	assert.is(actual, 'hhy');

	actual = s.between('hh1', 'hhy');
	assert.is(actual, 'hhi');

	actual = s.between('hh1', 'hhx');
	assert.is(actual, 'hhh');

	actual = s.between('hh1', 'hhw');
	assert.is(actual, 'hhh');

	actual = s.between('hh1', 'hh6');
	assert.is(actual, 'hh4');

	actual = s.between('hh1', 'hh5');
	assert.is(actual, 'hh3');

	actual = s.between('hh1', 'hh4');
	assert.is(actual, 'hh3');

	actual = s.between('hh1', 'hh3');
	assert.is(actual, 'hh2');
});

suffix('between—adjacent digits (first)', () => {
	let actual = s.between('g', 'h');
	assert.is(actual, 'gi');

	actual = s.between('g1', 'h');
	assert.is(actual, 'gi');

	actual = s.between('g2', 'h');
	assert.is(actual, 'gj');

	actual = s.between('g3', 'h');
	assert.is(actual, 'gj');

	actual = s.between('g4', 'h');
	assert.is(actual, 'gk');

	actual = s.between('gv', 'h');
	assert.is(actual, 'gx');

	actual = s.between('gw', 'h');
	assert.is(actual, 'gy');

	actual = s.between('gx', 'h');
	assert.is(actual, 'gy');

	actual = s.between('gy', 'h');
	assert.is(actual, 'gz');

	actual = s.between('gz', 'h');
	assert.is(actual, 'gzi');
});

suffix('between—adjacent digits (second)', () => {
	let actual = s.between('hg', 'hh');
	assert.is(actual, 'hgi');

	actual = s.between('hg1', 'hh');
	assert.is(actual, 'hgi');

	actual = s.between('hg2', 'hh');
	assert.is(actual, 'hgj');

	actual = s.between('hg3', 'hh');
	assert.is(actual, 'hgj');

	actual = s.between('hg4', 'hh');
	assert.is(actual, 'hgk');

	actual = s.between('hgv', 'hh');
	assert.is(actual, 'hgx');

	actual = s.between('hgw', 'hh');
	assert.is(actual, 'hgy');

	actual = s.between('hgx', 'hh');
	assert.is(actual, 'hgy');

	actual = s.between('hgy', 'hh');
	assert.is(actual, 'hgz');

	actual = s.between('hgz', 'hh');
	assert.is(actual, 'hgzi');
});

suffix('between—fallback', () => {
	let actual = s.between('gzz', 'hz');
	assert.is(actual, 'gzzi');
});

const isOrderedTriplet = (t: readonly [string, string, string]) =>
	t[0] < t[1] && t[1] < t[2];

suffix('between—stress', () => {
	// head - "move `actual[0]`" between `actual[1]` (becoming `actual[0]`) and `actual[2]`
	//    replacing `actual[1]` with a new "between" value
	// !head - "move `actual[2]`" between `actual[0]` and `actual[1]` (becoming `actual[2]`)
	//    replacing `actual[1]` with a new "between" value
	let head = false;
	const actual: [string, string, string] = ['1', 'i', 'z'];

	const makeError = (i: number) => {
		const expects = actual.slice().sort() as unknown as readonly [
			string,
			string,
			string,
		];
		const position = head ? 'head' : 'tail';
		const message = `"${actual[1]}" is NOT between "${actual[0]}" and "${actual[2]}" after being moved from the ${position} on \`i = ${i}\`.`;

		return new assert.Assertion({
			message,
			operator: 'custom',
			actual,
			expects,
		});
	};

	for (let i = 0; i < 100; i += 1) {
		// New before/after values
		actual[head ? 0 : 2] = actual[1];
		// New middle value
		actual[1] = s.between(actual[0], actual[2])!;
		if (!isOrderedTriplet(actual)) throw makeError(i);

		head = !head;
	}
	// console.log(`[${actual[0]}, ${actual[1]}, ${actual[2]}]`, head);
});

export { suffix };
