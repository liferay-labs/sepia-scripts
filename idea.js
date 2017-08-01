#!/usr/bin/env node

var checkRequirement = require('./util/check-requirement.js');
var chalk = require('chalk');
var config = require('./util/config.js');
var executer = require('./util/executer.js');
var fs = require('fs');
var program = require('commander');
require('shelljs/global');

// Arguments

program
.version('0.0.1')
.parse(process.argv);

checkRequirements();

var repositories = config.get('repositories') || [];

for (var i = 0; i < repositories.length; i++) {
	var repo = repositories[i];

	generateImlFiles(repo);
}

console.log(chalk.blue('Generating modules.xml file for the project...'));

var options = {
    stdio: 'inherit'
};

executer.spawnSync(__dirname + '/util/ideactl.py', ['--src', '.', '--project-file', '.idea/modules.xml', '--namespace', config.get('namespace')], options);

function checkRequirements() {
	checkRequirement.check('gradle');
	checkRequirement.check('python');
}

function generateImlFiles(repo) {
	var originalLocation = pwd();

	cd(repo);

	console.log(chalk.blue('Generating .iml files for: ' + repo));

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('gradle', ['idea'], options);

	cd(originalLocation);
}