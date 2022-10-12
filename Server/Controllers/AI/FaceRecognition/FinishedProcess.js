const { Errors } = require("../../../datas/Errors.js");
const Fs = require('fs');
const axios = require("axios");

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
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;
    const urlSetFaceRecognition = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setFaceRecognition`;
    try {
        if (req.body.jsonPath === undefined || req.body.projectId === undefined) {
            throw (Error.BAD_REQUEST_MISSING_INFO);
        }
        console.log('path :', req.body.jsonPath)
        let jsonString = Fs.readFileSync(req.body.jsonPath);
        let faceRecognitionReceive = JSON.parse(jsonString);

        //TODO do the generation of a better json data from the generated file.
        // Generate all the Face Recognition with the start step and the number step
        // let jsonToSend = parseAndGenerateJson(actionsReceive);
        let jsonToSend = faceRecognitionReceive;

        console.log("AH")
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
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Done', stepType: 'FaceRecognition' });

        await axios.post(urlSetFaceRecognition, { jsonResponse: jsonString });
    } catch (err) {
        returnCode = 400;
        returnMessage = err;
        console.log('Error :', err)
    }
    return (res.status(returnCode).send(returnMessage));
}