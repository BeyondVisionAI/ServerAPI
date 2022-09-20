const { exec } = require("child_process");
var Fs = require('fs');
const { Errors } = require("../../datas/Errors.js");
var { downloadFile, uploadFile } = require('../S3Manager/S3Manager');

const processIdPath = "./datas/processId.json"

exports.newProcessAction = function (req, res) {

    var returnCode = 200;
    var returnMessage = "You successfully Generate The Video";

    try {
        let s3FilePathVideo = `${req.body.projectId}.mp3`
        videoObj = downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathVideo, true);

        if (videoObj.Code === 84) {
            throw Error.ERROR_S3_DOWNLOAD;
        }
        const pathToVideo = `Files/${req.body.projectId}.mp4`;
        const pathToJson = `../MMAction2/${req.body.projectId}.json`;

        const command = `python ../AI_MMAction/demo/long_video_demo.py ../MMAction2/configs/recognition/tsn/tsn_r50_video_inference_1x1x3_100e_kinetics400_rgb.py ../MMAction2/checkpoints/tsn_r50_1x1x3_100e_kinetics400_rgb_20200614-e508be42.pth ${pathToVideo} ../MMAction2/tools/data/kinetics/label_map_k400.txt ${pathToJson} --input-step 3 --device cpu --threshold 0.2`

        var child = exec(command);

        var jsonString = Fs.readFileSync(processIdPath);
        var processId = JSON.parse(jsonString);
        var it = processId.process.Lenght;

        console.log("New Process : " + req.body.projectId + "/" + child.pid);

        processId["process"].push({ 'pid': child.pid, 'projectId': req.body.projectId });

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString)
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}