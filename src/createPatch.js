"use strict";
const spawn = require("./spawn");
const sudo = require("./sudo");
const fs = require("fs-extra");
const asar = require("asar");
const path = require("path");
const util = require("util");

const getOriginalAsar = require("./originalAsar");
const zhConvert = require("./zhConvert");
const platform = require("./platform");
const crack = require("./crack");
const local = require("./local");

;(async () => {
	const opts = {
		pack: true,
		patch: true,
	};

	process.argv.some(arg => {
		if (/^--(no-)?(\w+)$/.test(arg)) {
			opts[RegExp.$2] = !RegExp.$1;
		}
	});

	let originalAsar;

	if (opts.pack || opts.patch) {
		await sudo();
		originalAsar = await getOriginalAsar();
	}

	const appDir = path.resolve("app");
	const patchedAsar = appDir + ".asar";

	if (opts.pack) {
		console.log("Extracting " + originalAsar.path);
		await asar.extractAll(originalAsar.path, appDir);
	}

	await zhConvert();
	await crack(appDir);
	await local(appDir);

	if (opts.pack) {
		console.log("Packaging " + appDir);
		await util.promisify(asar.createPackageWithOptions)(appDir, patchedAsar, {
			unpack: "{*.node,*.pdb,*.exe,*.dll,THIRD-PARTY-LICENSES.txt,.DS_Store}",
			dot: true,
		});
	}

	if (opts.patch) {
		const version = require(path.join(appDir, "package.json")).version;
		const asarPatchFile = path.resolve(`patches/${platform}-${version}.patch`);
		console.log("Creating git patch " + asarPatchFile);
		// await bsdiff.diff(originalAsar, patchedAsar, asarPatchFile)
		let patchData = await spawn([
			"git",
			"diff",
			"--binary",
			"--no-index",
			"--no-prefix",
			originalAsar.path,
			patchedAsar,
		], {
			echo: true,
			encoding: "utf8",
		}).catch(ex => {
			if (ex.stdout.length) {
				return ex.stdout;
			} else {
				throw ex;
			}
		});

		patchData = patchData.replace(/^(diff\s+--git\s+)[^\r\n]+/, "$1a/app.asar b/app.asar");
		await fs.writeFile(asarPatchFile, patchData);
	}

	console.log("Done!");
})();
