"use strict";

var exec = require("child_process").exec;

var manifest = require("../vss-extension.json");
var extensionId = manifest.id;

// Package extension
var command = `tfx extension create --rev-version --extension-id ${extensionId}-beta --overrides-file configs/beta.json --manifest-globs vss-extension.json --no-prompt --json`;
exec(command, (error, stdout) => {
    if (error) {
        console.error(`Could not create package: '${error}'`);
        return;
    }

    let output = JSON.parse(stdout);

    console.log(`Package created ${output.path}`);
}
);