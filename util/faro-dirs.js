#!/usr/bin/env node

var fs = require('fs');
require('shelljs/global');

module.dirs = {
	buildDir: '',
	deployDir: '',
	faroHomeDir: '',
	siteDir: ''
};

module.exports = {
	checkDeployDir: function() {
		var deployDir = this.getDeployDir();

		if (!fs.existsSync(deployDir)) {
			mkdir('-p', deployDir);
		}

	},
	getBuildDir: function() {
		if (!module.dirs.buildDir) {
			module.dirs.buildDir = this.getFaroHomeDir() + 'com-liferay-osb-faro-build-private/';
		}

		return module.dirs.buildDir;
	},
	getDeployDir: function() {
		if (!module.dirs.deployDir) {
			module.dirs.deployDir = this.getFaroHomeDir() + 'bundles/deploy/';
		}

		return module.dirs.deployDir;
	},
	getFaroHomeDir: function() {
		if (!module.dirs.faroHomeDir) {
			var originalLocation = pwd();

			cd('../..');

			module.dirs.faroHomeDir = pwd() + '/';

			cd(originalLocation);

			console.log("FARO_HOME: " + module.dirs.faroHomeDir);
		}

		return module.dirs.faroHomeDir;
	},
	getSiteDir: function() {
		if (!module.dirs.siteDir) {
			module.dirs.siteDir = this.getFaroHomeDir() + 'com-liferay-osb-faro-site-private/';
		}

		return module.dirs.siteDir;
	}
};