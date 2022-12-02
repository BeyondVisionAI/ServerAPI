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
                        var duration = mp3Duration.getDuration(params.data, (err) => {
                            if (err)
                                reject({description: 'Error', error: Errors.INTERNAL_ERROR});
                        });

                        const status = await s3Manager.uploadFile(process.env.S3_BUCKET_AUDIOS_AWS, `${args.projectId}/${args.replicaId}.mp3`, params);
                        if (status.code === 84) {
                            reject({description: 'Error', error: err});
                        }
                    } else {
                        reject({description: 'Error', error: Errors.ERROR_POLLY});
                    }
                } catch (e) {
                    reject({description: 'Error', error: e})
                }

                resolve({description: 'Success', audioDuration: duration * 1000});
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
 **/

exports.textToSpeech = async function (req, res) {
    console.log("Lingualizing a text...");
    let returnCode = 200;
    let returnMessage = "You successfully TextToSpeech";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;

    try {
        if (!req.body.projectId || !req.body.voiceId || !req.body.text || !req.body.replicaId) {
            throw Errors.BAD_REQUEST_MISSING_INFOS;
        }
        console.log(voices);
        const index = voices.findIndex(voice => voice.id == req.body.voiceId);
        if (!index)
            throw Errors.BAD_REQUEST_BAD_INFOS
        let paramsToSend = {
            'Text': req.body.text,
            'OutputFormat': "mp3",
            'VoiceId': voices[index].nameID

        }
        let args = {
            replicaId: req.body.replicaId,
            projectId: req.body.projectId,
            file: `${process.env.FILES_DIRECTORY}/Audios/${req.body.replicaId}.mp3`
        }
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'InProgress', stepType: 'VoiceGeneration' });
        let returnValue = await PollyPromise(paramsToSend, args);
        if (returnValue.description === 'Success') {
            await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Done', stepType: 'VoiceGeneration' });
        } else {
            await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Error', stepType: 'VoiceGeneration' });
            throw returnValue;
        }
        returnMessage = { description: "You successfully TextToSpeech", audioDuration: returnValue.audioDuration }
    } catch (error) {
        returnCode = 400;
        returnMessage = error;
        console.log("Error :", error);
    }
    const temp = res.status(returnCode).send(returnMessage);
    return (temp);
};