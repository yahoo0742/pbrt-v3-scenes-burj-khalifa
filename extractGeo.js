const fs = require('fs');
const readline = require('readline');


let origin = "";
let geo = "";
let geoCollecting = false;
let geoNum = 100;

let output = "";
let lastline = "";

function onNewLine(line) {
    //console.log(`Line from file: ${line}`);

    if (line.startsWith('"point P"')) {
        geoCollecting = true;
        geo += lastline + '\n';
        geo += line+'\n';
        origin = origin.substr(0, origin.length-lastline.length-1);
        
    } else if (geoCollecting) {
        if (line.startsWith("AttributeEnd")) {
            

            let name = output+"/geo_"+geoNum+".pbrt";
            origin += 'Include "'+name+'"\n';
            origin += line+'\n';

            // export
            fs.writeFileSync(name, geo);
            ++ geoNum;
            geo = "";
            geoCollecting = false;
        } else {
            geo += line+'\n';
        }
    } else {
        origin += line+'\n';
    }
    lastline = line;
}

const data = fs.readFileSync(process.argv[2], "utf8");
output = process.argv[3];
console.log("type "+typeof(data));
// split the contents by new line
const lines = data.split(/\r?\n/);

// print all lines
lines.forEach((line) => {
    onNewLine(line);
});


fs.writeFileSync(output+"/export.pbrt", origin);


