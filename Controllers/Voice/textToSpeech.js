const { voices } = require("../../datas/config");
const AWS = require('aws-sdk');
const Fs = require('fs');
const { uid } = require('uid');

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: process.env.REGION_AWS
})

exports.textToSpeech = async function (req, res) {
    console.log("Text To Speech :", req.body);

    if (!req.body.projectID || !req.body.voiceID || !req.body.text || !req.body.format) {
        res.status(400).send({ err: "Some trouble with the Retreive the Voice" });
        return
    }

    var projectID = req.body.projectID
    var text = req.body.text
    var format = req.body.format
    var voiceID = voices[req.body.voiceID].nameID

    let params = {
        'Text': text,
        'OutputFormat': format,
        'VoiceId': voiceID
    }
    const audioId = uid(10);

    const status = await Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            return ({ code: 84, err: err })
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {
                const params = {
                    Bucket: "finished-product",
                    Key: `${projectID}/audio/${audioId}.mp3`,
                    Body: data.AudioStream
                };

                return (s3.upload(params, function (err, data) {
                    if (err) {
                        return ({ code: 84, err: err });
                    } else {
                        return ({ code: 0 });
                    }
                }));
            } else {
                return ({ code: 84, err: "Error with the recuperation of the audio in Polly" })
            }
        }
    });

    if (status.err) {
        return (res.status(400).send({ err: status.err }))
    } else {
        return (res.status(200).send({ audioID: audioId }));
    }
};