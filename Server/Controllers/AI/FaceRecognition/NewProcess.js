const { exec } = require("child_process");
const Fs = require('fs');
const { Errors } = require("../../../datas/Errors.js");
const { downloadFile, uploadFile } = require('../../MediaManager/S3Manager/S3Manager');
const axios = require("axios");

const processIdPath = process.env.PROCESS_ID_FILE;

/**
 * New Process Face Recognition of a project
 * @param { Request } req { body: projectId, jsonImage * }
 * @param { Response } res
 * @returns { response to send }
 */

/**
 * *JsonImage need to be of this format:
 * {"images": [ {"name: "Name of the character", "s3ImagePath":"file path of the image on AWS"}, {...}]}
 */

exports.newProcess = async function (req, res) {
    console.log("Starting process Face recognition...");
    let returnCode = 200;
    let returnMessage = "You successfully start the process";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;

    try {
        if (req.body.projectId === undefined || req.body.projectId === null || req.body.jsonImage === undefined || req.body.jsonImage === null ) {
            throw Error.BAD_REQUEST_MISSING_INFOS;
        }
        let s3FilePathVideo = `${req.body.projectId}.mp4`
        let videoObj = downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathVideo, true, "Video");
        if (videoObj.Code === 84) {
            throw Error.ERROR_S3_DOWNLOAD;
        }
        let pathToVideo = videoObj.filePath;

        let jsonImage = JSON.parse(jsonImage)
        for (let i in jsonImage["images"]) {
            let s3FilePathImage = jsonImage["images"][i]["s3ImagePath"];
            let imageObj = downloadFile(process.env.S3_BUCKET_CHARACTER_IMAGE, s3FilePathVideo, true, "Image");
            if (imageObj.Code === 84) {
                throw Error.ERROR_S3_DOWNLOAD;
            } else {
                jsonImage["images"][i]["path"] = imageObj.filePath;
            }
        }
        const pathToJsonImage = `${process.env.FILES_DIRECTORY}Json/Argument-${req.body.projectId}.json`;

        let jsonString = JSON.stringify(jsonImage);
        Fs.writeFileSync(pathToJsonImage, jsonString);

        // TODO enlevé avant de passé sur la dev et sur la main / pour test
        // let jsonString = "";
        // let pathToVideo = `${process.env.FILES_DIRECTORY}Videos/Test1.mp4`;
        // let pathToJsonImage = `${process.env.FILES_DIRECTORY}Json/Test1.json`;

        const command = `python3 ${process.env.AI_FACE_RECOGNITION_DIRECTORY}Face_Recognition_Finale.py -VP ${pathToVideo} -JI ${pathToJsonImage} -ID ${req.body.projectId}`
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'InProgress', stepType: 'FaceRecognition' });
        let child = exec(command);
        jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        console.log("New Process Face Recognition : " + req.body.projectId + "/" + child.pid);

        processId["Face Recognition"]["process"].push({ 'pid': child.pid, 'projectId': req.body.projectId });

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);
    } catch (error) {
        returnCode = 400;
        returnMessage = error;
        console.log("Error :", error);
    }
    return (res.status(returnCode).send(returnMessage));
}