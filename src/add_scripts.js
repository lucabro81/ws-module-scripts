#!/usr/bin/env node

let fs = require('fs');

let current_path_arr = process.cwd().split("/");
let local_path_arr = [];
let local_path = "";

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

let package_json = fs.readFileSync(local_path, 'utf8');
let package_json_arr = package_json.split('\n');
let package_json_mod = "";

let scripts_found = false;

for (let i = 0; i < package_json_arr.length; i++) {
    if (package_json_arr[i].includes("scripts")) {
        scripts_found = true;
    }
    else if (scripts_found && package_json_arr[i].includes("}")) {
        package_json_mod +=
            "\t\t\"add-web-service\": \"add_web_service\"\n" +
            "\t\t\"mod-web-service\": \"mod_web_service\"\n" +
            "\t}\n";
    }
    else {
        package_json_mod += package_json_arr[i];
    }
}

fs.writeFileSync(local_path, package_json_mod, 'utf8');

process.exit();