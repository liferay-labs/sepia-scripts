#!/usr/bin/env node

var child_process = require('child_process');
var printOutput = require('./print-output.js');

module.exports = {
	spawn: function(command, args, options) {
		return execute(command, args, options, false);
	},
	spawnSync: function(command, args, options) {
		return execute(command, args, options, true);
	}
};

function execute(command, args, options, sync) {
	var args = args || [];
	var options = options || {};

	var childProcess;

	if (sync) {
		childProcess = child_process.spawnSync(command, args , options);
	}
	else {
		childProcess = child_process.spawn(command, args , options);
	}

	if (!options.stdio || (options.stdio != 'inherit')) {
		printOutput.print('stderr', childProcess.stderr, options, true, 'red');
		printOutput.print('stdout', childProcess.stdout, options, false, 'green');
	}

	if (childProcess.stdout) {
		return childProcess.stdout.toString().trim();
	}
}