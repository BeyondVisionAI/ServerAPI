const { voices } = require("../datas/config");
const Fs = require('fs')
var AWS = require('aws-sdk');

const rawReplica = "Hello, this is an example";

(async function () {
    try {
        AWS.config.setPromisesDependency();
        AWS.config.update({
            accessKeyId: "AKIAVEXTIW63VUWJ2LT7",
            secretAccessKey: "2VlQ+9P+MstAMD3qsaHDMzqiu46SknNB23qYgHlQ",
            region: 'us-east-1'
        });
        let translate = new AWS.Translate();


        for (var x = 0; x < voices.length; x++) {
            let temp = voices[x].language.split(' ');
            temp = temp[temp.length - 1].substring(1);
            const language = temp.substring(0, temp.length - 1).split('-')[0];
            const nameID = voices[x].nameID;
            const id = voices[x].id;

            if (language !== 'us' && language !== 'en') {
                let params = {
                    SourceLanguageCode: 'auto',
                    TargetLanguageCode: language,
                    Text: rawReplica,
                    Settings: {
                        Profanity: "MASK"
                    }
                };
                await translate.translateText(params, function (err, data) {
                    if (err) {
                        console.log(id, err);
                    } else {
                        generateAudio(data.TranslatedText, nameID, id);
                    }
                });
            } else {
                generateAudio(rawReplica, nameID, id);
            }
        };

        function generateAudio(text, voiceID, id) {
            // Create an Polly client
            const Polly = new AWS.Polly({
                signatureVersion: 'v4',
                region: 'us-east-1'
            })

            let params = {
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': voiceID
            }
            Polly.synthesizeSpeech(params, (err, data) => {
                if (err) {
                    return console.log(id, err)
                } else if (data) {
                    if (data.AudioStream instanceof Buffer) {
                        Fs.writeFile(`./Files/${voiceID}.mp3`, data.AudioStream, function (err) {
                            if (err) {
                                return console.log(id, err)
                            }
                            console.log(id, "The file was saved!")
                        })
                    }
                }
            });

        }
    } catch (e) {
        console.log('our error', e);
    }
})();