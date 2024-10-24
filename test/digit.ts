// file: test/digit.ts
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { satisfiesBase36 } from '../src/rank/digit.js';

const DIGITS_ORDERED = '0123456789abcdefghijklmnopqrstuvwxyz';

const digit = suite('digit');

digit('numeric digits and lowercase letters are accepted', () => {
	assert.ok(satisfiesBase36(DIGITS_ORDERED));
});

digit('empty and space are not a suffix', () => {
	assert.not(satisfiesBase36(''));
	assert.not(satisfiesBase36(' '));
});

digit('uppercase letters are rejected', () => {
	let base = 'A'.charCodeAt(0);
	for (let i = 0; i < 26; i += 1)
		assert.not(satisfiesBase36(String.fromCharCode(base + i)));
});

export { digit };
