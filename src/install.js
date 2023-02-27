#!/usr/bin/env node
"use strict";
const spawn = require("./spawn");
const sudo = require("./sudo");
const fs = require("fs-extra");
const asar = require("asar");
const path = require("path");
const os = require("os");

const getOriginalAsar = require("./originalAsar");
const platform = require("./platform");
const crack = require("./crack");
const local = require("./local");

async function applyPatch (originalAsar, platform) {
	const fileName = `${platform}-${originalAsar.version}.patch`;
	let tmpFile = path.join(os.tmpdir(), fileName);
	let repository = require(path.resolve(__dirname, "../package.json")).repository;
	repository = (repository.url || repository).replace(/^\w+\+(.*)\.git/, "$1");
	const url = `${repository}/releases/download/v${originalAsar.version}/${fileName}`;
	const localFile = path.resolve(__dirname, `../patches/${fileName}`);
	let asarPatch;
	try {
		await spawn([
			"curl",
			"--fail",
			"--remote-time",
			"--insecure",
			"--location",
			"--output",
			tmpFile,
			url,
		], {
			stdio: "inherit",
			echo: true,
		});
		asarPatch = tmpFile;
	} catch (ex) {
		await fs.remove(tmpFile);
		tmpFile = null;
		asarPatch = localFile;
	}

	await spawn([
		"git",
		"apply",
		asarPatch,
	], {
		cwd: path.dirname(originalAsar.path),
		encoding: "utf8",
		stdio: "inherit",
		echo: true,
	});
	if (tmpFile && !process.env.CI) {
		await fs.move(tmpFile, localFile, {
			overwrite: true,
		});
	}
}

;(async () => {
	await sudo();
	const execOpts = {
		stdio: "ignore",
	};
	try {
		if (process.platform === "win32") {
			await spawn(["taskkill", "/f", "/im", "gitkraken.exe"], execOpts);
		} else {
			await spawn(["killall", "gitkraken"], execOpts);
		}
	} catch (ex) {
		//
	}

	const originalAsar = await getOriginalAsar();

	try {
		try {
			await applyPatch(originalAsar, platform);
		} catch (ex) {
			if (platform.startsWith("win")) {
				await applyPatch(originalAsar, `win${/64$/.test(platform) ? 32 : 64}`);
			} else {
				throw ex;
			}
		}
	} catch (ex) {
		const appDir = originalAsar.path.replace(/\.\w+$/, "");

		console.log("Extracting " + originalAsar.path);
		await asar.extractAll(originalAsar.path, appDir);

		await crack(appDir);
		await local(appDir);
	}

	console.log("Done!");
})();
