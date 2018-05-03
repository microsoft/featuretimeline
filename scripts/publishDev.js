var exec = require("child_process").exec;

var manifest = require("../vss-extension.json");
var extensionId = manifest.id;
var extensionPublisher = manifest.publisher;
var extensionVersion = manifest.version;

// Package extension
var command = `tfx extension publish --vsix ${extensionPublisher}.${extensionId}-dev-${extensionVersion}.vsix --save`;
exec(command, function (error) {
    if (error) {
        console.log("Package publish ERROR:" + error);
    } else {
        console.log("Package published.");
    }
});