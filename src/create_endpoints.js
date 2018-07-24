#!/usr/bin/env node

let utils = require("./utils");
let placeholders = require("./placeholders");

let fs = require('fs');
let path = require('path');
let cp = require('child_process');
let endpoint_template = require("./templates/endpoint.template.json");
let stdin = process.stdin;
let stdout = process.stdout;

let index = 0;
let arr_prop = Object.keys(endpoint_template);
let endpoints = {};
let nome_endpoint = "";

function addProperties() {

    let key = arr_prop[index];

    stdin.resume();
    stdout.write(key + ": ");
    stdin.once('data', function(data) {
        let endpoint_obj = {};
        let val_prop = data.toString().trim();

        switch (endpoint_template[key]) {
            case "string":
                endpoint_obj[key] = val_prop;
                break;
            case "number":
                endpoint_obj[key] = parseInt(val_prop);
                break;
            case "WarningLevel":
                let number = parseInt(val_prop);
                let warning_levels = ["WarningLevel.SILENT", "WarningLevel.LOW", "WarningLevel.MEDIUM", "WarningLevel.HIGH"];
                if (number >= 4 && number < 0) {
                    number = 1; // metto 1 di default
                }
                endpoint_obj[key] = warning_levels[number];
                break;
            case "boolean":
                endpoint_obj[key] = val_prop.toLowerCase() === 'true'; // TODO: controllo dato
                break;
        }

        index++;
        if (index < arr_prop.length) {
            addProperties();
        }
        else {
            stdin.resume();
            stdout.write("[0]Cancellare ultimo - [1]Terminare - [2]Continuare?:");
            stdin.once('data', function(data) {

                endpoints[nome_endpoint] = endpoint_obj;

                let risposta = data.toString().trim();
                if (risposta === "1") {
                    saveEndpoints();
                    process.exit();
                }
                else if (risposta === "2") {
                    index = 0;
                    stdout.write("\n");
                    addEndpoint();
                }
                else {
                    delete endpoints[nome_endpoint];
                    addEndpoint();
                }
            });
        }
    });
}

/**
 * salva sia il ts che un json che lo descrive
 */
function saveEndpoints() {
    let path_endpoints_arr = utils.path_endpoints.split("/");
    path_endpoints_arr.splice(-1, 1);

    // creazione del json che descrive gli endpoints

    let path_no_name = path_endpoints_arr.join("/"); // forse non ha il trailing slash, verificare
    fs.writeFileSync(path_no_name + "/endpoints.json", JSON.stringify(endpoints, null, "\t"), 'utf8');

    // creazione della classe ts degli endpoints

    let endpoints_template_result = { value: "" };
    let endpoints_template_line_arr = require('./templates/endpoints.template.json').txt;

    let l = endpoints_template_line_arr.length;
    for (let j = 0; j < l; j++) {
        let line = endpoints_template_line_arr[j];

        if (line.includes('</')) {
            let i = 1;
            let block = "";

            while (!endpoints_template_line_arr[j + i].includes('/>')) {
                block += endpoints_template_line_arr[j + i] + "\n";
                i++;
            }

            let block_mod = "";
            for (let key in endpoints) {
                if (endpoints.hasOwnProperty(key)) {
                    let endpoint = endpoints[key];

                    block_mod = block.replace(placeholders.endpoint_name, key.toUpperCase());

                    let body = "";
                    for (let key in endpoint) {
                        if (endpoint.hasOwnProperty(key)) {

                            let value = endpoint[key];
                            if (endpoint_template[key] === "string") {
                                body += "\t\t" + key + ": \"" + value + "\",\n";
                            }
                            else {
                                body += "\t\t" + key + ": " + value + ",\n";
                            }

                        }
                    }
                    block_mod = block_mod.replace(placeholders.endpoint_obj, body);

                    endpoints_template_result.value += block_mod + "\n";
                }

            }

            j = j + i;
        }
        else {
            endpoints_template_result.value += line + "\n";
        }
    }

    fs.writeFileSync(utils.path_endpoints, endpoints_template_result.value, 'utf8');

    // creazione dell'EndPointVO.d.ts

    let vo = require('./templates/endpointvo.template.json').txt.join('\n');
    let body = "";

    for (let key in endpoint_template) {
        if (endpoint_template.hasOwnProperty(key)) {

            let vo_type = endpoint_template[key];
            body += "\t" + key + ": " + vo_type + ";\n";
        }
    }

    vo = vo.replace(placeholders.endpoint_obj, body);

    fs.writeFileSync(path_no_name + "/EndPointVO.d.ts", vo, 'utf8');

}

function addEndpoint() {
    stdin.resume();
    stdout.write("Nome endpoint: ");
    stdin.once('data', function(data) {
        nome_endpoint = data.toString().trim();
        addProperties();
    });
}

stdin.resume();
stdout.write("Dove vuoi creare il file EndPoints.ts? ('" + utils.path_endpoints + "'): ");

stdin.once('data', function(data) {
    let path = data.toString().trim();
    if (path !== "") {
        utils.path_endpoints = path;
    }
    addEndpoint();
});