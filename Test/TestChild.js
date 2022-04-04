const { exec } = require("child_process");
var Fs = require('fs');

const processIdPath = "../datas/processId.json";
const temp = '0123456789';
(function () {
    try {
        const command = 'python ./loop.py'

        var child = exec(command);

        var jsonString = Fs.readFileSync(processIdPath);

        console.log(processIdPath, jsonString);

        var processId = JSON.parse(jsonString);
        var it = processId.process.Lenght;

        processId["process"].push({ 'pid': child.pid, 'projectId': temp });

        console.log(processId)

        jsonString = JSON.stringify(processId);

        console.log(jsonString);

        Fs.writeFileSync(processIdPath, jsonString);
    } catch (err) {
        console.error(err);
    }
    while (1) { };
})();