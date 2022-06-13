var { downloadFile, uploadFile } = require('../S3Manager/S3Manager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");

exports.generationAudio = async function (req, res) {
    if (!req.body.projectId)
        return (res.status(400).send(Errors.BAD_REQUEST_MISSING_INFOS));
    console.log('Generation Audio');
    const urlSetStatus = `https://localhost/projects/${req.body.projectId}/setStatus`;
    var returnCode = 200;
    var returnMessage = "You successfully Generate The Audio";
    var returnStatus = "Done";
    try { 
        await fetch(urlSetStatus, {
            method: 'post',
            body: JSON.stringify({ statusType: 'InProgress', stepType: 'AudioGeneration' })
        });

        // TODO: DL AUDIO FROM s3 --bucketnName, keyName, saveIt = true
        // MERGE AUDIOS
        // send audio to s3
    } catch (e) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
        returnStatus = 'Error';
    }
    const temp = res.status(returnCode).send(returnMessage);
    await fetch(urlSetStatus, {
        method: 'post',
        body: JSON.stringify({ statusType: returnStatus, stepType: 'AudioGeneration' })
    });
    return (temp);
}