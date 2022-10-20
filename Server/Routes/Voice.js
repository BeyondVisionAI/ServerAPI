module.exports = function (app) {
    const VoiceRoot = '/Voice'
    const textToSpeech = require('../Controllers/Voice/textToSpeech.js');
    const retrieveVoices = require('../Controllers/Voice/retrieveVoices.js');

    console.log("Listen route Voice : ");

    app.route(`${VoiceRoot}/TextToSpeech`)
        .post(textToSpeech.textToSpeech);
    console.log(`- POST : ${VoiceRoot}/TextToSpeech`);

    app.route(`${VoiceRoot}/RetrieveVoices`)
        .get(retrieveVoices.retrieveVoices);
    console.log(`- GET : ${VoiceRoot}/RetrieveVoices`);
}