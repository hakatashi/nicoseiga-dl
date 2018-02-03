const download = require('download');
const fs = require('fs');
const {promisify} = require('util');

let matches;

(async () => {
	if (process.argv.length !== 3) {
		console.error('Usage: node index.js <image-url>');
		return 1;
	}

	const url = process.argv[2].trim();

	const data = await download(url);

	matches = url.match(/[\da-f]{16,}/);
	if (!matches) {
		throw new Error('key not found');
	}

	const keyString = matches[0].slice(0, 16);
	const key = Buffer.from(keyString, 'hex');

	// decrypt
	for (const index of data.keys()) {
		data[index] = data[index] ^ key[index % key.length];
	}

	matches = url.match(/\/([^/]+)$/);
	if (!matches) {
		throw new Error('filename not found');
	}

	const filename = `${matches[1]}.jpg`;

	await promisify(fs.writeFile)(filename, data);

	console.log(`DONE ${filename}`);
})();
