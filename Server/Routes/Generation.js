module.exports = function (app) {
    const GenerationRoot = '/Generation/';
    const generationVoices = require('../Controllers/Generation/GenerationVoices.js');
    const generationVideo = require('../Controllers/Generation/GenerationVideo.js');

    app.route(`${GenerationRoot}GenerationVoices`)
        .post(generationVoices.generationVoices);
    console.log(`- ${GenerationRoot}GenerationVoices`);

    app.route(`${GenerationRoot}GenerationVideo`)
        .post(generationVideo.generationVideo);
    console.log(`- ${GenerationRoot}GenerationVideo`);
};