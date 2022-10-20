const { exec } = require("child_process");
const Fs = require('fs');
const { Errors } = require("../../../datas/Errors.js");
const { downloadFile, uploadFile } = require('../../MediaManager/S3Manager/S3Manager');
const axios = require("axios");

const processIdPath = process.env.PROCESS_ID_FILE;

/**
 * New Process Action of a project
 * @param { Request } req { body: projectId }
 * @param { Response } res
 * @returns { response to send }
 */

exports.newProcess = async function (req, res) {
    console.log("Starting process Action...");
    let returnCode = 200;
    let returnMessage = "You successfully Generate The Video";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;

    try {
        let s3FilePathVideo = `${req.body.projectId}.mp4`
        // let videoObj = downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathVideo, true, "Video");

        // if (videoObj.Code === 84) {
        //     throw Error.ERROR_S3_DOWNLOAD;
        // }
        const pathToVideo = `${process.env.FILES_DIRECTORY}/${req.body.projectId}.mp4`;
        const pathToJson = `${process.env.FILES_DIRECTORY}Json/Action-${req.body.projectId}.json`;

        const command = `python ${process.env.AI_ACTION_DIRECTORY}demo/long_video_demo.py ${process.env.AI_ACTION_DIRECTORY}configs/recognition/tsn/tsn_r50_video_inference_1x1x3_100e_kinetics400_rgb.py ${process.env.AI_ACTION_DIRECTORY}checkpoints/tsn_r50_1x1x3_100e_kinetics400_rgb_20200614-e508be42.pth ${pathToVideo} ${process.env.AI_ACTION_DIRECTORY}tools/data/kinetics/label_map_k400.txt ${pathToJson} --input-step 3 --device cpu --threshold 0.2`
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'InProgress', stepType: 'ActionRecognition' });

        let child = exec(command);

        let jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        console.log("New Process Action : " + req.body.projectId + "/" + child.pid);

        processId["Action"]["process"].push({ 'pid': child.pid, 'projectId': req.body.projectId });

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString)
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}