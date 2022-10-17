const { voices } = require("../../datas/config");
const AWS = require('aws-sdk');
const Fs = require('fs');
const Mp3Duration = require('../../datas/Mp3Duration');
const { Errors } = require("../../datas/Errors.js");
const s3Manager = require("../MediaManager/S3Manager/S3Manager.js");
const axios = require("axios");

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: process.env.REGION_AWS
})

const mp3Duration = new Mp3Duration();

function PollyPromise(paramsToSend, args) {
    const returnValue = new Promise((resolve, reject) => {
        Polly.synthesizeSpeech(paramsToSend, async (err, data) => {
            if (err) {
                reject(`${Errors.ERROR_POLLY} : ${err}`);
            } else if (data) {
                try {
                    if (data.AudioStream instanceof Buffer) {
                        Fs.writeFileSync(args.file, data.AudioStream);

                        const params = {
                            saved: false,
                            data: data.AudioStream
                        };

                        const status = await s3Manager.uploadFile(process.env.S3_BUCKET_AUDIOS_AWS, `${args.projectId}/${args.replicaId}.mp3`, params);
                        if (status.code === 84) {
                            reject(err);
                        }
                    } else {
                        reject(Errors.ERROR_POLLY);
                    }
                } catch (e) {
                    reject(e)
                }
                resolve('Success');
            }
        });
    });

    return returnValue;
}

/**
 * Text to speech with a specific voice.
 * @param { Request } req { body : { projectId, voiceId, text, replicaId }}
 * @param { Response } res
 * @returns { response to send }
 */

exports.textToSpeech = async function (req, res) {
    console.log("Lingualizing a text...");
    let returnCode = 200;
    let returnMessage = "You successfully TextToSpeech";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;

    try {
        if (!req.body.projectId || !req.body.voiceId || !req.body.text || !req.body.replicaId) {
            throw Errors.BAD_REQUEST_MISSING_INFOS;
        }
        let paramsToSend = {
            'Text': req.body.text,
            'OutputFormat': "mp3",
            'VoiceId': voices[req.body.voiceId].nameID

        }
        let args = {
            replicaId: req.body.replicaId,
            projectId: req.body.projectId,
            file: `${process.env.FILES_DIRECTORY}/Audios/${req.body.replicaId}.mp3`
        }
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'InProgress', stepType: 'FaceRecognition' });
        let returnValue = await PollyPromise(paramsToSend, args);
        if (returnValue === 'Success') {
            await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Done', stepType: 'FaceRecognition' });
        } else {
            await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Error', stepType: 'FaceRecognition' });
            throw returnValue;
        }
        let duration = mp3Duration.getDuration(args.file, (err, duration) => {
            if (err)
                throw Errors.INTERNAL_ERROR;
            else
                return duration
        });
        returnMessage = { description: "You successfully TextToSpeech", audioDuration: duration }
    } catch (error) {
        returnCode = 400;
        returnMessage = error;
        console.log("Error :", error);
    }
    const temp = res.status(returnCode).send(returnMessage);
    return (temp);
};