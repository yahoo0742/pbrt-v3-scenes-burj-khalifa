const path = require('path');
const fs = require('fs');

function paddingName(prefix, count, postfix) {
    let result = prefix;
    if (count < 10) {
        result += '00'+count;
    } else if(count < 100) {
        result += '0'+count;
    } else {
        result += count;
    }
    result += postfix;
    return result;
}

function createSkys(outputPath, vresolution) {
    const { execFileSync } = require('child_process');
    if (!execFileSync) {
        console.error('Please call npm install child_process');
        return 0;
    }

    let count = 0;
    let a = 1;
    let t = 1.7;
    try{
        let afternoon = 0;
        for(let e=0; e<=180; e+=5) {
            ++count;
            let name = paddingName('sky_', count, '.exr');
            name = path.resolve(outputPath, name);

            // simulate the turbidity in the afternoon
            t = 1.7 + e*e*e/300000.0;
            if (t > 10)
                t = 10;
            let re = e;
            if (re > 90) {
                afternoon = 1;
                re = 180 - re; 
            } else {
                afternoon = 0;
            }

            const child = execFileSync('./imgtool',['makesky', '--elevation', re, '--turbidity', t, '--albedo', a, '--resolution', vresolution, '--outfile', name, '--afternoon', afternoon]);
        }
        
    } catch (ex) {
        console.error('Failed to create the sky texture with Elevation: '+e+' Turbidity: '+t+' Albedo: '+a+': '+ex);
    }
    console.log('Finish generating skys.');

    return count;
}

function updateLightsourceInPbrt(inputPbrt, outputPbrt, newLightsourceFilename) {
    const lightsourceStr = 'LightSource "infinite" "string mapname"';
    const filenameStr =  '"string filename"';

    const onNewLine = (line) =>{
        let newLine = '';
        if (line.startsWith(lightsourceStr)) {
            newLine += line.substring(0, lightsourceStr.length);

            newLine += ' "'+newLightsourceFilename+ '"\n';
            return newLine;
        }
        return line+'\n';
    };


    const data = fs.readFileSync(inputPbrt, 'utf8');
    // split the contents by new line
    const lines = data.split(/\r?\n/);

    let newContent = '';
    // print all lines
    lines.forEach((line) => {
        newContent += onNewLine(line);
    });

    fs.writeFileSync(outputPbrt, newContent);
}

function render(inputPbrt, outputImageFilename, threads) {
    const { execFileSync } = require('child_process');
    if (!execFileSync) {
        console.error('Please call npm install child_process');
        return;
    }
    const child = execFileSync('./pbrt',['-nthreads', threads, inputPbrt, '--outfile', outputImageFilename]);
} 


// sky vresolution, inputPbrt, outputImagePath, threads
if (process.argv.length < 5) {
    console.error('Run the script with the same folder to the pbrt and imgtool program.');
    console.error('options: vresolution, pathToThePbrtFile, outputImagePath, number of threads for rendering');
    return;
}

let vresolution = process.argv[2];
let inputPbrt = process.argv[3];
let outputImagePath = process.argv[4];
let threads = process.argv[5];

if (!fs.existsSync(outputImagePath)) {
    fs.mkdirSync(outputImagePath);
}

let inputPathIdx = inputPbrt.lastIndexOf(path.sep);
let inputPath = inputPbrt.substring(0, inputPathIdx+1);


// create skys
let skylightTexturesOutputPath = path.resolve(inputPath, 'textures');
if (!fs.existsSync(skylightTexturesOutputPath)) {
    fs.mkdirSync(skylightTexturesOutputPath);
}
let skysNum = createSkys(skylightTexturesOutputPath, vresolution);
console.log(skysNum + ' sky light textures have been generated.');

// update pbrt with the environment maps
for(let sky=1; sky<=skysNum; ++sky) {
    let reletivePathToNewLightsourceName = paddingName('textures/sky_', sky, '.exr');
    let newPbrtName = paddingName('sceneUpdated_', sky, '.pbrt');
    let pathToNewPbrt = path.resolve(inputPath, newPbrtName);//put the new pbrt file in the same folder
    updateLightsourceInPbrt(inputPbrt, pathToNewPbrt, reletivePathToNewLightsourceName);


    console.log('Start rendering scene '+pathToNewPbrt+'...');
    let pathToOutputImage = path.resolve(outputImagePath, paddingName('output_', sky, '.png'));
    render(pathToNewPbrt, pathToOutputImage, threads);
    console.log(pathToOutputImage+' is generated.');
}






