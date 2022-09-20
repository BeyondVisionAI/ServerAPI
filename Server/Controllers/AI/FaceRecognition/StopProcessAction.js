const { Errors } = require("../../../datas/Errors.js");
var Fs = require('fs');
var processIdPath = "./datas/processId.json"

exports.stopProcessAction = function (req, res) {
    var returnCode = 200;
    var returnMessage = "You successfully stop the process";
    try {
        if (req.body.projectId === undefined) {
            throw Errors.BAD_REQUEST_BAD_INFOS;
        }
        var jsonString = Fs.readFileSync(processIdPath);
        var processId = JSON.parse(jsonString);

        for (let it in processId.process) {
            if (processId.process[it].projectId = req.body.projectId) {
                console.log(`Kill ${processId.process[it].pid}`);
                exec(`Kill ${processId.process[it]}`);
                processId.process.splice(it, 1);
                break;
            }
        }

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}