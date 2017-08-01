#!/usr/bin/env node

var chalk = require('chalk');
var fs = require('fs');

var CONFIG_FILE = '.sepia.json';

module.exports = {
	check: function() {
		if (!fs.existsSync(CONFIG_FILE)) {
			console.error(chalk.red('You need to have a file called .sepia.json in your folder with your configuration. See https://github.com/liferay-labs/sepia-scripts for more information.'));

			process.exit(1);
		}
	},
	get: function(key) {
		if (!module.configurationFile) {
			this.check();

			module.configurationFile = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
		}

		return module.configurationFile[key];
	}
};