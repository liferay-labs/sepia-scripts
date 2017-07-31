#!/usr/bin/env node

var chalk = require('chalk');

module.exports = {
	check: function(binary) {
		if (!which(binary)) {
			console.error(chalk.red('Sorry, this script requires ' + binary));

			process.exit(1);
		}
	}
};