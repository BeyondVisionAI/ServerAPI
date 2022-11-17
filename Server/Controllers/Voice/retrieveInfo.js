const { voices } = require("../../datas/config");

/**
 * Retrieve all the languages of the different type of voice existing in AWS.
 * @param { Request } req
 * @param { Response } res
 * @returns { response to send }
 */

exports.retrieveLanguages = function (req, res) {
    console.log("Retrieving Languages...");
    let returnValue = { language: [] };
    for (let voice of voices) {
        if (!voice.language in returnValue.language) {
            returnValue.language.push(voice.language);
        }
    }
    return (res.status(200).send(returnValue));
};

/**
 * Retrieve all the id of the different type of voice existing in AWS.
 * @param { Request } req { body: language }
 * @param { Response } res
 * @returns { response to send }
 */

exports.retrieveVoices = function (req, res) {
    console.log("Retrieving Voices...");
    let returnValue = { voices: [] };

    console.log(req.body.language);
    if (!req.body.language) {
        console.log('Nop');
        returnValue = voices
    } else {
        console.log('Yep');
        for (let voice of voices) {
            if (voice.language === req.body.language) {
                returnValue.voices.push(voice);
            }
        }
    }
    return (res.status(200).send(returnValue));
};