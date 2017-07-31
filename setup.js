#!/usr/bin/env node

var chalk = require('chalk');
var checkRequirement = require('./util/check-requirement.js');
var executer = require('./util/executer.js');
var faroDirs = require('./util/faro-dirs.js');
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

	if (!exists(repo)) {
		console.error(chalk.blue('Cloning ' + repo));

		cloneRepo(repo);
	}
	else {
		console.error(chalk.blue('Skipping ' + repo + ' since it already exists.'));
	}
}

// Donwload Docker Images

console.log(chalk.blue('Pulling docker images.'));

downloadImage('liferay/com-liferay-osb-faro-engine-assets-private:latest');
downloadImage('liferay/com-liferay-osb-faro-site-private:latest');
downloadImage('liferay/com-liferay-osb-faro-engine-domains-validation-private:latest');
downloadImage('liferay/com-liferay-osb-faro-engine-domains-proxy-private:latest');
downloadImage('liferay/liferay-de:20170703073124007430605-db');

// Create Deployment Folder

faroDirs.checkDeployDir();

function downloadImage(image) {
	console.log(chalk.blue('Pulling image ' + image + ' from DockerHub.'));

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('docker', ['pull', image], options);
}

function exists(repo) {
	var repoLocation = faroDirs.getFaroHomeDir() + repo;

	return fs.existsSync(repoLocation);
}

function cloneRepo(repo) {
	var originalLocation = pwd();

	cd(faroDirs.getFaroHomeDir());

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('git', ['clone', 'git@github.com:liferay/' + repo + '.git'], options);

	cd(originalLocation);
}

function checkRequirements() {
	checkRequirement.check('docker');
	checkRequirement.check('git');
}