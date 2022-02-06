const { voices } = require("../../datas/config");
const AWS = require('aws-sdk');
const Fs = require('fs');
const { uid } = require('uid')

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: process.env.REGION_AWS
})

exports.retreiveVoice = async function (req, response) {
    console.log("Retreive Voice :", req.body);

    if (!req.body.voiceID || !req.body.text || !req.body.format) {
        response.send({ statusCode: 400, statut: "Some trouble with the Retreive the Voice", uid: null });
        return
    }

    var voiceID = voices[req.body.voiceID].nameID

    let params = {
        'Text': req.body.text,
        'OutputFormat': req.body.format,
        'VoiceId': voiceID
    }
    const audioId = uid(10);

    await Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.log("Error Polly:", err)
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {

                // TODO Changer le fait d'ecrire un fichier et l'enregistrer sur la bdd
                Fs.writeFile(`./${audioId}.mp3`, data.AudioStream, function (err) {
                    if (err) {
                        return console.log("Error writing:", err);
                    } else {
                        console.log("The file was saved!", audioId);
                        response.send({ statusCode: 200, statut: "You successfully Retreive the Voice", uid: audioId });
                    }
                });
            }
        }
    });
};