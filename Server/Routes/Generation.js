module.exports = function (app) {
    const GenerationRoot = '/Generation/';
    const generationVideo = require('../Controllers/Generation/GenerationVideo.js');
    const generationAudio = require('../Controllers/Generation/GenerationAudio.js');

    app.route(`${GenerationRoot}GenerationVideo`)
        .post(generationVideo.generationVideo);
    console.log(`- ${GenerationRoot}GenerationVideo`);

    app.route(`${GenerationRoot}GenerationAudio`)
        .post(generationAudio.generationAudio);
    console.log(`- ${GenerationRoot}GenerationAudio`);
};