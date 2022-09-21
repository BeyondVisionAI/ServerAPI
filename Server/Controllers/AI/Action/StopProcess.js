const { exec } = require("child_process");
const { Errors } = require("../../../datas/Errors.js");
const Fs = require('fs');

const processIdPath = process.env.PROCESS_ID_FILE;

/**
 * Stop Process Action of a project
 * @param { Request } req { params: projectId }
 * @param { Response } res
 * @returns { response to send }
 */

exports.stopProcess = function (req, res) {
    console.log("Stopping process Action...");
    var returnCode = 200;
    var returnMessage = "You successfully stop the process";
    try {
        if (req.body.projectId === undefined) {
            throw Errors.BAD_REQUEST_BAD_INFOS;
        }
        var jsonString = Fs.readFileSync(processIdPath);
        var processId = JSON.parse(jsonString);

        for (let it in processId["Action"]["process"]) {
            if (processId["Action"]["process"][it]["projectId"] === req.body.projectId) {
                console.log(`Kill ${processId["Action"]["process"][it]["pid"]}`);
                exec(`Kill ${processId["Action"]["process"][it]}`);
                processId["Action"]["process"].splice(it, 1);
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