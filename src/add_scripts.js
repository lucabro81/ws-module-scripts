#!/usr/bin/env node

let fs = require('fs');
let cp = require('child_process');

let package_json = require(process.cwd() + "/" + "package.json");

console.log(process.cwd() + "/" + "package.json", $INIT_CWD);

package_json["scripts"]["scriptaggiunto"] = "assd";

// fs.writeFileSync(process.cwd() + "/" + "package.json", package_json, 'utf8');

process.exit();