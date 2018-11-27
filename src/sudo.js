"use strict";
const spawn = require("./spawn");

function sudo () {
	if (!process.geteuid || !process.geteuid()) {
		return;
	}
	return spawn(
		[
			"sudo",
			"env",
			process.env.CI && "CI=" + process.env.CI,
		].concat(process.argv),
		{
			stdio: "inherit",
			echo: true,
		}
	).then(() => {
		process.exit();
	}, ex => {
		process.exit(ex.errno);
	});
}

module.exports = sudo;
