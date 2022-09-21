const { voices } = require("../../datas/config");

/**
 * Retrieve all the id of the different type of voice existing in AWS.
 * @param { Request } req
 * @param { Response } res
 * @returns { response to send }
 */

exports.retrieveVoices = function (req, res) {
    console.log("Retrieving Voices...");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(voices));
    return (res.status(200).send());
};