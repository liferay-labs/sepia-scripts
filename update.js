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
.option('-k, --keepLocalImages', 'if present, the docker images in the local repository will not be updated')
.parse(process.argv);

// Validate parameters and system requirements

checkRequirements();

var defaultBranch = '7.0.x-private';

var repositories = config.get('repositories') || [];

console.log(chalk.bgGreen.black(' * Updating repositories:'));

for (var i = 0; i < repositories.length; i++) {
	var repo = repositories[i];

	updateRepo(repo);
}

if (program.keepLocalImages) {
	console.log(chalk.blue('Keeping docker images in local repository'));
}
else {
	console.log(chalk.bgBlue.black(' * Updating docker images'));

	var dockerImages = config.get('dockerImages') || [];

	// If the images haven't changed, they are cached locally by docker engine
	// and they are not downloaded again

	for (var i = 0; i < dockerImages.length; i++) {
		downloadImage(dockerImages[i]);
	}
}

// This ended OK
process.exit(0);

function downloadImage(image) {
	console.log(chalk.blue('Downloading docker image ' + image + ' from DockerHub.'));

	var options = {
		stdio: 'inherit'
	};

	executer.spawnSync('docker', ['pull', image], options);
}

function updateRepo(repo) {
	var originalLocation = pwd();

	if (fs.existsSync(repo)) {
		cd(repo);

		executer.spawnSync('git', ['add', '.']); // Avoid deleting not staged files
		executer.spawnSync('git', ['clean', '-df']); // Clean old directories

		var currentBranch = executer.spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

		var options = {
			stdout: {
				print: function(output) {
					if (!output || output.toString().startsWith('Your branch')) {
						return false;
					}

					return true;
				},

				color: 'white'
			},
			stderr: {
				print: function(output) {
					if (!output || output.toString().startsWith('From') || output.toString().startsWith('Switched')) {
						return false;
					}

					return true;
				}
			}
		};

		// Fetch Remote branches

		executer.spawnSync('git', ['fetch'], options);

		// Only Update if needed

		var silentOptions = {
			stderr: {
				print: function(output) {
					return false;
				}
			}
		};

		var localHash = executer.spawnSync('git', ['rev-parse', '@'], silentOptions);
		var remoteHash = executer.spawnSync('git', ['rev-parse', '@{u}'], silentOptions);
		var baseHash = executer.spawnSync('git', ['merge-base', '@' ,'@{u}'], silentOptions);

		if (localHash == remoteHash) {
			var currentBranch = currentBranch;

			if (currentBranch != defaultBranch) {
				currentBranch = chalk.black.bgGreen(currentBranch);
			}

			console.log(chalk.green('Up to Date: ' + repo + ' ' + getArrow(repo, 58) + ' Branch: ' + currentBranch));
		}
		else if(!remoteHash) {
			console.log(chalk.cyan('Not pushed: ' + repo + ' ' + getArrow(repo, 58) + ' Branch: ' + chalk.black.bgCyan(currentBranch)));

			// Leave current branch as it is, but update defaultBranch

			var stash = stashLocalChanges();

			executer.spawnSync('git', ['checkout', defaultBranch], options);

			var defaltBranchLocalHash = executer.spawnSync('git', ['rev-parse', '@'], silentOptions);
			var defaltBranchRemoteHash = executer.spawnSync('git', ['rev-parse', '@{u}'], silentOptions);

			if (defaltBranchLocalHash != defaltBranchRemoteHash) {
				executer.spawnSync('git', ['pull', 'origin', defaultBranch], options);
			}

			executer.spawnSync('git', ['checkout', currentBranch], options);

			if (stash) {
				executer.spawnSync('git', ['stash', 'pop']);
			}
		}
		else {
			var stash = stashLocalChanges();

			if (localHash == baseHash) {
				console.log(chalk.green('Updating:   ' + repo + ' ' + getArrow(repo, 58) + ' Branch: ' + currentBranch));

				executer.spawnSync('git', ['pull', 'origin', currentBranch], options);
			}
			else {
				console.log(chalk.cyan('Rebasing:   ' + repo + ' ' + getArrow(repo, 58) + ' Branch: ' + currentBranch));

				executer.spawnSync('git', ['pull', '--rebase', 'origin', currentBranch], options);
			}

			if (stash) {
				executer.spawnSync('git', ['stash', 'pop']);

				console.log(chalk.cyan('You have uncommited changes in the repo ' + repo + '. We have tried to update the branch ' + currentBranch + ' and keep your changes on top.'));
			}
		}

		cd(originalLocation);
	}
	else {
		console.log(chalk.red('There are new repositories that you are missing. Please, run ./setup.js to obtain them and run this task again.'));

		process.exit(1);
	}
}

function getArrow(repoName, finalLength) {
	var arrowLength = finalLength - repoName.length;

	var arrow = "-";

	for (j = 0; j < arrowLength; j++) {
		arrow += "-";
	}

	return arrow + ">"
}

function stashLocalChanges() {
	var oldsha = executer.spawnSync('git', ['rev-parse', '-q', '--verify', 'refs/stash']);

	executer.spawnSync('git', ['stash', 'save', '-q']);

	var newsha = executer.spawnSync('git', ['rev-parse', '-q', '--verify', 'refs/stash']);

	return (oldsha != newsha);
}

function checkRequirements() {
	checkRequirement.check('docker');
	checkRequirement.check('git');
	checkRequirement.check('npm');
	config.check();
}

function removeImage(imageName) {
	console.log(chalk.blue('Removing image ' + imageName));

	executer.spawnSync('docker', ['rmi', imageName]);
}