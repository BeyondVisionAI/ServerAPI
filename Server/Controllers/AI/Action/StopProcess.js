const { exec } = require("child_process");
const { Errors } = require("../../../datas/Errors.js");
const Fs = require('fs');
const axios = require("axios");

const processIdPath = process.env.PROCESS_ID_FILE;

/**
 * Stop Process Action of a project
 * @param { Request } req { body: projectId }
 * @param { Response } res
 * @returns { response to send }
 */

exports.stopProcess = async function (req, res) {
    console.log("Stopping process Action...");
    var returnCode = 200;
    var returnMessage = "You successfully stop the process";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;

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
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Stop', stepType: 'ActionRecognition' });
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}