module.exports = function (app) {
    const VoiceRoot = '/Voice/'
    const textToSpeech = require('../Controllers/Voice/textToSpeech.js');
    const retrieveVoices = require('../Controllers/Voice/retrieveVoices.js');

    console.log("Listen root Voice : ");

    app.route(`${VoiceRoot}TextToSpeech`)
        .post(textToSpeech.textToSpeech);
    console.log(`- ${VoiceRoot}TextToSpeech`);

    app.route(`${VoiceRoot}RetrieveVoices`)
        .get(retrieveVoices.retrieveVoices);
    console.log(`- ${VoiceRoot}RetrieveVoices`);
}