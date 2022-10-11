module.exports = function (app) {
    const AIRoot = '/AI';
    const ActionRoot = '/Action';
    const FaceRecognitionRoot = '/FaceRecognition';
    const actionNewProcessAction = require('../Controllers/AI/Action/NewProcess.js');
    const actionStopProcessAction = require('../Controllers/AI/Action/StopProcess.js');
    const actionFinishedProcessAction = require('../Controllers/AI/Action/FinishedProcess.js');
    const faceRecognitionNewProcessAction = require('../Controllers/AI/FaceRecognition/NewProcess.js');
    const faceRecognitionStopProcessAction = require('../Controllers/AI/FaceRecognition/StopProcess.js');
    const faceRecognitionFinishedProcessAction = require('../Controllers/AI/FaceRecognition/FinishedProcess.js');


    console.log("Listen route AI : ");

    app.route(`${AIRoot}${ActionRoot}/NewProcess`)
        .post(actionNewProcessAction.newProcess);
    console.log(`- ${AIRoot}${ActionRoot}/NewProcess`);

    app.route(`${AIRoot}${ActionRoot}/StopProcess`)
        .post(actionStopProcessAction.stopProcess);
    console.log(`- ${AIRoot}${ActionRoot}/StopProcess`);

    app.route(`${AIRoot}${ActionRoot}/FinishedProcess`)
        .post(actionFinishedProcessAction.finishedProcess);
    console.log(`- ${AIRoot}${ActionRoot}/finishedProcess`);

    app.route(`${AIRoot}${FaceRecognitionRoot}/NewProcess`)
        .post(faceRecognitionNewProcessAction.newProcess);
    console.log(`- ${AIRoot}${FaceRecognitionRoot}/NewProcess`);

    app.route(`${AIRoot}${FaceRecognitionRoot}/StopProcess`)
        .post(faceRecognitionStopProcessAction.stopProcess);
    console.log(`- ${AIRoot}${FaceRecognitionRoot}/StopProcess`);

    app.route(`${AIRoot}${FaceRecognitionRoot}/FinishedProcess`)
        .post(faceRecognitionFinishedProcessAction.finishedProcess);
    console.log(`- ${AIRoot}${FaceRecognitionRoot}/finishedProcess`);
}