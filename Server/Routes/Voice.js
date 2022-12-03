module.exports = function (app) {
    const VoiceRoot = '/Voice'
    const textToSpeech = require('../Controllers/Voice/textToSpeech.js');
    const retrieveInfo = require('../Controllers/Voice/retrieveInfo.js');

    console.log("Listen route Voice : ");

    app.route(`${VoiceRoot}/TextToSpeech`)
        .post(textToSpeech.textToSpeech);
    console.log(`- POST : ${VoiceRoot}/TextToSpeech`);

    app.route(`${VoiceRoot}/RetrieveLanguages`)
        .get(retrieveInfo.retrieveLanguages);
    console.log(`- GET : ${VoiceRoot}/RetrieveLanguages`);

    app.route(`${VoiceRoot}/RetrieveVoices`)
        .get(retrieveInfo.retrieveVoices);
    console.log(`- GET : ${VoiceRoot}/RetrieveVoices`);
}