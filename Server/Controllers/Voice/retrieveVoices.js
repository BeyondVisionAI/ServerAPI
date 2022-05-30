const { voices } = require("../../datas/config");

exports.retrieveVoices = function (req, res) {
    console.log("Retreive Voices");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(voices));
    return (res.status(200).send());
};