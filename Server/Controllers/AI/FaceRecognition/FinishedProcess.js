const { Errors } = require("../../../datas/Errors.js");
const Fs = require('fs');

const processIdPath = process.env.PROCESS_ID_FILE;


/**
 * Finished Process Face Recognition of a project
 * @param { Request } req { body: { projectId, jsonPath } }
 * @param { Response } res
 * @returns { response to send }
 */

exports.finishedProcess = async function (req, res) {
    console.log("Finishing process Face Recognition...");
    let returnCode = 200;
    let returnMessage = "You successfully finished the process";
    const urlSetScript = `https://localhost/projects/${req.body.projectId}/setScript`;
    try {
        if (req.body.jsonPath === undefined || req.body.projectId === undefined) {
            throw (Error.BAD_REQUEST_MISSING_INFO);
        }

        let jsonString = Fs.readFileSync('../MMAction2/' + jsonPath);
        let faceRecognitionReceive = JSON.parse(jsonString);

        //TODO do the generation of a better json data from the generated file.
        // Generate all the Face Recognition with the start step and the number step
        // let jsonToSend = parseAndGenerateJson(actionsReceive);
        let jsonToSend = faceRecognitionReceive;

        jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        for (let it in processId["Face Recognition"]["process"]) {
            if (processId["Face Recognition"]["process"][it]["projectId"] === req.body.projectId) {
                processId["Face Recognition"]["process"].splice(it, 1);
                break;
            }
        }

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);
        returnMessage = 'The "finished process Action" successfully catch !';
        jsonString = JSON.stringify(jsonToSend);
        await fetch(urlSetScript, { method: 'post', body: jsonString });
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}