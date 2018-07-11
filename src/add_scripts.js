let fs = require('fs');
let cp = require('child_process');

let package_json = require(process.cwd() + "/" + "package.json");

package_json["scripts"]["scriptaggiunto"] = "assd";


