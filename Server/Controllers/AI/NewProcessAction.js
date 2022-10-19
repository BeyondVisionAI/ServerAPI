const { exec } = require("child_process");
var Fs = require('fs');
const { stdout } = require("process");
const { Errors } = require("../../datas/Errors.js");
var { downloadFile, uploadFile } = require('../MediaManager/S3Manager/S3Manager');

const processIdPath = "./datas/processId.json"

exports.newProcessAction = function (req, res) {

    const returnCode = 200;
    const returnMessage = "You successfully Generate The Video";
    
    try {
       let s3FilePathVideo = `${req.body.projectId}.mp4`;
      // videoObj = downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathVideo, true);
      
      // if (videoObj.Code === 84) {
      //   throw Error.ERROR_S3_DOWNLOAD;
      // }
      //const pathToVideo = `./Files/S3Videos/${s3FilePathVideo}.mp4`;
      const pathToVideo = `./Files/S3Videos/${s3FilePathVideo}`;
      const pathToResultJson = `./Files/ADVideoInfos/${req.body.projectId}.json`;

      console.log(`Path to video : ${pathToVideo}`);
      console.log(`Path to result Json : ${pathToResultJson}`);
      

      var child = exec(`python ../AI_MMACTION/demo/long_video_demo.py ../AI_MMACTION/config/dataset-settings-modified.py ../AI_MMACTION/checkpoints/tsn_r50_1x1x3_100e_kinetics400_rgb_20200614-e508be42.pth ${pathToVideo} ../AI_MMACTION/tools/data/label_map_k400.txt ${pathToResultJson} --input-step 3 --device cpu --threshold 0.2`, (error, stdout, stderr) => {
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

    } catch (err) {
        console.log(err);
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}