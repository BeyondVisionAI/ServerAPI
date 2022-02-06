const { voices } = require("../../datas/config");
const AWS = require('aws-sdk');
const Fs = require('fs');

const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: process.env.REGION_AWS
})

exports.retreiveVoice = async function (req, response) {
    console.log("Retreive Voice :", req.body);
    console.log(process.env.SECRET_KEY_ID_AWS, process.env.SECRET_KEY_ACCES_AWS, process.env.REGION_AWS);
    response.statusCode = 200;

    if (!req.body.voiceID || !req.body.text || !req.body.format) {
        response.statusCode = 400;
        response.send("Some trouble with the Retreive the Voice");
        return
    }

    var voiceID = voices[req.body.voiceID].nameID

    let params = {
        'Text': req.body.text,
        'OutputFormat': req.body.format,
        'VoiceId': voiceID
    }

    await Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.log("Error Polly:", err)
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {

                // TODO Changer le fait d'ecrire un fichier et l'enregistrer sur la bdd
                Fs.writeFile("./speech.mp3", data.AudioStream, function (err) {
                    if (err) {
                        return console.log("Error writing:", err);
                    } else {
                        console.log("The file was saved!");
                        response.send("You successfully Retreive the Voice");
                    }
                });
            }
        }
    });
};