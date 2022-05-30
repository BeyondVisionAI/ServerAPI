var { downloadFile, uploadFile } = require('../S3Manager/S3Manager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");

exports.generationVideo = function (req, res) {
    if (!req.body.projectId)
        return (res.status(400).send(Errors.BAD_REQUEST_MISSING_INFOS));
    console.log('Generation Video');
    const urlSetStatus = `https://localhost/projects/${req.body.projectId}/setStatus`;
    var returnCode = 200;
    var returnMessage = "You successfully Generate The Video";
    var returnStatus = "Done";
    try {
        await fetch(urlSetStatus, {
            method: 'post',
            body: JSON.stringify({ statusType: 'InProgress', stepType: 'VideoGeneration' })
        });

        let s3FilePathRawVideo = `${req.body.projectId}.mp4`
        let s3FilePathAudio = `Audio/${req.body.projectId}.mp3`
        let s3FilePathFinalVideo = `Video/${req.body.projectId}.mp4`

        let videoObj = downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathRawVideo, true);
        let audioObj = downloadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, s3FilePathAudio, true);

        let outputPath = process.env.FILE_PATH + uid(10) + '.mp4'
        let code = await exec(`ffmpeg.exe -i ${videoObj.filePath} -i ${audioObj.filePath} -c copy ${outputPath}`,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                    return (84);
                }
                console.log('Finish !')
                return (0);
            }
        );
        if (code === 84) {
            returnCode = 400;
            returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
            returnStatus = 'Error';
        } else {
            let uploadStatus = uploadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, s3FilePathFinalVideo, { saved: true, filePath: outputPath })
            if (uploadStatus.code === 84) {
                returnCode = 400;
                returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
                returnStatus = 'Error';
            }
        }
    } catch (e) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
        returnStatus = 'Error';
    }
    const temp = res.status(returnCode).send(returnMessage);
    await fetch(urlSetStatus, {
        method: 'post',
        body: JSON.stringify({ statusType: returnStatus, stepType: 'VideoGeneration' })
    });
    return (temp);
}