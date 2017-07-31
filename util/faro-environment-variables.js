#!/usr/bin/env node

var chalk = require('chalk');

module.exports = {
	setEnvironmentVariables: function() {
		console.log(chalk.blue('Setting environment variables: '));

		const utcTimestamp =
			new Date().toISOString().replace(/-/g, '').replace(/:/g, '')
				.replace(/\./, '').toLowerCase();

		const environmentUniqueName =
			getEnvironmentUniqueName(utcTimestamp);

		setFaroAssetEngineEnvironmentUniquename(environmentUniqueName);
		setFaroAssetConnectorEnvironmentUniquename(environmentUniqueName);
	}
};

function getEnvironmentUniqueName(environmentUniqueId) {
	return process.env['USER'].toLowerCase() + '_' + "ci" + '_' +
		environmentUniqueId;
}

function setFaroAssetConnectorEnvironmentUniquename(environmentUniqueName) {
	var faroAssetConnectorEnvironmentUniquename = 'FARO_ASSET_CONNECTOR_ENVIRONMENT_UNIQUENAME';
	if (process.env[faroAssetConnectorEnvironmentUniquename]) {
		console.log(faroAssetConnectorEnvironmentUniquename + ' already set');
	}
	else {
		console.log('Setting ' + faroAssetConnectorEnvironmentUniquename);
		process.env[faroAssetConnectorEnvironmentUniquename] = environmentUniqueName;
	}

	console.log(
		chalk.blue(faroAssetConnectorEnvironmentUniquename + ': ' +
			process.env[faroAssetConnectorEnvironmentUniquename]));

}

function setFaroAssetEngineEnvironmentUniquename(environmentUniqueName) {
	var faroAssetEngineEnvironmentUniqueName = 'FARO_ASSET_ENGINE_ENVIRONMENT_UNIQUENAME';
	if (process.env[faroAssetEngineEnvironmentUniqueName]) {
		console.log(faroAssetEngineEnvironmentUniqueName + ' already set');
	}
	else {
		console.log('Setting ' + faroAssetEngineEnvironmentUniqueName);
		process.env[faroAssetEngineEnvironmentUniqueName] = environmentUniqueName;
	}

	console.log(
		chalk.blue(faroAssetEngineEnvironmentUniqueName + ': ' +
			process.env[faroAssetEngineEnvironmentUniqueName]));
}