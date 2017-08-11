#!/usr/bin/env node

var chalk = require('chalk');
var checkRequirement = require('./util/check-requirement.js');
var config = require('./util/config.js');
var executer = require('./util/executer.js');
var fs = require('fs');
var program = require('commander');
require('shelljs/global');

// Arguments

program
.version('0.0.1')
.parse(process.argv);

// Validate parameters and system requirements

checkRequirements();

// Clone Repositories

console.log(chalk.blue('Cloning all repos.'));

var repositories = config.get('repositories') || [];

for (var i = 0; i < repositories.length; i++) {
	var repo = repositories[i];

	if (!fs.existsSync(repo)) {
		console.error(chalk.blue('Cloning ' + repo));

		cloneRepo(repo);
	}
	else {
		console.error(chalk.blue('Skipping ' + repo + ' since it already exists.'));
	}
}

// Donwload Docker Images

console.log(chalk.blue('Pulling docker images.'));

var dockerImages = config.get('dockerImages') || [];

for (var i = 0; i < dockerImages.length; i++) {
	downloadImage(dockerImages[i]);
}

function downloadImage(image) {
	console.log(chalk.blue('Pulling image ' + image + ' from DockerHub.'));

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('docker', ['pull', image], options);
}

function cloneRepo(repo) {
	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('git', ['clone', 'git@github.com:' + repo + '.git'], options);
}

function checkRequirements() {
	checkRequirement.check('docker');
	checkRequirement.check('git');
	config.check();
}