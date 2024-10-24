# lexg-rank

*Objective*: Given two (also previously generated values) generate a value in between them that maintains [lexographical ordering](https://en.wikipedia.org/wiki/Lexicographic_order) without having to update the two older values. An oversimplified example would be starting with `A`,`C` and “generating” `B` to arrive at `A`, `B`, `C`.

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
