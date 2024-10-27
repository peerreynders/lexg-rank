# lexg-rank
*Objective*: Given two (also previously generated) values generate a value in between them that maintains [lexographical ordering](https://en.wikipedia.org/wiki/Lexicographic_order) without having to update the two older values. An oversimplified example would be starting with `A`,`C` and “generating” `B` to arrive at `A`, `B`, `C`.

*Use Case*: A sequencing value for a list that is maintained via drag-and-drop, so that only the sequencing value of the moved item has to be updated.

Largely inspired by the value used within Atlassian's LexoRank.

Sources/Credits:
- YT: [JIRA lexorank explained](https://www.youtube.com/watch?v=OjQv9xMoFbg) ([slides](https://prezi.com/zu442jt_9z2m/lexorank/))
- MD: [LexoRanks — what are they and how to use them for efficient list sorting](https://medium.com/whisperarts/lexorank-what-are-they-and-how-to-use-them-for-efficient-list-sorting-a48fc4e7849f)
- SO: [Jira's Lexorank algorithm for new stories](https://stackoverflow.com/questions/40718900/jiras-lexorank-algorithm-for-new-stories)
- [Jira’s ranking system explained](https://tmcalm.nl/blog/lexorank-jira-ranking-system-explained/)
- GH: [kvandake/lexorank-ts](https://github.com/kvandake/lexorank-ts) source inspired handling of the rank core value.
- GH: [Kayron013/LexoRank](https://github.com/Kayron013/LexoRank) source strongly influenced handling of the rank suffix.

TLDR: If you are looking for a LexoRank value generator start with [lexorank](https://www.npmjs.com/package/lexorank). 

This is simply an exploration/attempt towards a more lightweight and “good enough” approach towards generating lexograpically ordered string values based on integers stored in JavaScript's [IEEE 754](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) numbers and digit character codes. The accepted tradeoff was to try to make generation based solely on distinct core values quick relative to operations requiring suffix generation.

---
```shell
$ cd lexg-rank
/lexg-rank$ pnpm install
Lockfile is up to date, resolution step is skipped
Packages: +9
+++++++++
Progress: resolved 9, reused 9, downloaded 0, added 9, done

devDependencies:
+ prettier 3.3.3
+ ts-blank-space 0.4.1
+ typescript 5.6.2
+ uvu 0.5.6

Done in 371ms
/lexg-rank$ pnpm test

> lexg-rank@0.0.0 test /lexg-rank
> node --import ts-blank-space/register ./test/index.ts

 digit  • • •   (3 / 3)
 suffix  • • • • • • • • • • • • • • • • • • • • • • • • • • • •   (28 / 28)
 core  • • • • • • • • • • • • • • •   (15 / 15)
 rank  • • • • • • • • • • • • • • • • • • • • • • • •   (24 / 24)

  Total:     70
  Passed:    70
  Skipped:   0
  Duration:  31.05ms

```
---

## Notes

A `Rank` is a string like "`0|hzzzzzzzzz:`" which breaks down to "[*Bucket*](#bucket)`|`[*Core*](#core)`:`[*Suffix*](#suffix)".

The relevant tests are found in [`test/rank.ts`](test/rank.ts).

`isRank(maybeRank: string): maybeRank is Rank` is a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) that can be used to narrow a `string` to a `Rank`; `assertIsRank(maybeRank: string): asserts maybeRank is Rank` is the equivalent [type assertion function](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions). 

However the typical starting point is `mid()` which returns a `0|hzzzzzzzzz:` `Rank`. `increment(rank)` is used to generate a new `Rank` value greater than `rank` (e.g. for a new item appended to a list after `rank`); `decrement(rank)` is used to generate a new `Rank` value less than `rank` (e.g. for an item placed in front of the top `rank`). `between(before, after)` generates a new `Rank` value that is greater than `before` but less than `after` (e.g. for an item added *between* two existing items). 

For the sake of discussion assume that `0|` on a `Rank` is just a static prefix until [Bucket](#bucket) is finally discussed near the end (i.e. it's only relevant under very specific circumstances).

### Core
The *core* is a 10 digit base36 string between `0000000000` and `zzzzzzzzzz` (inclusive, kind of) representing `0` to `3_656_158_440_062_975` (which is less than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) so all the relevant integers can be represented without loss by the double-precision 64-bit binary IEEE 754 format used by [JavaScript `number`s](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding).

The string can be natively converted to a `number` with [`parseInt(rank.slice(CORE_INDEX, CORE_END), 36)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt) while the `core` value is easily converted back to a string with [`core.toString(36).padStart(10, '0')`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString#radix).

Generating a new *core* value between two non-adjacent existing *core* values should require relatively little processing aside from the string-to-number and number-to-string conversions.

The *core* is the primary, required component of any `rank` for representing it's order position.

Functions like `increment` and `decrement` have an optional `gap` argument which specifies how many positions to "skip" when generating the next value; positions to be occupied by later item insertions (with new ranks generated with `between`). The gap defaults to `8`.

The first item in a new list is typically assigned a rank with `mid()` which will return `0|hzzzzzzzzz:`.

1. `0|hzzzzzzzzz:`

`increment('0|hzzzzzzzzz:')` is used to generate a rank for an appended item.

1. `0|hzzzzzzzzz:`
2. `0|i000000007:`

When prepending a new item `decrement('0|hzzzzzzzzz:')` is used to generate the appropriate rank.

1. `0|hzzzzzzzzr:`
2. `0|hzzzzzzzzz:`
3. `0|i000000007:`

To insert another item between 2 and 3 `between('0|hzzzzzzzzz:','0|i000000007:')` generates the needed rank.

1. `0|hzzzzzzzzr:`
2. `0|hzzzzzzzzz:`
3. `0|i000000003:`
4. `0|i000000007:`

Eventually the situation will arise where a rank between two adjacent core values is needed, e.g. `between('0|i000000002:','0|i000000003:')`:

1. `0|i000000002:`
1. `0|i000000002:i`
3. `0|i000000003:`
4. `0|i000000007:`

### Suffix

Not all rank values need a *suffix* and ideally most if not all ranks on a list benefit from *not* having a *suffix*. 

However a *suffix* is added once a rank needs to go between two existing ranks with adjacent *core* values. Suffixes make it possible to keep generating new ranks by letting their length grow, to accomodate the trailing characters needed to "preempt" an `after` rank value while still falling after the `before` rank value. 

Generating new ranks between ranks-with-suffix will be slower (and require ever growing strings). To eliminate suffixes, a list should be resequenced as soon as it goes dormant (nobody is manipulating or viewing it) so that all the rank values will be purely based on *core* values, adequately gapped to allow for future insertions of items. 

Suffixes allow rank values to temporarily "go into debt" so that they can continue to serve their intended purpose until such time in the future when the entire list can be resequenced with "clean and gapped" rank values.  

… to be continued.

### Bucket

A `Rank` value allows for the presence of a *bucket* but it's simplest when the bucket can just stay with the default of `0`.

The original LexoRank uses buckets when it *rebalances* **live** lists. Only two buckets ((`0`, `1`), (`1`, `2`), or (`2`, `0`)) may exist in the same list at the same time and are used to split the list during *rebalancing*.

For example, a list with bucket `0` ranking values can be rebalanced by gradually resequencing the list *in reverse* with "clean and gapped" bucket `1` ranks. During rebalancing the list can still be viewed in the correct order as the bucket values conform to lexographical ordering. Once rebalancing is complete all ranks in the list will be in bucket `1`. During the next *rebalance* rank values are moved from bucket `1` to `2`.

Finally a list with bucket `2` ranking values is rebalanced into bucket `0`. It's this part of rebalancing that introduces a huge tradeoff; `2` < `0` is not a lexographical order that can be managed with native (i.e. performant) [relational operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#relational_operators).

A list with ranks in bucket `2` and `0` has to be [sorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description) with the custom `compare(rankA: string, rankB: string): number` function instead, where:
- `1` for `rankB > rankA` 
- `0` for `rankA === rankB`
- `-1` for `rankB < rankA`

Note: For a descending sort, use `(rankA, rankB) => compare(rankB, rankA)`.

Forcing the use of the custom `compare` function on general usage just to acommodate lists with both bucket `2` and `0` ranks seems like "poor RoI"; this is why `between` doesn't even support ranks belonging to different buckets. 

However [`lexorank-ts`](https://github.com/kvandake/lexorank-ts) `initial(bucket)` points to another way of using buckets in aligment with native lexographical ordering:
- `0|1000000000:` for `bucket === 0`
- `${bucket}|y000000000:` otherwise

So:
- To *resequence* the ranks of a list start with `0|1000000000:` and replace the existing ranks by using `increment(current)` in order. (Significant room is left for inserting items at the top of the list.)
- To *recondition* the ranks of a list start with `1|y000000000:` (or `2|y000000000:`) and replace the existing ranks by using `decrement(current)` in **reverse** order. (Significant room is left for appending items at the bottom of the list.)

A list being reconditioned can be viewed (but not manipulated) in its intended order *while* the list is being reconditioned. The constraint is that a list can only be reconditioned twice before it needs to be resequenced.

A list being resequenced can't even be viewed in its intended order *while* the list is being resequenced but once complete is "clean and gapped" with maximum leeway for being reconditioned in the future.

Resequence when possible, recondition when needed; only make your use case as complicated as it needs to be—delay *actually needing* buckets within an implementation for as long as possible. 

### Iterator

The [`IterableIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) created by `makeFoward(bucket?, fromCore?, gap?)` can be used to support resequencing of a list. The `fromCore` argument defaults to `1000000000`<sub>36</sub> (leaving room for insertions in front of the list).

The `IterableIterator` created by `makeReverse(bucket?, fromCore?, gap?)` can be used to support reconditioning of a list. The `fromCore` argument defaults to `y000000000`<sub>36</sub> (leaving room for appending items at the end of the list).

Once these iterators exhaust their core values the gap is first interpolated before switching to generating values with suffixes (`increment` and `decrement` behave in an equivalent manner):

```ts
import { makeForward } from './src/rank/index.js';

const i = makeForward(0, parseInt('zzzzzzzzzm', 36));
const ranks = Array.from({ length: 14 }, (_v, _i) => {
  const rank = i.next().value;
  if (!rank) throw new Error('Never gonna happen TypeScript');
  return rank;
});

for (const rank of ranks) console.log(rank);
```

Output:
```shell
0|zzzzzzzzzm:
0|zzzzzzzzzu:
0|zzzzzzzzzw:
0|zzzzzzzzzx:
0|zzzzzzzzzy:
0|zzzzzzzzzy:8
0|zzzzzzzzzy:g
0|zzzzzzzzzy:o
0|zzzzzzzzzy:w
0|zzzzzzzzzy:z8
0|zzzzzzzzzy:zg
0|zzzzzzzzzy:zo
0|zzzzzzzzzy:zw
0|zzzzzzzzzy:zz8
```

This illustrates that `max()` doesn't represent the maximum rank; it's simply the maximum rank without a suffix.

```ts
import { makeReverse } from './src/rank/index.js';

let i = 14;
for (const rank of makeReverse(1, parseInt('000000000l', 36))) {
	console.log(rank);

	i -= 1;
	if (i < 1) break;
}
```

Output:
```shell
1|000000000l:
1|000000000d:
1|0000000005:
1|0000000002:
1|0000000001:
1|0000000001:r
1|0000000001:j
1|0000000001:b
1|0000000001:3
1|0000000001:0r
1|0000000001:0j
1|0000000001:0b
1|0000000001:03
1|0000000001:00r
```

This illustrates that `min()` isn't a useful rank for a list item as it's impossible to generate a rank for an item to go in front of an item with a `min()` rank.

