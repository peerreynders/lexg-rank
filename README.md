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

### Suffix

### Bucket

… to be continued.
