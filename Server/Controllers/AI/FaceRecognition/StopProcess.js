const { Errors } = require("../../../datas/Errors.js");
const Fs = require('fs');

const processIdPath = process.env.PROCESS_ID_FILE;

/**
 * Stop Process Face Recognition of a project
 * @param { Request } req { body: projectId }
 * @param { Response } res
 * @returns { response to send }
 */

exports.stopProcess = function (req, res) {
    console.log("Stopping process Face Recognition...");
    let returnCode = 200;
    let returnMessage = "You successfully stop the process";
    try {
        if (req.body.projectId === undefined) {
            throw Errors.BAD_REQUEST_BAD_INFOS;
        }
        let jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        for (let it in processId["Face Recognition"]["process"]) {
            if (processId["Face Recognition"]["process"][it]["projectId"] === req.body.projectId) {
                exec(`Kill ${processId["Face Recognition"]["process"][it]["pid"]}`);
                processId["Face Recognition"]["process"].splice(it, 1);
                console.log(`Kill ${processId["Face Recognition"]["process"][it]["pid"]}`);
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