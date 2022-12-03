// const { useSignedUrlDownload, useSignedUrlUpload } = require('../MediaManager/MediaManager');
const { downloadFile, uploadFile } = require('../MediaManager/S3Manager/S3Manager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");
const axios = require('axios');
const util = require('node:util');
const exec = util.promisify(require('child_process').exec);
/**
 * Fusion the source Video and the "Final audio" to create the "Final video"
 * @param { Request } req { body: { projectId } }
 * @param { Response } res
 * @returns { response to send }
 */

exports.generationVideo = async function (req, res) {
    console.log("Generating a Final Video...");
    console.log('Generation Video');
    const urlSetStatus = `https://localhost/projects/${req.body.projectId}/setStatus`;
    let returnCode = 200;
    let returnMessage = "You successfully generate the video";
    try {
        if (!req.body.projectId)
            throw new Errors.BAD_REQUEST_MISSING_INFOS;
//        await axios.post(urlSetStatus, { statusType: 'InProgress', stepType: 'VideoGeneration' });

        let s3FilePathRawVideo = `${req.body.projectId}.mp4`
        let s3FilePathAudio = `Audio/${req.body.projectId}.mp3`
        let s3FilePathFinalVideo = `Video/${req.body.projectId}.mp4`

        let videoObj = await downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, `${req.body.projectId}.mp4`, true, "Video");
        let audioObj = await downloadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, `Audio/${req.body.projectId}.mp3`, true, "Audio");

        // let videoObj = {filePath: '../Files/Videos/Test.mp4'}
        // let audioObj = {filePath: '../Files/Audios/Test.mp3'}
        console.log("videoObj :", videoObj)
        console.log("audioObj :", audioObj)
        let outputPath = `${process.env.FILES_DIRECTORY}/Videos/${uid(10)}.mp4`
        let command = `ffmpeg -i ${videoObj.filePath} -i ${audioObj.filePath} -map 0:v -map 1:a -c:v copy -c:a copy ${outputPath}`;
        console.log("command:", command)
        const result = await exec(command)
        // if (result.stderr !== null && result.stderr !== undefined) {
        //     throw ( { code: 84, err: result.stderr});
        // }
        console.log("result :", result);
        let uploadStatus = await uploadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, `Video/${req.body.projectId}.mp4`, { saved: true, filePath: outputPath })
        if (uploadStatus.code === 84) {
            returnCode = 400;
            returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
            returnStatus = 'Error';
            console.log("Error :", uploadStatus)
        }
    } catch (e) {
        console.log("Error :", e);
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
        returnStatus = 'Error'
    }
    const temp = res.status(returnCode).send(returnMessage);
//    await axios.post(urlSetStatus, { statusType: returnStatus, stepType: 'VideoGeneration' });
    return (temp);
}