var exec = require("child_process").exec;

// Load existing publisher
var manifest = require("../vss-extension.json");
var extensionId = manifest.id;

// Package extension
var command = `tfx extension create --overrides-file configs/devHttp.json --manifest-globs vss-extension.json --extension-id ${extensionId}-dev --no-prompt`;
exec(command, function() {
    console.log("Package created");
});