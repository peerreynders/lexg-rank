// file: src/rank/digit.ts
const CODE = (() => {
	const code = {
		numberMin: '0'.charCodeAt(0),
		numberMax: '9'.charCodeAt(0),
		letterMin: 'a'.charCodeAt(0),
		letterMax: 'z'.charCodeAt(0),
	};
	return Object.freeze(code);
})();

// Check Base36 string of numbers and lower case letters
// '0'.charCodeAt(0) = 48
// '9'.charCodeAt(0) = 57
// 'a'.charCodeAt(0) = 97
// 'z'.charCodeAt(0) = 122
function satisfiesBase36(source: string, start = 0, end = source.length) {
	if (end <= start) return false;

	for (let i = start; i < end; i += 1) {
		const code = source.charCodeAt(i);
		if (
			!(
				(CODE.letterMin <= code && code <= CODE.letterMax) ||
				(CODE.numberMin <= code && code <= CODE.numberMax)
			)
		)
			return false;
	}

	return true;
}

export { CODE, satisfiesBase36 };
