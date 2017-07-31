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
.option('-r, --repo [value]', 'Repository name without prefix. e.g. site-contacts, connector-assets...')
.option('-c, --client', 'if present, the connectors will be depoyed to the client')
.option('-s, --site', 'if present, the modules needed to set up the site and all the apps will be depoyed')
.option('-a, --all', 'if present, all the deployable artifacts from the project will be deployed (site and client)')

.parse(process.argv);

checkRequirements();
checkArguments();

var buildProfile =  "";
var repositories = [];

if (program.repo) {
	var fullRepoName = program.repo;

	if (!fullRepoName.startsWith('com-liferay-')) {
		fullRepoName = 'com-liferay-osb-faro-' + program.repo;
	}

	if (!fullRepoName.endsWith('-private')) {
		fullRepoName = fullRepoName + '-private';
	}

	repositories.push(fullRepoName);

	deployRepos();
}
else {
	if (program.site || program.all) {
		repositories = [];

		buildProfile = "faro-site";

		repositories.push(
			'com-liferay-osb-faro-site-private',
			'com-liferay-osb-faro-site-assets-private',
			'com-liferay-osb-faro-site-campaigns-private',
			'com-liferay-osb-faro-site-contacts-private',
			'com-liferay-osb-faro-site-settings-private',
			'com-liferay-osb-faro-site-touchpoints-private'
		);

		console.log(chalk.blue('Deploying Site repos.'));
		deployRepos();
	}

	if (program.client || program.all) {
		repositories = [];

		buildProfile = "faro-connector";

		repositories.push(
			'com-liferay-faro-connector-assets-private',
			'com-liferay-faro-connector-contacts-private'
		);

		console.log(chalk.blue('Deploying Connector repos.'));
		deployRepos();
	}
}

function deployRepos() {
	for (var i = 0; i < repositories.length; i++) {
		var repo = repositories[i];

		deployRepo(repo);
	}
}

function checkArguments() {
	if (program.repo == true) {
		console.error(chalk.red('Please, specify the repo that you want to be deployed. e.g. site'));

		process.exit(1);
	}

	if (!program.repo && !program.site && !program.all && !program.client) {
		console.error(chalk.red('Please, specify what do you want to be deployed.'));
		console.error(chalk.red('Use -a (--all) for all the project (the site and the clients for now)'));
		console.error(chalk.red('Use -s (--site) for deployment of the apps on the site'));
		console.error(chalk.red('Use -c (--client) for deployment of the connectors on the client'));
		console.error(chalk.red('Use -r (--repo) for a particular repo'));
		console.error(chalk.green('Use --help to know more about the available options'));

		process.exit(1);
	}
}

function checkRequirements() {
	checkRequirement.check('gradle');
}

function deployRepo(repo) {
	var originalLocation = pwd();

	cd(faroDirs.getFaroHomeDir() + repo);

	console.log(chalk.blue('Deploying: ' + repo));

	var args = ['clean', 'deploy'];

	if (buildProfile) {
		args.push('-Dbuild.profile=' + buildProfile);
	}

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('gradle', args, options);

	cd(originalLocation);
}