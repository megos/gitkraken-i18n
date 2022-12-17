"use strict";
const fs = require("fs-extra");
const path = require("path");

const patches = {
	"src/js/components/views/SettingsView.js": (contents) => {
		let settingFunctions = contents.match(/\s+settingFunctions:.+?("|')ui.theme\1.*/);
		if (settingFunctions) {
			settingFunctions = settingFunctions[0].trim().replace(/("|')ui.theme\1/, "$1ui.language$1");
		} else {
			settingFunctions = "settingFunctions: bindSettingFunctions('ui.theme', _stores2.default.ProfileSettings, _actions2.default.ProfileSettings),";
		}
		return contents.replace(/(\n\s+)label:\s*("|')UIPreferences-Language\2,(\s*settingFunctions:.*)?/g, (s, space, quot) => {
			const patch = `${space}label: ${quot}UIPreferences-Language${quot},${space}${settingFunctions}`;
			if (s !== patch) {
				console.log("\t" + `label: ${quot}UIPreferences-Language${quot},`);
				s = patch;
				console.log("+\t" + settingFunctions);
			}
			return s;
		});
	},
	"src/js/actions/RegistrationActions.js": (contents) => {
		return contents.replace(/^(["|']use strict["|'];*)[^\r\n]*/, (s, prefix) => {
			console.log("-\t" + s.trim());
			s = prefix + `function _GitCracken (body) { return Object.assign(body, { licenseExpiresAt: ${JSON.stringify(new Date(8640000000000000).toISOString())}, licensedFeatures: ["pro"].concat(body.licensedFeatures).filter(Boolean) }); }`;
			console.log("+\t" + s.trim());
			return s;
		}).replace(/(^.+?}\s*=\s*)((?:\w+\.)*body);/gm, (s, prefix, body) => {
			console.log("-\t" + s.trim());
			s = prefix + `_GitCracken(${body});`;
			console.log("+\t" + s.trim());
			return s;
		});
	},
	"src/js/constants/LanguageConstants.js": (contents) => {
		return contents.replace(/(\b\w+\s+DEFAULT_LANGUAGE\s*=\s*)[^\r\n;]*;*/g, (s, prefix) => {
			const patch = `${prefix}(global.navigator && navigator.language || process.env.LANG || 'en-us').toLowerCase().replace(/\\.[\\w-]+$/, '').replace(/_/g, '-');`;
			if (s !== patch) {
				console.log("-\t" + s.trim());
				s = patch;
				console.log("+\t" + s.trim());
			}
			return s;
		});
	},
	"src/js/defaultSettings/ProfileSettings.js": (contents) => {
		return contents.replace(/(\blanguage\s*:\s*)[^\r\n,]*,*/g, (s, prefix) => {
			const patch = `${prefix}require('../constants/LanguageConstants').DEFAULT_LANGUAGE,`;
			if (s !== patch) {
				console.log("-\t" + s.trim());
				s = patch;
				console.log("+\t" + s.trim());
			}
			return s;
		});
	},
	"src/appBootstrap/appmenu.js": (contents) => {
		return contents.replace(/(\bstate\.development\s*=\s*)[^\r\n;]*;*/g, (s, prefix) => {
			const patch = `${prefix}true;`;
			if (s !== patch) {
				console.log("-\t" + s.trim());
				s = patch;
				console.log("+\t" + s.trim());
			}
			return s;
		});
	},
	"src/js/actions/LanguageActions.js": (contents) => {
		return contents.replace(/(\n\s*)(loadLocalizationResources\s*\(.*?\)\s*\{(?:\r?\n.*)*?)(\r?\n\s*.*?\bLanguageActions\.sync\.loadLocalizationResources\b.*?)?(\1})/g, (s, prefix, body, oldPatch, suffix) => {
			const patch = `${prefix}${body}${prefix}  arguments[0] || LanguageActions.sync.loadLocalizationResources(true);${suffix}`;
			if (s !== patch) {
				s = patch;
				console.log("+\targuments[0] || LanguageActions.sync.loadLocalizationResources(true);");
			}
			return s;
		});
	},
	"src/css/toolbar.css": (contents) => {
		return contents.replace(/((?:\{|;})\s*font-size:\s*)([\d.]+)px\s*(?=;|\})/ig, (s, prefix, size) => {
			if (size < 12) {
				console.log(`-\tfont-size: ${size}px`);
				s = `${prefix}12px`;
				console.log("+\tfont-size: 12px");
			}
			return s;
		});
	},
	"src/css/shared.css": (contents) => {
		return contents.replace(/(\s+\.tier-label\s*\{\s*)width:\s*\d+\w+\s*(?=;|\})/ig, (s, prefix, size) => {
			console.log(`${prefix.trim()}\n-\t${s.slice(prefix.length)}`);
			s = `${prefix}padding: 0 5px`;
			console.log("+\tpadding: 0 5px");
			return s;
		});
	},
};

// const i18n = [
//   'https://www.transifex.com/jumei/gitkraken-i18n/en-usjson/zh_CN/download/for_use/'
//   'https://www.transifex.com/jumei/gitkraken-i18n/en-usjson/zh_TW/download/for_use/'
//   'https://www.transifex.com/jumei/gitkraken-i18n/en-usjson/ja/download/for_use/'
// ]

module.exports = async (appDir) => {
	console.log("Add patches to " + appDir);
	await Promise.all(
		Object.keys(patches).map(async file => {
			const fullFilePath = path.resolve(appDir, file);
			const rawContents = await fs.readFile(fullFilePath, "utf8");
			const contents = await patches[file](rawContents);
			console.log(file);
			if (contents && (contents !== rawContents)) {
				console.log();
				await fs.writeFile(fullFilePath, contents);
			} else {
				console.log("Already patched.\n");
			}
		})
	);
};
