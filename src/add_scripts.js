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

// let package_json = fs.readFileSync(local_path, 'utf8');
let package_json = require(local_path);
// let package_json_arr = package_json.split('\n');
// let package_json_mod = "";
//
// let scripts_found = false;
// let counter_scripts = 0;

// FIXME: utilizzare JSON.stringify con i parametri aggiuntivi per la formattazione

if (package_json["scripts"]) {
    if (!package_json["scripts"]["add-web-service"]) {
        package_json["scripts"]["add-web-service"] = "add-web-service";
    }
    if (!package_json["scripts"]["mod-web-service"]) {
        package_json["scripts"]["mod-web-service"] = "mod-web-service";
    }
    if (!package_json["scripts"]["create-endpoints"]) {
        package_json["scripts"]["create-endpoints"] = "create-endpoints";
    }
}
else {
    package_json["scripts"] = {
        "add-web-service": "add-web-service",
        "mod-web-service": "mod-web-service",
        "create-endpoints": "create-endpoints"
    }
}

// for (let i = 0; i < package_json_arr.length; i++) {
//     if (package_json_arr[i].includes("\"scripts\":")) {
//         package_json_mod += package_json_arr[i] + "\n";
//         scripts_found = true;
//     }
//     else if (scripts_found) {
//         if (package_json_arr[i].includes("}")) {
//
//             package_json_mod +=
//                 "\t\t\"add-web-service\": \"add-web-service\",\n" +
//                 "\t\t\"mod-web-service\": \"mod-web-service\",\n" +
//                 "\t\t\"create-endpoints\": \"create-endpoints\""+
//                 "\t},\n";
//             scripts_found = false;
//
//         }
//         else if (counter_scripts > 0) {
//             package_json_mod +=  package_json_arr[i] + ",\n"
//         }
//     }
//     else {
//         package_json_mod += package_json_arr[i] + "\n";
//         counter_scripts++;
//     }
// }

// se il nodo scripts non è stato trovato lo aggiungiamo
// if (!package_json_mod.includes("scripts")) {
//     let l = package_json_arr.length;
//     package_json_arr.splice(l-2, 0,
//         "\t\"scripts\": {\n" +
//         "\t\t\"add-web-service\": \"add-web-service\",\n" +
//         "\t\t\"mod-web-service\": \"mod-web-service\",\n" +
//         "\t\t\"create-endpoints\": \"create-endpoints\""+
//         "\t}\n");
//     package_json_mod += package_json_arr.join("");
// }

// fs.writeFileSync(local_path, package_json_mod, 'utf8');
fs.writeFileSync(local_path, JSON.stringify(package_json, null, "\t"), 'utf8');

process.exit();