const { Errors } = require("../../datas/Errors.js");
var Fs = require('fs');

var processIdPath = "../../datas/processId.json"

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
    var actionsToSend = {};
    var itStart = -1;
    var silence = false;
    var tempKey = 0;
    var lastItActionPush = 0

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
 * finished Process Action of a project
 * @param { Request } req { params: projectId, body: { jsonPath } }
 * @param { Response } res
 * @returns { response to send }
 */
exports.finishedProcessAction = async function (req, res) {
    var returnCode = 200;
    var returnMessage = "You successfully finished the process";
    const urlSetScript = `https://localhost/projects/${req.body.projectId}/setScript`;
    try {
        if (req.body.jsonPath === undefined || req.params.projectId === undefined) {
            throw (Error.BAD_REQUEST_MISSING_INFO);
        }

        var jsonString = Fs.readFileSync('../MMAction2/' + jsonPath);
        var actionsReceive = JSON.parse(jsonString);

        // Genreate all the action with the start step and the number step 
        var jsonToSend = parseAndGenerateJson(actionsReceive);

        // jsonToSend: { 
        //      script:[
        //          0:{"actionName", "percent", "itStart", "nbIT", startTime, endTime},
        //          etc...
        //      ],
        //      fps: 30.0,
        //      nbStep: Xxx,
        //      videoTime: Xxx.xx
        // }


        // Add Step to TimeStemp
        for (let key in jsonToSend.script) {
            jsonToSend.script[key].startTime = (1 / jsonToSend['fps']) * jsonToSend.script[key].itStart;
            jsonToSend.script[key].endTime = (1 / jsonToSend['fps']) * (jsonToSend.script[key].itStart + jsonToSend.script[key].nbIT);
        }

        var jsonString = Fs.readFileSync(processIdPath);
        var processId = JSON.parse(jsonString);

        for (let it in processId.process) {
            if (processId.process[it].projectId = req.body.projectId) {
                processId.process.splice(it, 1);
                break;
            }
        }

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);
        returnMessage = 'The "finished process Action" successfully catch !';
        jsonString = JSON.stringify(jsonToSend);
        await fetch(urlSetScript, { method: 'post', body: jsonString });
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}