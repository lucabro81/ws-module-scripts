#!/usr/bin/env node

let utils = require("./utils");

let fs = require('fs');
let path = require('path');
let cp = require('child_process');
let stdin = process.stdin;
let stdout = process.stdout;

let index = 0;

function addProperties(prop_arr) {
    stdin.resume();
    stdout.write(prop_arr[index] + ": ");
    stdin.once('data', function(data) {
        let val_prop = data.toString().trim(); //TODO: array?
        index++;
        if (index < prop_arr.length) {
            addProperties(["url", "warning_level", "access", "refresh", "retry", "methods", "debounce"]);
        }
        else {
            stdin.resume();
            stdout.write("Continua (S/N): ?");
            stdin.once('data', function(data) {
                let risposta = data.toString().trim();
                if (risposta === 'N') {
                    // TODO: salvataggio file
                    process.exit();
                }
                else {
                    addEndpoint();
                }
            });
        }
    })
}

function addEndpoint() {
    stdin.resume();
    stdout.write("Nome endpoint: ");
    stdin.once('data', function(data) {
        let nome_endpoint = data.toString().trim();
        addProperties(["url", "warning_level", "access", "refresh", "retry", "methods", "debounce"]);
    });
}

stdin.resume();
stdout.write("Dove vuoi creare il file EndPoints.ts ('./src/utils/EndPoints.ts')?: ");

stdin.once('data', function(data) {
    let path = data.toString().trim();
    addEndpoint();
});