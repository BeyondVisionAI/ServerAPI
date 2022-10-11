module.exports = function (app) {
    const GenerationRoot = '/Generation';
    const changeAudioSpeed = require('../Controllers/Generation/ChangeAudioSpeed')
    const generationAudio = require('../Controllers/Generation/GenerationAudio.js');
    const generationVideo = require('../Controllers/Generation/GenerationVideo.js');

    console.log("Listen route Generation : ");

    app.route(`${GenerationRoot}/ChangeAudioSpeed`)
        .post(changeAudioSpeed.changeAudioSpeed);
    console.log(`- ${GenerationRoot}/ChangeAudioSpeed`);

    app.route(`${GenerationRoot}/GenerationAudio`)
        .post(generationAudio.generationAudio);
    console.log(`- ${GenerationRoot}/GenerationAudio`);

    app.route(`${GenerationRoot}/GenerationVideo`)
        .post(generationVideo.generationVideo);
    console.log(`- ${GenerationRoot}/GenerationVideo`);
};