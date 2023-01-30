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

    actionsToSend['fps'] = 0;

    for (let key in actionsReceive) {
        if (actionsToSend.script !== undefined) {
            actionsToSend.script.Lenght - 1;
        } else {
            actionsToSend.script = [];
        }
        if (key === 'fps') {
            //console.log("found FPS");
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
                    // first action received
                    itStart = tempKey;
                    actionsToSend = addNewActionToJson(
                        actionsToSend,
                        action[0],
                        percent,
                        0,
                    );
                } else if (
                    !silence &&
                    actionsToSend.script[lastItActionPush].actionName === action[0]
                ) {
                    // Same action recieved next to it
                    actionsToSend.script[lastItActionPush].nbIT += 1;
                } else {
                    if (percent >= 25) {
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
    //console.log(req.body);
    console.log("jsonPath :", req.body.jsonPath);
    console.log("projectId :", req.body.projectId);
    const jsonPath = `${req.body.jsonPath}`;
    const userId = req.body.userId;
    const projectId = req.body.projectId;

    let returnCode = 200;
    let returnMessage = "You successfully finished the process";
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${projectId}/setStatus`;
    // TODO Faire une routes et tous le stockage des infos pour la partie IA Face reco
    try {
        if (req.body.jsonPath === undefined || req.body.projectId === undefined) {
            throw (Error.BAD_REQUEST_MISSING_INFO);
        }
    const urlSetReplicas = `${process.env.BACKEND_URL}/projects/${projectId}/setReplicas`;

        let jsonString = Fs.readFileSync(jsonPath, 'utf8');
        let actionsReceive = jsonString;

        console.log(actionsReceive);
        // Generate all the action with the start step and the number step
        let jsonToSend = parseAndGenerateJson(JSON.parse(actionsReceive));
        

        // Add Step to TimeStamp
        for (let key in jsonToSend.script) {
            jsonToSend.script[key].startTime = (1 / jsonToSend['fps']) * jsonToSend.script[key].itStart;
            jsonToSend.script[key].endTime = (1 / jsonToSend['fps']) * (jsonToSend.script[key].itStart + jsonToSend.script[key].nbIT);
        }

        jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        for (let it in processId["Action"]["process"]) {
            if (processId["Action"]["process"][it]["projectId"] === projectId) {
                processId["Action"]["process"].splice(it, 1);
                break;
            }
        }

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);
        returnMessage = 'The "finished process Action" successfully catch !';
        jsonString = JSON.stringify(jsonToSend);
        await axios.post(urlSetStatus, { 
            statusType: 'Done',
            stepType: 'ActionRetrieve',
        });
        console.log(`Sending a post to setReplicas with infos:\n projectId: ${projectId}\nuserId: ${userId}\nactionsJson:`);
        await axios.post(urlSetReplicas, {
            userId: userId,
            actionsJson: jsonString,
        });
    } catch (err) {
        console.log("Error is :", err);
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}