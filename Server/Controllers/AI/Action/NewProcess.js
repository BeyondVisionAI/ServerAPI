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

    let userId = req.body.userId;
    console.log(`userId is: ${userId}`);
    let projectId = req.body.projectId;
    let returnCode = 200;
    let returnMessage = "You successfully Generate The Video";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${projectId}/setStatus`;

    try {
        let s3FilePathVideo = `${req.body.projectId}.mp4`
        console.log(`project id is: ${req.body.projectId}`);
        let videoObj = await downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathVideo, true, "Video");

        if (videoObj.Code === 84) {
            throw Error.ERROR_S3_DOWNLOAD;
        }
        const pathToVideo = videoObj.filePath;
        const pathToJson = `${process.env.FILES_DIRECTORY}/Json/Action-${projectId}.json`;

        const command = `python ${process.env.AI_ACTION_DIRECTORY}/demo/long_video_demo.py ${process.env.AI_ACTION_DIRECTORY}/config/dataset-settings-modified.py ${process.env.AI_ACTION_DIRECTORY}/checkpoints/tsn_r50_1x1x3_100e_kinetics400_rgb_20200614-e508be42.pth ${pathToVideo} ${process.env.AI_ACTION_DIRECTORY}/tools/data/label_map_k400.txt ${pathToJson} ${projectId} ${userId} --input-step 3 --device cpu --threshold 0.2`
        console.log("before Child");
        let child = exec(command,
          (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
          });
          
          let jsonString = Fs.readFileSync(processIdPath);
          let processId = JSON.parse(jsonString);
          
          console.log("New Process Action : " + req.body.projectId + "/" + child.pid);
          
          processId["Action"]["process"].push({ 'pid': child.pid, 'projectId': req.body.projectId });
          
          jsonString = JSON.stringify(processId);
          Fs.writeFileSync(processIdPath, jsonString)
          console.log("Before sending request");
          await axios.post(urlSetStatus, { statusType: 'InProgress', stepType: 'ActionRetrieve' });
          console.log("After sending request");
        } catch (err) {
          console.log("");
          console.log("error : ", err);
          returnCode = 400;
          returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
        }
        return (res.status(returnCode).send(returnMessage));
      }