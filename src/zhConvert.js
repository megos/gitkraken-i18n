"use strict";
const fs = require("fs-extra");
const path = require("path");
let OpenCC;
module.exports = async () => {
	if (!OpenCC) {
		try {
			OpenCC = require("opencc");
		} catch (ex) {
			return;
		}
	}
	const opencc = new OpenCC("s2t.json");
	const zhCN = await fs.readFile(path.join(__dirname, "strings/zh-cn.json"), "utf8");
	let zhTW = await opencc.convertPromise(zhCN);
	zhTW = zhTW.replace(/(\s+)"languageOption":\s*{\s*(\r?\n.*)*?\1\}/, (s, prefix) => {
		return prefix + "\"languageOption\": " + JSON.stringify({
			"label": "中文(繁體)",
			"value": "zh-tw",
		}, 0, 2).replace(/\n/g, prefix);
	});
	await fs.writeFile(path.join(__dirname, "strings/zh-tw.json"), zhTW);
};
