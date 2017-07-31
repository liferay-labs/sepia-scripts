#!/usr/bin/env node

var chalk = require('chalk');

module.exports = {
	print: function(outputName, output, options, defaultPrint, defaultColor) {
		if (!output || !output.toString().trim()) {
			return;
		}

		var print = defaultPrint || false;

		if (options && options[outputName] && options[outputName].print) {
			print =  options[outputName].print(output);
		}

		if (!print) {
			return;
		}

		var color = getOutputColor(outputName, options, defaultColor);

		console.log(chalk[color](output.toString().trim()));
	}
};

function getOutputColor(outputName, options, defaultColor) {
	if (!options || !options[outputName] || !options[outputName].color) {
		return defaultColor;
	}

	return options[outputName].color;
}