#!/usr/bin/env node

var checkRequirement = require('./util/check-requirement.js');
var chalk = require('chalk');
var executer = require('./util/executer.js');
var faroDirs = require('./util/faro-dirs.js');
var program = require('commander');
require('shelljs/global');

// Arguments

program
.version('0.0.1')
.parse(process.argv);

checkRequirements();

var repositories = [
		'com-liferay-faro-connector-assets-private',
		'com-liferay-faro-connector-contacts-private',
		'com-liferay-osb-faro-engine-assets-private',
		'com-liferay-osb-faro-engine-contacts-private',
		'com-liferay-osb-faro-engine-domains-proxy-private',
		'com-liferay-osb-faro-engine-domains-validation-private',
		'com-liferay-osb-faro-site-private',
		'com-liferay-osb-faro-site-assets-private',
		'com-liferay-osb-faro-site-campaigns-private',
		'com-liferay-osb-faro-site-contacts-private',
		'com-liferay-osb-faro-site-settings-private',
		'com-liferay-osb-faro-site-touchpoints-private'
	];

for (var i = 0; i < repositories.length; i++) {
	var repo = repositories[i];

	generateImlFiles(repo);
}

console.log(chalk.blue('Generating modules.xml file for the project...'));

executer.spawnSync('./util/ideactl.py', ['--src', faroDirs.getFaroHomeDir(), '--project-file', '../.idea/modules.xml']);

function checkRequirements() {
	checkRequirement.check('gradle');
	checkRequirement.check('python');
}

function generateImlFiles(repo) {
	var originalLocation = pwd();

	cd(faroDirs.getFaroHomeDir() + repo);

	console.log(chalk.blue('Generating .iml files for: ' + repo));

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('gradle', ['idea'], options);

	cd(originalLocation);
}