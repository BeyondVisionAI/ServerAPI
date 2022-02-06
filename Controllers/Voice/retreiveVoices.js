const { voices } = require("../../datas/config");

exports.retreiveVoices = function (req, response) {
    console.log("Retreive Voices");
    response.setHeader("Content-Type", "application/json");
    response.statusCode = 200;
    response.end(JSON.stringify(voices));
    response.send();
};