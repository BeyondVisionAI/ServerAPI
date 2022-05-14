module.exports = function (app) {
    const ProjectRoute = '/Project/';
    const projectClosing = require('../Controllers/Project/ProjectClosing.js');


    console.log("Listen route Project : ");

    app.route(`${ProjectRoute}ProjectClosing/:projectId`)
        .post(projectClosing.projectClosing);
    console.log(` - ${ProjectRoute}ProjectClosing`);
}