#!/usr/bin/env node

var chalk = require('chalk');
var fs = require('fs');
var program = require('commander');
var request = require('request');

// Arguments

program
.version('0.0.1')
.parse(process.argv);

var config = JSON.parse(fs.readFileSync('.sepia.json', 'utf8'));

var artifacts = config.artifacts || [];

if (config.nexus) {
    username = config.nexus.username;
    password = config.nexus.password;
    
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
}

var url = config.nexus.url;

url += "?r=" + config.nexus.repository;
url += "&v=LATEST";
url += "&g=" + config.nexus.group;

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
            console.error(chalk.red('Something went wrong: ' + error + response.statusCode));
        }
    });
}
