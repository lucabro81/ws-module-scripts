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

function addProperties(endpoint_obj = {}) {

    let key = arr_prop[index];

    stdin.resume();
    stdout.write(key + ": ");
    stdin.once('data', function(data) {
        let val_prop = data.toString().trim();
        // console.log("val_prop", val_prop);

        switch (endpoint_template[key]) {
            case "string":
                endpoint_obj[key] = val_prop;
                break;
            case "number":
                if (val_prop === "") {
                    val_prop = 0;
                }
                endpoint_obj[key] = parseInt(val_prop);
                break;
            case "WarningLevel":
                let number = (val_prop === "") ? 1 : parseInt(val_prop);
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
            addProperties(endpoint_obj);
        }
        else {
            stdin.resume();
            stdout.write("[0]Cancellare ultimo - [1]Terminare - [2]Continuare?:");
            stdin.once('data', function(data) {

                let risposta = data.toString().trim();

                // console.log("risposta", risposta);

                if (risposta === "1") {

                    // Terminare

                    endpoints[nome_endpoint] = endpoint_obj;
                    // console.log("endpoints", endpoints);
                    saveEndpoints();
                    process.exit();
                }
                else if (risposta === "2") {

                    // Continuare

                    endpoints[nome_endpoint] = endpoint_obj;
                    // console.log("endpoints", endpoints);
                    index = 0;
                    stdout.write("\n");
                    addEndpoint();
                }
                else {

                    // Cancellare ultimo

                    index = 0;
                    stdout.write("\n");
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
    fs.mkdirSync(path_no_name);
    fs.writeFileSync(path_no_name + "/endpoints.json", JSON.stringify(endpoints, null, "\t"), 'utf8');

    // console.log("endpoints.json\n", JSON.stringify(endpoints, null, "\t"));

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

    fs.mkdirSync(utils.path_endpoints);
    fs.writeFileSync(utils.path_endpoints, endpoints_template_result.value, 'utf8');

    // console.log("classe endpoints\n", endpoints_template_result.value);

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

    // console.log("EndPointVO.d.ts\n", vo);

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