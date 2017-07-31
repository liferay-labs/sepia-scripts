#!/usr/bin/env node

var checkRequirement = require('./util/check-requirement.js');
var chalk = require('chalk');
var executer = require('./util/executer.js');
var faroDirs = require('./util/faro-dirs.js');
var faroEnvironmentVariables = require('./util/faro-environment-variables.js');
var program = require('commander');
var propertiesReader = require('properties-reader');
require('shelljs/global');

// Arguments

program
.version('0.0.1')
.option('-p, --prod', 'if present, the site will not be started in debug mode and without the developer properties')
.option('-c --components <component>', 'Components to be started. Supported values: "site", "connector", "all"', /^(site|connector|all)$/i, 'site')
.option('-e --environment <environment>', 'Environment. Supported values: "local", "aws"', /^(local|aws)$/i, 'local')
.option('-f --follow <follow>', 'Whether to display log or not. Supported values: "yes", "no"', /^(yes|no)$/i, 'yes')
.parse(process.argv);

checkRequirements();

faroEnvironmentVariables.setEnvironmentVariables();

// Create Deployment Folder

faroDirs.checkDeployDir();

if (program.components == 'site' || program.components == 'all') {
	var siteDockerComposeDir = 'osb-faro-site-docker/src/main/docker-compose/';

	if (program.environment === 'local') {

		var siteDockerComposeFile = siteDockerComposeDir + 'docker-compose.yml';

		if (program.prod) {
			console.log(chalk.blue('Starting Faro Site in Production Mode for environment ' + program.environment));

			composeUp(siteDockerComposeFile, '', faroDirs.getSiteDir());
		}
		else {
			console.log(chalk.blue('Starting Faro Site in Debug Mode for environment ' + program.environment));

			composeUp(siteDockerComposeFile, siteDockerComposeDir + 'docker-compose.override-debug.yml', faroDirs.getSiteDir());
		}
	}
	else if (program.environment === 'aws') {
		console.log(chalk.blue('Starting Faro Site in Production Mode for environment ' + program.environment));

		composeUp(siteDockerComposeDir + 'docker-compose-acceptance-test.yml', siteDockerComposeDir + 'docker-compose.override-aws.yml', faroDirs.getSiteDir());
	}
}

if (program.components == 'connector' || program.components == 'all') {
	var faroClientDeDockerImageVersion = getPropertyValue(faroDirs.getBuildDir() + 'gradle.properties', 'com.liferay.osb.faro.build.client.de.docker.image.version');

	console.log(chalk.blue('Using Assets Connector Version: ' + faroClientDeDockerImageVersion));

	var connectorAssetsDir = faroDirs.getFaroHomeDir() + 'com-liferay-faro-connector-assets-private/';

	if (program.prod)  {
		console.log(chalk.blue('Starting Faro Assets Connector in Production Mode for environment ' + program.environment));

		runDocker(faroClientDeDockerImageVersion, connectorAssetsDir, false);
	}
	else {
		console.log(chalk.blue('Starting Faro Assets Connector in Debug Mode for environment ' + program.environment));

		runDocker(faroClientDeDockerImageVersion, connectorAssetsDir, true);
	}
}

function checkRequirements() {
	checkRequirement.check('gradle');
}

function composeUp(dockerComposeFile, dockerComposeOverrideFile, workingDir) {
	var gradleArgs = ['composeUp'];

	if (dockerComposeFile) {
		gradleArgs.push('-Pcom.liferay.osb.faro.site.docker.compose.site.file=' + dockerComposeFile);
	}

	if (dockerComposeOverrideFile) {
		gradleArgs.push('-Pcom.liferay.osb.faro.site.docker.compose.override.file=' + dockerComposeOverrideFile);
	}

	var options = {
		cwd: workingDir,
		stdio: 'inherit'
	};

	executer.spawnSync('gradle', gradleArgs, options);

	if (program.follow == 'yes') {
		executer.spawnSync('docker-compose', ['--file', dockerComposeFile, 'logs', '--follow'], options);
	}
}

function getPropertyValue(propertiesFile, propertyKey) {
	var properties = propertiesReader(propertiesFile);

	return	properties.get(propertyKey);
}

function runDocker(assetConnectorImageVersion, workingDir, debug) {
	var gradleArgs = ['runDocker'];

	if (assetConnectorImageVersion) {
		gradleArgs.push('-Pcom.liferay.faro.connector.assets.docker.image.version=' + assetConnectorImageVersion);
	}

	if (debug) {
		gradleArgs.push('-Pdebug')
	}

	var options = {
		cwd: workingDir,
		stdio: 'inherit'
	};

	executer.spawnSync('gradle', gradleArgs, options);

	if (program.follow === 'yes') {
		executer.spawnSync('docker', ['logs', '-f', 'liferay-faro-client-de'], options);
	}
}