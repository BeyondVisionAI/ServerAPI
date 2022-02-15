var { downloadFile, uploadFile } = require('../S3Manager/S3Manager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");

exports.generationVideo = function (req, res) {
    try {
        console.log('Generation Video');

        var s3FilePathRawVideo = `${req.body.projectId}/mp4/`
        var s3FilePathAudio = `${req.body.projectId}/Audio.mp3`
        var s3FilePathFinalVideo = `${req.body.projectId}/FinalVideo.mp4`

        var videoObj = downloadFile(process.env.S3_BUCKET_RAW_VIDEO_AWS, s3FilePathRawVideo, true);
        var audioObj = downloadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, s3FilePathAudio, true);

        var outputPath = process.env.FILE_PATH + uid(10) + '.mp4'
        await exec(`ffmpeg.exe -i ${videoObj.filePath} -i ${audioObj.filePath} -c copy ${outputPath}`,
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

        uploadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, s3FilePathFinalVideo, { saved: true, filePath: outputPath });
        res.status(200).send("You successfully Generate Voices");
    } catch (e) {
        console.log('Error', err);
        return (res.status(400).send(Errors.BAD_REQUEST_BAD_INFOS))
    }

}