#!/usr/bin/env node

let fs = require('fs');
let cp = require('child_process');

let current_path_arr = process.cwd().split("/");
let local_path = [];

for (let i = 0; i < current_path_arr.length; i++) {
    if (current_path_arr[i] === "node_modules") {
        local_path.push(current_path_arr[i]);
    }
    else {
        local_path.push("package.json");
        local_path.join("/");
        break;
    }
}

// let package_json = require(process.cwd() + "/" + "package.json");

console.log("local_path: ", local_path);

package_json["scripts"]["scriptaggiunto"] = "assd";

// fs.writeFileSync(process.cwd() + "/" + "package.json", package_json, 'utf8');

process.exit();