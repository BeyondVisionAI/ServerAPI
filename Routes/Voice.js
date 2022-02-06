module.exports = function (app) {
    const VoiceRoot = '/Voice/'
    const retreiveVoice = require('../Controllers/Voice/retreiveVoice.js');
    const retreiveVoices = require('../Controllers/Voice/retreiveVoices.js');

    console.log("Listen root Voice : ");

    app.route(`${VoiceRoot}RetreiveVoice`)
        .post(function (req, res) { retreiveVoice.retreiveVoice(req, res) });
    console.log(`- ${VoiceRoot}RetreiveVoice`);

    app.route(`${VoiceRoot}RetreiveVoices`)
        .get(function (req, res) { retreiveVoices.retreiveVoices(req, res) });
    console.log(`- ${VoiceRoot}RetreiveVoices`);
}