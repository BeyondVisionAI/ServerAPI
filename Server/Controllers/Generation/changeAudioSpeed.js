var { downloadFile, uploadFile } = require('../S3Manager/S3Manager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");

exports.changeAudioSpeed = function (req, res) {
    var returnCode = 200;
    var returnMessage = "You successfully Generate The new Audio";

    if (!req.body.audioID || !req.body.newDuration)
        return (res.status(400).send(Errors.BAD_REQUEST_MISSING_INFOS));
    try {
        let s3FilePathAudio = `${req.body.audioID}.mp3`
        let audioObj = downloadFile(process.env.S3_BUCKET_FINISHED_PRODUCT_AWS, s3FilePathAudio, true);

        let actualDuration = mp3Duration.getDuration(file, (err, duration) => {
            if (err)
                console.log(err);
            else
                return duration
        });

        let tempo = (req.body.newDuration / actualDuration);
        tempo = tempo.toString();
        let outputPath = process.env.FILE_PATH + uid(10) + '.mp4'
        let code = await exec(`ffmpeg.exe -i ${audioObj.filePath} -filter:a "atempo=${tempo}" -vn ${outputPath}`,
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
            let uploadStatus = uploadFile(process.env.S3_BUCKET_AUDIOS_AWS, s3FilePathAudio, { saved: true, filePath: outputPath })
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
    return (temp);
}

