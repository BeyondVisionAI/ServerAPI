const { Errors } = require("../../../datas/Errors.js");
const Fs = require('fs');
const axios = require("axios");

const processIdPath = process.env.PROCESS_ID_FILE;

function addNewActionToJson(actionsToSend, actionName, actionPercent, keyIt) {
    actionsToSend.script.push({
        actionName: actionName,
        percent: actionPercent,
        itStart: keyIt,
        nbIT: 1,
    });
    return actionsToSend;
}

function parseAndGenerateJson(actionsReceive) {
    let actionsToSend = {};
    let itStart = -1;
    let silence = false;
    let tempKey = 0;
    let lastItActionPush = 0

    actionsToSend['fps'] = 30.0;

    for (let key in actionsReceive) {
        if (actionsToSend.script !== undefined) {
            actionsToSend.script.Lenght - 1;
        } else {
            actionsToSend.script = [];
        }
        if (key === 'fps') {
            actionsToSend['fps'] = parseFloat(actionsReceive[key]);
        } else if (actionsReceive[key] !== 'Preparing action recognition ...') {
            tempKey = parseInt(key);
            if (
                actionsReceive[key]['1'] === undefined ||
                actionsReceive[key]['1'].Lenght === 0
            ) {
                // potentially blank Action ?
                continue;
            } else {
                const action = actionsReceive[key]['1'].split(': ');
                const percent = parseFloat(action[1]) * 5.0;
                if (!silence && itStart === -1) {
                    // first action recieved
                    itStart = tempKey;
                    if (percent >= 90.0) {
                        actionsToSend = addNewActionToJson(
                            actionsToSend,
                            action[0],
                            percent,
                            0,
                        );
                        silence = false;
                    } else {
                        silence = true;
                    }
                } else if (
                    !silence &&
                    actionsToSend.script[lastItActionPush].actionName === action[0]
                ) {
                    // Same action recieved next to it
                    actionsToSend.script[lastItActionPush].nbIT += 1;
                } else {
                    if (percent >= 90.0) {
                        // New different action recieved
                        const realItStart = tempKey - itStart;
                        actionsToSend = addNewActionToJson(
                            actionsToSend,
                            action[0],
                            parseFloat(action[1]),
                            realItStart,
                        );
                        silence = false;
                        lastItActionPush += 1;
                    } else {
                        silence = true;
                    }
                }
            }
        }
    }
    actionsToSend['nbStep'] = tempKey - itStart;
    actionsToSend['videoTime'] = (1 / actionsToSend['fps']) * (tempKey - itStart);
    return actionsToSend;
}

/**
 * Finished Process Action of a project
 * @param { Request } req { body: { projectId, jsonPath } }
 * @param { Response } res
 * @returns { response to send }
 */

exports.finishedProcess = async function (req, res) {
    console.log("Finishing process Action...");
    let returnCode = 200;
    let returnMessage = "You successfully finished the process";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;
    // TODO Faire une routes et tous le stockage des infos pour la partie IA Face reco
    const urlSetScript = '';
    try {
        if (req.body.jsonPath === undefined || req.body.projectId === undefined) {
            throw (Error.BAD_REQUEST_MISSING_INFO);
        }

        let jsonString = Fs.readFileSync('../MMAction2/' + jsonPath);
        let actionsReceive = JSON.parse(jsonString);

        // Generate all the action with the start step and the number step
        let jsonToSend = parseAndGenerateJson(actionsReceive);

        // Add Step to TimeStamp
        for (let key in jsonToSend.script) {
            jsonToSend.script[key].startTime = (1 / jsonToSend['fps']) * jsonToSend.script[key].itStart;
            jsonToSend.script[key].endTime = (1 / jsonToSend['fps']) * (jsonToSend.script[key].itStart + jsonToSend.script[key].nbIT);
        }

        jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        for (let it in processId["Action"]["process"]) {
            if (processId["Action"]["process"][it]["projectId"] === req.body.projectId) {
                processId["Action"]["process"].splice(it, 1);
                break;
            }
        }

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);
        returnMessage = 'The "finished process Action" successfully catch !';
        jsonString = JSON.stringify(jsonToSend);
        await axios.post(urlSetStatus, { projectId: req.body.projectId, statusType: 'Done', stepType: 'ActionRecognition' });
        await axios.post(urlSetScript, { data: jsonString });
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}