var exec = require("child_process").exec;

// Load existing publisher
var manifest = require("../vss-extension.json");
var extensionId = manifest.id;

// Package extension
var command = `tfx extension create --rev-version --overrides-file configs/dev.json --manifest-globs vss-extension.json --extension-id ${extensionId}-dev --no-prompt`;
exec(command, function (error) {
    if (error) {
        console.log(`Package create error: ${error}`);
    } else {
        console.log("Package created");
    }
});