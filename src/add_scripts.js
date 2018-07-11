#!/usr/bin/env node

let fs = require('fs');
let cp = require('child_process');

let current_path_arr = process.cwd().split("/");
let local_path_arr = [];
let local_path = "";

console.log("current_path_arr: ", current_path_arr);

for (let i = 0; i < current_path_arr.length; i++) {
    if (current_path_arr[i] !== "node_modules") {
        local_path_arr.push(current_path_arr[i]);
    }
    else {
        local_path_arr.push("package.json");
        local_path = local_path_arr.join("/");
        break;
    }
}

console.log("local_path: ", local_path);

let package_json = require(local_path);

console.log("package_json: ", package_json);

package_json["scripts"]["scriptaggiunto"] = "assd";

fs.writeFileSync(process.cwd() + "/" + "package.json", JSON.stringify(package_json), 'utf8');

process.exit();