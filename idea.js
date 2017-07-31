#!/usr/bin/env node

var checkRequirement = require('./util/check-requirement.js');
var chalk = require('chalk');
var executer = require('./util/executer.js');
var fs = require('fs');
var program = require('commander');
require('shelljs/global');

// Arguments

program
.version('0.0.1')
.parse(process.argv);

checkRequirements();

var config = JSON.parse(fs.readFileSync('.sepia.json', 'utf8'));

var repositories = config.repositories || [];

for (var i = 0; i < repositories.length; i++) {
	var repo = repositories[i];

	generateImlFiles(repo);
}

console.log(chalk.blue('Generating modules.xml file for the project...'));

executer.spawnSync('./util/ideactl.py', ['--src', '.', '--project-file', '.idea/modules.xml', '--namespace', config.namespace]);

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