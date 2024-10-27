// file: test/rank.ts
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as r from '../src/rank/index.js';

const rank = suite('rank');

const CORE_MAX = 3656158440062975;
const CORE_INITIAL_MIN = Math.pow(36, 9);
const CORE_MID = Math.trunc(CORE_MAX / 2);
const CORE_INITIAL_MAX = CORE_MAX - CORE_INITIAL_MIN - CORE_INITIAL_MIN + 1;

rank('"isRank" accepting valid strings', () => {
	const input = [
		'0|0000000000:',
		'1|0000000000:',
		'2|0000000000:',
		'0|zzzzzzzzzz:',
		'0|0123456789:',
		'0|abcdefghij:',
		'0|klmnopqrst:',
		'0|uvwxyz0123:',
		'0|zzzzzzzzzz:i',
		'0|zzzzzzzzzz:01234567890abcdefghijklmnopqrstuvwxyz',
	];

	for (let i = 0; i < input.length; i += 1) {
		const maybeRank = input[i];
		if (r.isRank(maybeRank)) continue;

		throw new assert.Assertion({
			message: `"${maybeRank}" was not recognized as a valid Rank`,
			operator: 'custom',
			actual: false,
			expects: true,
		});
	}
});

rank('"isRank" rejecting invalid strings', () => {
	const input = [
		'3|0000000000:', // invalid bucket
		'|0000000000:', // missing bucket
		'0|000000000A:', // no uppercase letters in core
		'0|0000000000:0', // no trailing zero on suffix
		'0|0000000000:i0',
		'0|0000000000:A', // no uppercase letter in suffix
		'0:0000000000:', // invalid core delimiter
		'0|0000000000|', // invalid suffix delimiter
		'0|0000000000', // missing suffix delimiter
		'0|000000000:', // not enough core digits
		'0|00000000000:', // too many core digits
	];

	for (let i = 0; i < input.length; i += 1) {
		const maybeRank = input[i];
		if (!r.isRank(maybeRank)) continue;

		throw new assert.Assertion({
			message: `"${maybeRank}" was not rejected as invalid`,
			operator: 'custom',
			actual: true,
			expects: false,
		});
	}
});

rank('"min"', () => {
	assert.is(r.min(), '0|0000000000:');
	assert.is(r.min(0), '0|0000000000:');
	assert.is(r.min(1), '1|0000000000:');
	assert.is(r.min(2), '2|0000000000:');
});

rank('"max"', () => {
	assert.is(r.max(), '0|zzzzzzzzzz:');
	assert.is(r.max(0), '0|zzzzzzzzzz:');
	assert.is(r.max(1), '1|zzzzzzzzzz:');
	assert.is(r.max(2), '2|zzzzzzzzzz:');
});

rank('"mid"', () => {
	assert.is(r.mid(), '0|hzzzzzzzzz:');
	assert.is(r.mid(0), '0|hzzzzzzzzz:');
	assert.is(r.mid(1), '1|hzzzzzzzzz:');
	assert.is(r.mid(2), '2|hzzzzzzzzz:');
});

rank('"initial"', () => {
	assert.is(r.initial(), '0|1000000000:');
	assert.is(r.initial(0), '0|1000000000:');
	assert.is(r.initial(1), '1|y000000000:');
	assert.is(r.initial(2), '2|y000000000:');
});

rank('"makeRank" successful', () => {
	assert.is(r.makeRank(0, 0), '0|0000000000:');
	assert.is(r.makeRank(1, 0), '1|0000000000:');
	assert.is(r.makeRank(2, 0), '2|0000000000:');
	assert.is(r.makeRank(0, CORE_MAX), '0|zzzzzzzzzz:');
	assert.is(r.makeRank(0, CORE_MID), '0|hzzzzzzzzz:');
});

rank('"makeRank" errors', () => {
	assert.throws(() => r.makeRank(0, -1));
	assert.throws(() => r.makeRank(0, CORE_MAX + 1));
});

const coreFromRank = (rank: string) => parseInt(rank.slice(2, 12), 36);

rank('"makeForward" initial default value', () => {
	const expected = (bucket: r.RankBucket) => r.makeRank(bucket, CORE_INITIAL_MIN);

	assert.is(r.makeForward().next().value, expected(0));
	assert.is(r.makeForward(1).next().value, expected(1));
	assert.is(r.makeForward(2, undefined).next().value, expected(2));
});

rank('"makeReverse" initial default value', () => {
	const expected = (bucket: r.RankBucket) => r.makeRank(bucket, CORE_INITIAL_MAX);

	assert.is(r.makeReverse().next().value, expected(0));
	assert.is(r.makeReverse(1).next().value, expected(1));
	assert.is(r.makeReverse(2, undefined).next().value, expected(2));
});

const TOWARDS_MAX_EXPECT: Array<string> = [
	'0|zzzzzzzzzm:',
	'0|zzzzzzzzzu:',
	'0|zzzzzzzzzw:',
	'0|zzzzzzzzzx:',
	'0|zzzzzzzzzy:',
	'0|zzzzzzzzzy:8',
	'0|zzzzzzzzzy:g',
	'0|zzzzzzzzzy:o',
	'0|zzzzzzzzzy:w',
	'0|zzzzzzzzzy:z8',
	'0|zzzzzzzzzy:zg',
	'0|zzzzzzzzzy:zo',
	'0|zzzzzzzzzy:zw',
	'0|zzzzzzzzzy:zz8',
] as const;

rank('Incrementing towards "max" (iterator)', () => {
	const expect = TOWARDS_MAX_EXPECT;
	const first = expect[0];
	r.assertIsRank(first);
	const fromCore = coreFromRank(first);

	let i = 0;
	for (const rank of r.makeForward(r.rankBucket(first), fromCore)) {
		assert.is(rank, expect[i]);
		i += 1;

		// This iterator is never done
		if (i >= expect.length) break;
	}
});

rank('Incrementing towards "max" ("increment")', () => {
	const expect = TOWARDS_MAX_EXPECT;
	const first = expect[0];
	r.assertIsRank(first);
	const core = coreFromRank(first);

	for (
		let i = 0, rank = r.makeRank(r.rankBucket(first), core);
		i < expect.length;
		i += 1, rank = r.increment(rank)
	)
		assert.is(rank, expect[i]);
});

const TOWARDS_MIN_EXPECT: Array<string> = [
	'0|000000000d:',
	'0|0000000005:',
	'0|0000000002:',
	'0|0000000001:',
	'0|0000000001:r',
	'0|0000000001:j',
	'0|0000000001:b',
	'0|0000000001:3',
	'0|0000000001:0r',
	'0|0000000001:0j',
	'0|0000000001:0b',
	'0|0000000001:03',
	'0|0000000001:00r',
] as const;

rank('Decrementing towards "min" (iterator)', () => {
	const expect = TOWARDS_MIN_EXPECT;
	const first = expect[0];
	r.assertIsRank(first);
	const fromCore = coreFromRank(first);

	let i = 0;
	for (const rank of r.makeReverse(r.rankBucket(first), fromCore)) {
		assert.is(rank, expect[i]);
		i += 1;

		// This iterator is never done
		if (i >= expect.length) break;
	}
});

rank('Decrementing towards "min" (iterator)', () => {
	const expect = TOWARDS_MIN_EXPECT;
	const first = expect[0];
	r.assertIsRank(first);
	const core = coreFromRank(first);

	for (
		let i = 0, rank = r.makeRank(r.rankBucket(first), core);
		i < expect.length;
		i += 1, rank = r.decrement(rank)
	)
		assert.is(rank, expect[i]);
});

rank('"between" throws on different buckets', () => {
	const before = '0|hzzzzzzzzy:';
	const after = '1|hzzzzzzzzz:';
	r.assertIsRank(before);
	r.assertIsRank(after);

	assert.throws(() => {
		r.between(before, after);
	});
});

rank('"between" on adjacent cores', () => {
	const before = '0|hzzzzzzzzy:';
	const after = '0|hzzzzzzzzz:';
	r.assertIsRank(before);
	r.assertIsRank(after);

	const actual = r.between(before, after);
	assert.is(actual, '0|hzzzzzzzzy:i');
});

rank('"between" on non-adjacent cores', () => {
	const before = '0|hzzzzzzzzx:';
	const after = '0|hzzzzzzzzz:';
	r.assertIsRank(before);
	r.assertIsRank(after);

	const actual = r.between(before, after);
	assert.is(actual, '0|hzzzzzzzzy:');
});

rank('"between" on identical cores with suffixes', () => {
	const before = '0|hzzzzzzzzz:i';
	const after = '0|hzzzzzzzzz:z';
	r.assertIsRank(before);
	r.assertIsRank(after);

	const actual = r.between(before, after);
	assert.is(actual, '0|hzzzzzzzzz:r');
});

const isOrderedTriplet = (t: readonly [string, string, string]) =>
	t[0] < t[1] && t[1] < t[2];
const isReverseTriplet = (t: readonly [string, string, string]) =>
	t[0] > t[1] && t[1] > t[2];

rank('"between" stress', () => {
	// head - "move `actual[0]`" between `actual[1]` (becoming `actual[0]`) and `actual[2]`
	//    replacing `actual[1]` with a new "between" value
	// !head - "move `actual[2]`" between `actual[0]` and `actual[1]` (becoming `actual[2]`)
	//    replacing `actual[1]` with a new "between" value
	let head = false;
	const bucket = 0;
	r.assertIsRankBucket(bucket);
	const actual: [r.Rank, r.Rank, r.Rank] = [
		r.initial(bucket),
		r.mid(bucket),
		r.max(bucket),
	];

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
		actual[1] = r.between(actual[0], actual[2])!;
		if (!isOrderedTriplet(actual)) throw makeError(i);

		head = !head;
	}
	// console.log(`[${actual[0]}, ${actual[1]}, ${actual[2]}]`, head);
});

// -1: [a,b] is ascending order
// 1: [b,a] is ascending order
// 0: both are equal
rank('"compare" same bucket', () => {
	assert.is(r.compare('0|hzzzzzzzzy:', '0|hzzzzzzzzz:'), -1);
	assert.is(r.compare('0|hzzzzzzzzz:', '0|hzzzzzzzzy:'), 1);
	assert.is(r.compare('0|hzzzzzzzzz:', '0|hzzzzzzzzz:'), 0);
});

rank('"compare" buckets 0 and 2', () => {
	// NOTE: 0 after 2
	assert.is(r.compare('0|hzzzzzzzzy:', '2|hzzzzzzzzz:'), 1);
	assert.is(r.compare('2|hzzzzzzzzz:', '0|hzzzzzzzzy:'), -1);
	assert.is(r.compare('0|hzzzzzzzzz:', '2|hzzzzzzzzz:'), 1);
	assert.is(r.compare('2|hzzzzzzzzz:', '0|hzzzzzzzzz:'), -1);
});

rank('"compare" buckets 0 and 1', () => {
	// 1 after 0 as expected
	assert.is(r.compare('1|hzzzzzzzzy:', '0|hzzzzzzzzz:'), 1);
	assert.is(r.compare('0|hzzzzzzzzz:', '1|hzzzzzzzzy:'), -1);
	assert.is(r.compare('1|hzzzzzzzzz:', '0|hzzzzzzzzz:'), 1);
	assert.is(r.compare('0|hzzzzzzzzz:', '1|hzzzzzzzzz:'), -1);
});

rank('"compare" buckets 1 and 2', () => {
	// 2 after 1 as expected
	assert.is(r.compare('2|hzzzzzzzzy:', '1|hzzzzzzzzz:'), 1);
	assert.is(r.compare('1|hzzzzzzzzz:', '2|hzzzzzzzzy:'), -1);
	assert.is(r.compare('2|hzzzzzzzzz:', '1|hzzzzzzzzz:'), 1);
	assert.is(r.compare('1|hzzzzzzzzz:', '2|hzzzzzzzzz:'), -1);
});

const reverseCompare = (a: string, b: string) => 0 - r.compare(a, b);

rank('Sort with "compare" buckets 0 and 2', () => {
	const LIST = [
		'0|1000000001:',
		'2|y000000004:',
		'0|1000000002:',
		'2|y000000005:',
		'0|1000000003:',
		'2|y000000006:',
	] as const;

	const ascending = LIST.slice().sort(r.compare);
	let top = ascending.slice(0, 3) as [string, string, string];
	assert.is(
		r.rankBucket(top[0] as r.Rank),
		2,
		'Wrong bucket in top half after ascending sort'
	);
	assert.ok(isOrderedTriplet(top), 'Ascending sort failed on top half');

	let bottom = ascending.slice(3, 6) as [string, string, string];
	assert.is(
		r.rankBucket(bottom[0] as r.Rank),
		0,
		'Wrong bucket in bottom half after ascending sort'
	);
	assert.ok(isOrderedTriplet(bottom), 'Ascending sort failed on bottom half');

	const descending = LIST.slice().sort(reverseCompare);
	top = descending.slice(0, 3) as [string, string, string];
	assert.is(
		r.rankBucket(top[0] as r.Rank),
		0,
		'Wrong bucket in top half after descending sort'
	);
	assert.ok(isReverseTriplet(top), 'Descending sort failed on top half');

	bottom = descending.slice(3, 6) as [string, string, string];
	assert.is(
		r.rankBucket(bottom[0] as r.Rank),
		2,
		'Wrong bucket in bottom half after descending sort'
	);
	assert.ok(isReverseTriplet(bottom), 'Descending sort failed on bottom half');
});

rank('Sort with "compare" buckets 0 and 1', () => {
	const LIST = [
		'1|1000000001:',
		'0|y000000004:',
		'1|1000000002:',
		'0|y000000005:',
		'1|1000000003:',
		'0|y000000006:',
	] as const;

	const ascending = LIST.slice().sort(r.compare);
	let top = ascending.slice(0, 3) as [string, string, string];
	assert.is(
		r.rankBucket(top[0] as r.Rank),
		0,
		'Wrong bucket in top half after ascending sort'
	);
	assert.ok(isOrderedTriplet(top), 'Ascending sort failed on top half');

	let bottom = ascending.slice(3, 6) as [string, string, string];
	assert.is(
		r.rankBucket(bottom[0] as r.Rank),
		1,
		'Wrong bucket in bottom half after ascending sort'
	);
	assert.ok(isOrderedTriplet(bottom), 'Ascending sort failed on bottom half');

	const descending = LIST.slice().sort(reverseCompare);
	top = descending.slice(0, 3) as [string, string, string];
	assert.is(
		r.rankBucket(top[0] as r.Rank),
		1,
		'Wrong bucket in top half after descending sort'
	);
	assert.ok(isReverseTriplet(top), 'Descending sort failed on top half');

	bottom = descending.slice(3, 6) as [string, string, string];
	assert.is(
		r.rankBucket(bottom[0] as r.Rank),
		0,
		'Wrong bucket in bottom half after descending sort'
	);
	assert.ok(isReverseTriplet(bottom), 'Descending sort failed on bottom half');
});

rank('Sort with "compare" buckets 1 and 2', () => {
	const LIST = [
		'2|1000000001:',
		'1|y000000004:',
		'2|1000000002:',
		'1|y000000005:',
		'2|1000000003:',
		'1|y000000006:',
	] as const;

	const ascending = LIST.slice().sort(r.compare);
	let top = ascending.slice(0, 3) as [string, string, string];
	assert.is(
		r.rankBucket(top[0] as r.Rank),
		1,
		'Wrong bucket in top half after ascending sort'
	);
	assert.ok(isOrderedTriplet(top), 'Ascending sort failed on top half');

	let bottom = ascending.slice(3, 6) as [string, string, string];
	assert.is(
		r.rankBucket(bottom[0] as r.Rank),
		2,
		'Wrong bucket in bottom half after ascending sort'
	);
	assert.ok(isOrderedTriplet(bottom), 'Ascending sort failed on bottom half');

	const descending = LIST.slice().sort(reverseCompare);
	top = descending.slice(0, 3) as [string, string, string];
	assert.is(
		r.rankBucket(top[0] as r.Rank),
		2,
		'Wrong bucket in top half after descending sort'
	);
	assert.ok(isReverseTriplet(top), 'Descending sort failed on top half');

	bottom = descending.slice(3, 6) as [string, string, string];
	assert.is(
		r.rankBucket(bottom[0] as r.Rank),
		1,
		'Wrong bucket in bottom half after descending sort'
	);
	assert.ok(isReverseTriplet(bottom), 'Descending sort failed on bottom half');
});

export { rank };
