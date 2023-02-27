"use strict";
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const platform = require("./platform");
const spawn = require("./spawn");

const URLS = {
	win32: `https://release.gitkraken.com/${platform}/GitKrakenSetup.exe`,
	darwin: "https://release.gitkraken.com/darwin/installGitKraken.dmg",
	debian: "https://release.gitkraken.com/linux/gitkraken-amd64.deb",
	linux: "https://release.gitkraken.com/linux/gitkraken-amd64.tar.gz",
};

const INSTS = {
	win32: async (file) => {
		await spawn([
			file,
			"/verysilent",
			"/nolaunch",
		], {
			stdio: "inherit",
			echo: true,
		});
	},
	darwin: async (file) => {
		const hdi = await spawn([
			"hdiutil",
			"attach",
			file,
		], {
			encoding: "utf8",
			echo: true,
		});

		console.log(hdi);

		const hfs = hdi.match(/\/dev\/disk\w+\s+Apple_HFS\s+(.*?)(\r?\n|$)/)[1];
		const app = "GitKraken.app";

		await fs.copy(path.join(hfs, app), path.join("/Applications", app));

		await spawn([
			"hdiutil",
			"detach",
			hfs,
		], {
			stdio: "inherit",
			echo: true,
		});
	},
	linux: async (file) => {
		if (/\.deb$/.test(file)) {
			await spawn([
				"apt-get",
				"install",
				file,
			], {
				stdio: "inherit",
				echo: true,
			});
		} else {
			await spawn([
				"tar",
				"-xvzf",
				file,
			], {
				cwd: "/opt",
				stdio: "inherit",
				echo: true,
			});
		}
	},
};

async function download () {
	let platform = process.platform;
	if (platform === "linux" && !process.env.CI && await fs.exists("/etc/apt/sources.list")) {
		platform = "debian";
	}
	const url = URLS[platform];
	const fileName = path.join(os.tmpdir(), url.replace(/^.*\//, ""));

	console.log(`Downloading GitKraken from ${url}`);
	await spawn([
		"curl",
		"--fail",
		"--insecure",
		"--location",
		"--continue-at",
		"-",
		"--output",
		fileName,
		url,
	], {
		stdio: "inherit",
		echo: true,
	});

	console.log(`Installing Gitkraken ${fileName}`);
	await INSTS[process.platform](fileName);
	await fs.unlink(fileName);
}

module.exports = download;
