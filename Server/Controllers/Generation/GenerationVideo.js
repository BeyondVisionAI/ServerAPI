const { useSignedUrlDownload, useSignedUrlUpload } = require('../MediaManager/MediaManager');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");
const axios = require('axios');
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
    let returnStatus = "Done";
    try {
        if (!req.body.projectId || !req.body.signedUrlVideoSource || !req.body.signedUrlFinishedAudio)
            throw new Errors.BAD_REQUEST_MISSING_INFOS;
        await axios.post(urlSetStatus, { statusType: 'InProgress', stepType: 'VideoGeneration' });

        let s3FilePathRawVideo = `${req.body.projectId}.mp4`
        let s3FilePathAudio = `Audio/${req.body.projectId}.mp3`
        let s3FilePathFinalVideo = `Video/${req.body.projectId}.mp4`

        let videoObj = useSignedUrlDownload(req.body.signedUrlVideoSource, 'Video');
        let audioObj = useSignedUrlDownload(req.body.signedUrlFinishedAudio);

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
            let uploadStatus = useSignedUrlUpload( { saved: true, filePath: outputPath })
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
    await axios.post(urlSetStatus, { statusType: returnStatus, stepType: 'VideoGeneration' });
    return (temp);
}