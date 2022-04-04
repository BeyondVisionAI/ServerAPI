const { exec } = require("child_process");
var Fs = require('fs');

const processIdPath = "../datas/processId.json";
const temp = '0123456789';

try {
    var jsonString = Fs.readFileSync(processIdPath);
    var processId = JSON.parse(jsonString);

    for (let it in processId.process) {
        if (processId.process[it].projectId = temp) {
            console.log(`Kill ${processId.process[it].pid}`);
            exec(`Kill ${processId.process[it]}`);
            processId.process.splice(it, 1);
            break;
        }
    }

    jsonString = JSON.stringify(processId);
    Fs.writeFileSync(processIdPath, jsonString);
} catch (err) {
    console.error(err);
}