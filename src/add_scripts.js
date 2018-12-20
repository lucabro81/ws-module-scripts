#!/usr/bin/env node

let fs = require('fs');

let current_path_arr = process.cwd().split("/");
let local_path_arr = [];
let local_path = "";

// recupero il package.json del progetto individuando il primo "node_modules" nel path
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

let package_json = require(local_path);

if (package_json["scripts"]) {
    if (!package_json["scripts"]["create-endpoints"]) {
        package_json["scripts"]["create-endpoints"] = "create-endpoints";
    }
}
else {
    package_json["scripts"] = {
        "create-endpoints": "create-endpoints"
    }
}

fs.writeFileSync(local_path, JSON.stringify(package_json, null, "\t"), 'utf8');

process.exit();