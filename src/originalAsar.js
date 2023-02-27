"use strict";
const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const asar = require("asar");
const os = require("os");

const download = require("./download");

process.on("unhandledRejection", (reason, p) => {
	console.error(reason);
	if (!process.exitCode) {
		process.exitCode = 1;
	}
});

async function findAsarPosix (dirs) {
	if (process.platform !== "win32") {
		dirs.unshift.apply(
			dirs,
			(
				await Promise.all(
					process.env.PATH.split(path.delimiter).map(async dir => {
						try {
							return path.dirname(await fs.readlink(path.join(dir, "gitkraken")));
						} catch (ex) {
							//
						}
					})
				)
			).filter(Boolean)
		);
		dirs = Array.from(new Set(dirs));
	}

	const asar = (process.platform === "darwin" ? "R" : "r") + "esources/app.asar";

	dirs = dirs.map(dir => (
		path.join(dir, asar)
	));

	for (let i = 0; i < dirs.length; i++) {
		try {
			return {
				version: getAsarVersion(dirs[i]),
				path: dirs[i],
			};
		} catch (ex) {
			//
		}
	}
}

async function findAsarWin32 () {
	const appDataLocal = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData/Local");
	const gitkrakenLocal = path.join(appDataLocal, "gitkraken");
	let items;
	try {
		items = await fs.readdir(gitkrakenLocal);
	} catch (ex) {
		return;
	}

	items = items.filter(item => (
		/^app\b/.test(item)
	));

	if (items.length > 1) {
		const semver = require("semver");
		items = items.sort((...vers) => {
			return semver.lt(...vers.map(ver => ver.replace(/^\D*/, ""))) ? 1 : -1;
		});
	}

	items = items.map(app => (
		path.join(gitkrakenLocal, app)
	));

	return findAsarPosix(items);
}

function findAsarDarwin () {
	return findAsarPosix([
		"/Applications/GitKraken.app/Contents",
	]);
}

function findAsarLinux () {
	// https://support.gitkraken.com/how-to-install#centos-6-7-rhel-fedora
	return findAsarPosix([
		// Debian & Ubuntu,
		"/usr/share/gitkraken",
		"/usr/share/GitKraken",
		// CentOS 6, 7, RHEL, Fedora
		"/opt/gitkraken",
		"/opt/GitKraken",
	]);
}

const findAsarFns = {
	win32: findAsarWin32,
	darwin: findAsarDarwin,
	linux: findAsarLinux,
};

async function findAsar () {
	const findAsarFn = findAsarFns[process.platform];
	assert.ok(findAsarFn, "This platform is not supported!");

	do {
		const asarPath = await findAsarFn();
		if (asarPath) {
			return asarPath;
		}
		await download();
	} while (1);
}

let asarPromise;

function getAsarVersion (asarFile) {
	return JSON.parse(asar.extractFile(asarFile, "package.json")).version;
}

module.exports = async () => {
	if (!asarPromise) {
		asarPromise = findAsar();
	}
	const originalAsar = await asarPromise;
	assert.ok(originalAsar, "Can not find GitKraken");
	const originalAsarBak = originalAsar.path + ".bak";
	const appDir = originalAsar.path.replace(/\.\w+$/, "");

	try {
		await fs.remove(appDir);
	} catch (ex) {
		if (ex.code !== "ENOENT") {
			throw ex;
		}
	}

	try {
		if (getAsarVersion(originalAsarBak) === originalAsar.version) {
			await fs.copyFile(originalAsarBak, originalAsar.path);
		}
	} catch (ex) {
		try {
			await fs.copyFile(originalAsar.path, originalAsarBak);
		} catch (ex) {
			//
		}
	}

	return originalAsar;
};
