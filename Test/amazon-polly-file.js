// Load the SDK
const AWS = require('aws-sdk')
const Fs = require('fs')

// Secret id, etc
AWS.config.setPromisesDependency();
AWS.config.update({
    accessKeyId: process.env.SECRET_KEY_ID_AWS,
    secretAccessKey: process.env.SECRET_KEY_ACCES_AWS,
    region: process.env.REGION_AWS
});

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
})

let params = {
    'Text': 'Salut, ceci est un test.',
    'OutputFormat': 'mp3',
    'VoiceId': 'Lea'
}

Polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
        console.log(err.code)
    } else if (data) {
        if (data.AudioStream instanceof Buffer) {
            Fs.writeFile("./speech.mp3", data.AudioStream, function (err) {
                if (err) {
                    return console.log(err)
                }
                console.log("The file was saved!")
            })
        }
    }
});