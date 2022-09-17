module.exports = function (app) {
    const AIRoot = '/AI/';
    const newProcessAction = require('../Controllers/AI/NewProcessAction.js');
    const stopProcessAction = require('../Controllers/AI/StopProcessAction.js');
    const finishedProcessAction = require('../Controllers/AI/FinishedProcessAction.js');


    console.log("Listen route AI : ");

    app.route(`${AIRoot}NewProcessAction`)
        .post(newProcessAction.newProcessAction);
    console.log(`- ${AIRoot}NewProcessAction`);

    app.route(`${AIRoot}StopProcessAction`)
        .post(stopProcessAction.stopProcessAction);
    console.log(`- ${AIRoot}StopProcessAction`);

    app.route(`${AIRoot}FinishedProcessAction`)
        .post(finishedProcessAction.finishedProcessAction);
    console.log(`- ${AIRoot}finishedProcess`);
}