"use strict";
let platform = process.platform;
if (platform === "win32" && /(\d+)$/.test(process.env.GITKRAKEN_PLATFORM || process.env.PROCESSOR_ARCHITEW6432 || process.arch)) {
	platform = "win" + (RegExp.$1 === "64" ? "64" : "32");
}
module.exports = platform;
