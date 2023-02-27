"use strict";
const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");

function assign (target, source) {
	Object.keys(source).forEach(key => {
		if (/^(number|boolean|string)$/.test(typeof source[key])) {
			target[key] = source[key];
		} else if (source[key]) {
			target[key] = assign(target[key] || {}, source[key]);
		}
	});
	return target;
}

function deepStrictEqual (...args) {
	try {
		assert.deepStrictEqual(...args);
	} catch (ex) {
		return false;
	}
	return true;
}

async function readJson (file) {
	try {
		return JSON.parse(await fs.readFile(file, "utf8"));
	} catch (ex) {
		return {};
	}
}

module.exports = async (appDir) => {
	console.log("Add locales to " + appDir);
	const rootPaths = [
		path.join(__dirname, "strings"),
		path.join(appDir, "src/strings"),
	];

	const ens = await Promise.all(
		rootPaths.map(root => readJson(path.join(root, "en-us.json")))
	);

	const sameEn = deepStrictEqual(...ens);

	let langs = await fs.readdir(rootPaths[0]);
	langs = langs.filter(lang => !/^en-us.json$/i.test(lang));

	await Promise.all(
		langs.map(async lang => {
			console.log("src/strings/" + lang);
			const filePaths = rootPaths.map(root => path.join(root, lang));
			if (sameEn) {
				await fs.copyFile(...filePaths);
			} else {
				const contents = await Promise.all(filePaths.map(readJson));
				if (deepStrictEqual(...contents)) {
					return;
				}
				await fs.writeFile(filePaths[1], JSON.stringify(assign(...contents.reverse()), 0, 2));
			}
		})
	);
};
