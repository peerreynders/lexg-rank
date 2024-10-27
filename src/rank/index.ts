// file: src/rank/index.ts
import {
	CORE,
	between as betweenCore,
	decrement as decrementCore,
	increment as incrementCore,
} from './core.js';

import {
	DEFAULT_STEP,
	between as betweenSuffix,
	decrement as decrementSuffix,
	increment as incrementSuffix,
} from './suffix.js';

declare const validRank: unique symbol;

type Rank = string & {
	[validRank]: true;
};

type RankBucket = 0 | 1 | 2;

const BUCKET_CODES = [48, 49, 50];

const isRankBucket = (maybeBucket: number): maybeBucket is RankBucket =>
	Number.isInteger(maybeBucket) && 0 <= maybeBucket && maybeBucket <= 2;

function assertIsRankBucket(
	maybeBucket: number
): asserts maybeBucket is RankBucket {
	if (!isRankBucket(maybeBucket))
		throw new Error(`The number: ${maybeBucket} is not a valid rank bucket`);
}

// e.g. `0|zzzzzzzzzz:`
// suffix is optional but cannot end with a `0`
const rankPattern = /^[012]\|[0-9a-z]{10}:([0-9a-z]*[1-9a-z])?$/;

const isRank = (maybeRank: string): maybeRank is Rank =>
	rankPattern.test(maybeRank);

function assertIsRank(maybeRank: string): asserts maybeRank is Rank {
	if (!isRank(maybeRank)) {
		throw new Error(`The string: ${maybeRank} is not a valid rank value`);
	}
}

type RankPart = {
	core: number;
	suffix: string;
};

const BUCKET_INDEX = 0;
const CORE_INDEX = BUCKET_INDEX + 2;
const CORE_END = CORE_INDEX + 10;
const SUFFIX_INDEX = CORE_END + 1;

const fromRank = (rank: Rank): RankPart => ({
	core: parseInt(rank.slice(CORE_INDEX, CORE_END), 36),
	suffix: rank.slice(SUFFIX_INDEX),
});

const rankBucket = (rank: Rank) =>
	BUCKET_CODES.indexOf(rank.charCodeAt(BUCKET_INDEX)) as RankBucket;

const toRank = (bucket: RankBucket, { core, suffix }: RankPart) =>
	`${bucket}|${core.toString(36).padStart(10, '0')}:${suffix}` as Rank;

const PART_INITIAL_MAX = { core: CORE.initialMax, suffix: '' } as const;
const PART_INITIAL_MIN = { core: CORE.initialMin, suffix: '' } as const;
const PART_MAX = { core: CORE.max, suffix: '' } as const;
const PART_MID = { core: CORE.mid, suffix: '' } as const;
const PART_MIN = { core: CORE.min, suffix: '' } as const;

const initial = (bucket: RankBucket = 0) =>
	toRank(bucket, bucket === 0 ? PART_INITIAL_MIN : PART_INITIAL_MAX);

const max = (bucket: RankBucket = 0) => toRank(bucket, PART_MAX);
const mid = (bucket: RankBucket = 0) => toRank(bucket, PART_MID);
const min = (bucket: RankBucket = 0) => toRank(bucket, PART_MIN);

function makeRank(bucket: RankBucket, core: number) {
	if (core < CORE.min)
		throw new Error(
			`Core value has to be greater than or equal to ${CORE.min}`
		);
	if (core > CORE.max)
		throw new Error(`Core value has to be less than or equal to ${CORE.max}`);
	if (!Number.isInteger(core))
		throw new Error(`Core value ${core} isn't an integer`);

	return toRank(bucket, { core, suffix: '' });
}

const CORE_STOP_MAX = CORE.max - 1;
const CORE_STOP_MIN = CORE.min + 1;

function _increment(p: RankPart, gap: number, step: number) {
	if (p.suffix.length === 0) {
		if (p.core < CORE_STOP_MAX) {
			// Advance core
			p.core = incrementCore(p.core, gap);
			return;
		}

		// Intialize suffix
		p.core = CORE_STOP_MAX;
		p.suffix = incrementSuffix(undefined, step);
		return;
	}

	// Advance suffix
	p.suffix = incrementSuffix(p.suffix, step);
}

function _decrement(p: RankPart, gap: number, step: number) {
	if (p.suffix.length === 0) {
		// back up core
		if (p.core > CORE_STOP_MIN) {
			p.core = decrementCore(p.core, gap);
			return;
		}

		// Initialize suffix
		p.core = CORE_STOP_MIN;
		p.suffix = decrementSuffix(undefined, step);
		return;
	}

	// back up suffix
	p.suffix = decrementSuffix(p.suffix, step);
}

function makeForward(
	bucket: RankBucket = 0,
	fromCore: number = CORE.initialMin,
	gap: number = CORE.gap,
	step: number = DEFAULT_STEP
) {
	const p: RankPart = { core: fromCore, suffix: '' };
	const result: IteratorResult<Rank, undefined> = {
		value: toRank(bucket, p),
		done: false,
	};

	const iterator: IterableIterator<Rank, undefined, undefined> = {
		next() {
			result.value = toRank(bucket, p);
			_increment(p, gap, step);
			return result;
		},
		[Symbol.iterator](): IterableIterator<Rank, undefined, undefined> {
			return iterator;
		},
	};

	return iterator;
}

function makeReverse(
	bucket: RankBucket = 0,
	fromCore: number = CORE.initialMax,
	gap: number = CORE.gap,
	step: number = DEFAULT_STEP
) {
	const p: RankPart = { core: fromCore, suffix: '' };
	const result: IteratorResult<Rank, undefined> = {
		value: toRank(bucket, p),
		done: false,
	};

	const iterator: IterableIterator<Rank, undefined, undefined> = {
		next() {
			result.value = toRank(bucket, p);
			_decrement(p, gap, step);
			return result;
		},
		[Symbol.iterator](): IterableIterator<Rank, undefined, undefined> {
			return iterator;
		},
	};

	return iterator;
}

function increment(
	rank: Rank,
	gap: number = CORE.gap,
	step: number = DEFAULT_STEP
) {
	const p = fromRank(rank);
	_increment(p, gap, step);
	return toRank(rankBucket(rank), p);
}

function decrement(
	rank: Rank,
	gap: number = CORE.gap,
	step: number = DEFAULT_STEP
) {
	const p = fromRank(rank);
	_decrement(p, gap, step);
	return toRank(rankBucket(rank), p);
}

function between(
	rankBefore: Rank,
	rankAfter: Rank,
	step: number = DEFAULT_STEP
) {
	const bucket = rankBucket(rankBefore);
	if (rankBucket(rankAfter) !== bucket)
		throw new Error(
			`"between" doesn't support Ranks from distinct buckets; before: "${rankBefore}" after: "${rankAfter}"`
		);

	const before = fromRank(rankBefore);
	const after = fromRank(rankAfter);
	const relation = after.core - before.core - 1;
	// after's core is ____ before's core:
	// greater than (but not adjacent to): relation > 0
	// equal to: relation < 0
	// adjacent to: relation === 0

	return relation > 0
		? toRank(bucket, { core: betweenCore(before.core, after.core), suffix: '' })
		: relation < 0
			? toRank(bucket, {
					core: before.core,
					suffix: betweenSuffix(before.suffix, after.suffix, step),
				})
			: toRank(bucket, {
					core: before.core,
					suffix: betweenSuffix(before.suffix, '', step),
				});
}

function compare(rankA: string, rankB: string) {
	const a = rankBucket(rankA as Rank);
	const b = rankBucket(rankB as Rank);

	if (a === b) return rankA.localeCompare(rankB);

	// 2 (a) before 0 (b)
	if (a === 2 && b === 0) return -1;

	// 0 (a) after 2 (b)
	if (a === 0 && b === 2) return 1;

	return Math.sign(a - b);
}

export {
	assertIsRank,
	assertIsRankBucket,
	between,
	compare,
	decrement,
	increment,
	initial,
	isRank,
	isRankBucket,
	makeReverse,
	makeForward,
	makeRank,
	max,
	mid,
	min,
	rankBucket,
};

export type { Rank, RankBucket };
