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
let endpoint_obj = {};
let endpoints = {};
let nome_endpoint = "";

function addProperties() {

    let key = arr_prop[index];

    stdin.resume();
    stdout.write(key + ": ");
    stdin.once('data', function(data) {
        let val_prop = data.toString().trim();

        switch (endpoint_template[key]) {
            case "string":
                endpoint_obj[key] = val_prop;
                break;
            case "number": parseInt(val_prop);
                break;
        }

        index++;
        if (index < arr_prop.length) {
            addProperties();
        }
        else {
            stdin.resume();
            stdout.write("Continuare? (S/N):");
            stdin.once('data', function(data) {

                endpoints[nome_endpoint] = endpoint_obj;

                let risposta = data.toString().trim();
                if (!utils.getResponse(risposta)) {
                    saveEndpoints();
                    process.exit();
                }
                else {
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
    let path_no_name = utils.path_endpoints.split("/").splice(-1, 1).join("/"); // forse non ha il trailing slash, verificare
    fs.writeFileSync(path_no_name + "/endpoints.json", JSON.stringify(endpoints, null, "\t"), 'utf8');
    // TODO: valutare se creare anche il EndPointVO

    let endpoints_template = fs.readFileSync('./scripts/templates/endpoints.template.txt', 'utf8');
    let endpoints_template_result = {value: ""};
    let endpoints_template_line_arr = endpoints_template.split('\n');

    let l = endpoints_template_line_arr.length;
    for (let j = 0; j < l; j++) {
        let line = endpoints_template_line_arr[j];
        let line_mod;

        if (line.includes('</')) {
            let i = 1;
            let block = "";

            while (!endpoints_template_line_arr[j + i].includes('/>')) {
                block += endpoints_template_line_arr[j + i] + "\n";
                i++;
            }

            let block_mod = "";
            for (let name in endpoints) {
                if (endpoints.hasOwnProperty(key)) {
                    let endpoint = endpoints[key];

                    block_mod = block.replace(placeholders.endpoint_name, key.toUpperCase());
                    block_mod = block_mod.replace(placeholders.endpoint_obj, JSON.stringify(endpoint, null, "\t\t").slice(1,-1));

                }
            }

            endpoints_template_result.value += block_mod + "\n\n";

            j = j + i;
        }
        else {
            endpoints_template_result.value += line + "\n";
        }
    }

    fs.writeFileSync(utils.path_endpoints, endpoints_template_result, 'utf8');
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
stdout.write("Dove vuoi creare il file EndPoints.ts? ('" + utils.base_path + "/utils/EndPoints.ts'): ");

stdin.once('data', function(data) {
    let path = data.toString().trim();
    if (path === "") {
        path = utils.base_path + "/utils/";
    }
    addEndpoint();
});