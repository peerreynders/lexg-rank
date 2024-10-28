import { assertIsRank, between } from './src/rank/index.js';

const before = '0|0000000001:02r';
const after = '0|0000000001:03';

assertIsRank(before);
assertIsRank(after);

console.log(between(before, after)); // output: "0|0000000001:02v"
