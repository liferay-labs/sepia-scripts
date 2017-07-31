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
	.option('-c --components <component>', 'Components to be stopped. Supported values: "site", "connector", "all"', /^(site|connector|all)$/i, 'site')
	.parse(process.argv);

checkRequirements();

if (program.components == 'site' || program.components == 'all') {
	stopSiteContainers();
}

if (program.components == 'connector' || program.components == 'all') {
	stopConnectorContainers();
}

function checkRequirements() {
	checkRequirement.check('gradle');
}

function stopConnectorContainers() {
	console.log(chalk.blue('Stopping Faro Client Docker Containers'));

	var options = {
		cwd: faroDirs.getSiteDir(),
		stdio: 'inherit'
	};

	executer.spawn('gradle', ['stopDocker'], options);
}

function stopSiteContainers() {
	console.log(chalk.blue('Stopping Faro Site Docker Containers'));

	 var options = {
		cwd: faroDirs.getSiteDir(),
		stdio: 'inherit'
	};

	executer.spawn('gradle', ['composeDown'], options);
}