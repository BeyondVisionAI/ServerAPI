const { downloadFile, uploadFile } = require('../MediaManager/S3Manager/S3Manager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");
const axios = require('axios');

//TODO Remplir le header quand sera fait
/**
 * Concat all the Audios files of a project to create the "Final audio"
 * @param { Request } req { body: {  }
 * @param { Response } res
 * @returns { response to send }
 */

exports.generationAudio = async function (req, res) {
    console.log("Generating a Final Audio...");
    if (!req.body.projectId)
        return (res.status(400).send(Errors.BAD_REQUEST_MISSING_INFOS));
    console.log('Generation Audio');
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;
    let returnCode = 200;
    let returnMessage = "You successfully generate the audio";
    let returnStatus = "Done";
    try { 
        await axios.post(urlSetStatus, { statusType: 'InProgress', stepType: 'AudioGeneration' });

        // TODO: DL AUDIO FROM s3 --bucketnName, keyName, saveIt = true
        // MERGE AUDIOS
        // send audio to s3
    } catch (e) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
        returnStatus = 'Error';
    }
    const temp = res.status(returnCode).send(returnMessage);
    await axios.post(urlSetStatus, { statusType: returnStatus, stepType: 'AudioGeneration' });
    return (temp);
}