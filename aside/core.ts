// file: explore/core.ts
// Explore the behaviour of lexorank's core value
 
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { LexoRank } from 'lexorank';

const fromRank = (rank: LexoRank) => rank.toString().slice(2,8);

const BUCKET_0 = LexoRank.min().getBucket();
const BUCKET_1 = BUCKET_0.next();

const core = suite('core');

// Initial values
core('"min" core value is "000000"', () => {
	// equivalent to ZERO_DECIMAL, MIN_DECIMAL
	const rank = LexoRank.min();
	const core = fromRank(rank);
	assert.is(core, '000000');
});

core('"max" core value is "zzzzzz"', () => {
	const rank = LexoRank.max();
	const core = fromRank(rank);
	assert.is(core, 'zzzzzz');
});

core('"middle" core value is "hzzzzz"', () => {
	const rank = LexoRank.middle();
	const core = fromRank(rank);
	assert.is(core, 'hzzzzz');
});

core('"INITIAL_MIN_VALUE" core value is "100000"', () => {
	// Expose INITIAL_MIN_DECIMAL
	const rank = LexoRank.initial(BUCKET_0);
  const core = fromRank(rank);
	assert.is(core, '100000');
});

core('"INITIAL_MAX_VALUE" core value is "y00000"', () => {
	// Expose INITIAL_MAX_DECIMAL
	const rank = LexoRank.initial(BUCKET_1);
  const core = fromRank(rank);
	assert.is(core, 'y00000');
});

// Incrementing
core('Incrementing "min" results in "INITIAL_MIN_VALUE"', () => {
	const rank = LexoRank.min().genNext();
  const core = fromRank(rank);
	assert.is(core, '100000');
});

core('Incrementing "min" twice results in "100008"', () => {
	const rank = LexoRank.min().genNext().genNext();
  const core = fromRank(rank);
	assert.is(core, '100008');
});

core('Incrementing "min" thrice results in "10000g"', () => {
	const rank = LexoRank.min().genNext().genNext().genNext();
  const core = fromRank(rank);
	assert.is(core, '10000g');
});

core('Incrementing "max" yields "0|zzzzzz:"', () => {
	// Strange but true
	const rank = LexoRank.max().genNext();
	assert.is(rank.toString(), '0|zzzzzz:');
});

core('Incrementing towards "max"', () => {
	const list: Array<[string, string]> = [
		['0|zzzzzm:','0|zzzzzu:'],
		['0|zzzzzn:','0|zzzzzv:'],
		['0|zzzzzo:','0|zzzzzw:'],
		['0|zzzzzp:','0|zzzzzx:'],
		['0|zzzzzq:','0|zzzzzy:'],
		['0|zzzzzr:','0|zzzzzv:'],
		['0|zzzzzs:','0|zzzzzv:'],
		['0|zzzzzt:','0|zzzzzw:'],
		['0|zzzzzu:','0|zzzzzw:'],
		['0|zzzzzv:','0|zzzzzx:'],
		['0|zzzzzw:','0|zzzzzx:'],
		['0|zzzzzx:','0|zzzzzy:'],
		['0|zzzzzy:','0|zzzzzy:i'],
		['0|zzzzzy:i','0|zzzzzy:r'],
		['0|zzzzzy:r','0|zzzzzy:v'],
		['0|zzzzzy:v','0|zzzzzy:x'],
		['0|zzzzzy:x','0|zzzzzy:y'],
		['0|zzzzzy:y','0|zzzzzy:z'],
		['0|zzzzzy:z','0|zzzzzy:zi'],
	];

	for (let i = 0; i < list.length; i += 1) {
		const [input, expected] = list[i];
		const rank = LexoRank.parse(input);
		assert.is(rank.genNext().toString(), expected);
	}	
});

// Decrementing
core('Decrementing "max" results in "INITIAL_MAX_VALUE"', () => {
	const rank = LexoRank.max().genPrev();
  const core = fromRank(rank);
	assert.is(core, 'y00000');
});

core('Decrementing "max" twice results in "xzzzzs"', () => {
	const rank = LexoRank.max().genPrev().genPrev();
  const core = fromRank(rank);
	assert.is(core, 'xzzzzs');
});

core('Decrementing "max" thrice results in "xzzzzk"', () => {
	const rank = LexoRank.max().genPrev().genPrev().genPrev();
  const core = fromRank(rank);
	assert.is(core, 'xzzzzk');
});

core('Decrementing "min" yields "0|000000:"', () => {
	// Strange but true
	const rank = LexoRank.min().genPrev();
	assert.is(rank.toString(), '0|000000:');
});

core('Decrementing towards "min"', () => {
	const list: Array<[string, string]> = [
		['0|00000d:','0|000005:'],
		['0|00000c:','0|000004:'],
		['0|00000b:','0|000003:'],
		['0|00000a:','0|000002:'],
		['0|000009:','0|000001:'],
		['0|000008:','0|000004:'],
		['0|000007:','0|000003:'],
		['0|000006:','0|000003:'],
		['0|000005:','0|000002:'],
		['0|000004:','0|000002:'],
		['0|000003:','0|000001:'],
		['0|000002:','0|000001:'],
		['0|000001:','0|000000:i'],
		['0|00000:i','0|000000:9'],
		['0|00000:9','0|000000:4'],
		['0|00000:4','0|000000:2'],
		['0|00000:2','0|000000:1'],
		['0|00000:1','0|000000:0i'],
	];

	for (let i = 0; i < list.length; i += 1) {
		const [input, expected] = list[i];
		const rank = LexoRank.parse(input);
		assert.is(rank.genPrev().toString(), expected);
	}	
});

export { core };
