module.exports = function (app) {
    const AIRoot = '/AI/';
    const newProcess = require('../Controllers/AI/NewProcess.js');
    const endProcess = require('../Controllers/AI/EndProcess.js');
    const setStatus = require('../Controllers/AI/SetStatus.js');

    console.log("Listen root AI : ");

    app.route(`${AIRoot}NewProcess`)
        .post(function (req, res) { newProcess.newProcess(req, res) });
    console.log(`- ${AIRoot}NewProcess`);

    app.route(`${AIRoot}EndProcess`)
        .post(function (req, res) { endProcess.endProcess(req, res) });
    console.log(`- ${AIRoot}EndProcess`);

    app.route(`${AIRoot}SetStatus`)
        .post(function (req, res) { setStatus.setStatus(req, res) });
    console.log(`- ${AIRoot}SetStatus`);
}