#!/usr/bin/env node

var chalk = require('chalk');
var config = require('./util/config.js');
var fs = require('fs');
var program = require('commander');
var request = require('request');

// Arguments

program
.version('0.0.1')
.option('-a, --artifact [value]', 'if present, this artifact will be checked. Otherwise, it will be read from the .sepia.json file')
.option('-g, --group [value]', 'if present, this group will be use. Otherwise, it will be read from the .sepia.json file')
.parse(process.argv);

config.check();

var artifacts = [];

if (program.artifact) {
    artifacts.push(program.artifact);
}
else {
    artifacts = config.get('artifacts') || [];
}

var nexus = config.get('nexus');

if (artifacts.length == 0) {
    console.error(chalk.red('No artifacts passed as argument or found in your .sepia.json file'));

    process.exit(1);
}

if (nexus) {
    auth = "Basic " + new Buffer(nexus.username + ":" + nexus.password).toString("base64");
}
else {
    console.error(chalk.red('No nexus configuration found in your .sepia.json file'));

    process.exit(1);
}

var url = nexus.url;

url += "?r=" + nexus.repository;
url += "&v=LATEST";

var group = program.group || nexus.group;

url += "&g=" + group;

for (var i = 0; i < artifacts.length; i++) {
    var artifactName = artifacts[i];
    var artifactUrl = url + "&a=" + artifactName;

    request({
        url: artifactUrl,
        headers : {
           "Authorization" : auth
        },
        json: true
    },
    function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const jarResponse = eval(body);

            console.log('provided group: "' + jarResponse.data.groupId + '", name: "' + jarResponse.data.artifactId + '", version: ' + jarResponse.data.version + '"');
        }
        else {
            console.error(chalk.red('Something went wrong, the server returned '  + response.statusCode + '. This is the body of the response: \n'));
            console.error(chalk.white(body));
        }
    });
}
