const { exec } = require("child_process");
const Fs = require('fs');
const { Errors } = require("../../datas/Errors.js");
const { deleteFile } = require('../S3Manager/S3Manager');

const processIdPath = "../../datas/processId.json"

// Not implemented

/**
 * Delete a project and all the files on the AWS
 * @param { Request } req { params: { projectId }, body : { jsonIdFiles }}
 * @param { Response } res
 * @returns { status: Number, message: String }
 */

exports.projectClosing = function (req, res) {
    console.log("Closing a Project...");
    let returnCode = 200;
    let returnMessage = "You successfully Close the Project";

    try {

        if (req.params.projectId === undefined) {
            throw Errors.BAD_REQUEST_BAD_INFOS;
        }
        let jsonString = Fs.readFileSync(processIdPath);
        let processId = JSON.parse(jsonString);

        for (let it in processId.process) {
            if (processId.process[it].projectId = req.body.projectId) {
                console.log(`Kill ${processId.process[it].pid}`);
                exec(`Kill ${processId.process[it]}`);
                processId.process.splice(it, 1);
                break;
            }
        }

        jsonString = JSON.stringify(processId);
        Fs.writeFileSync(processIdPath, jsonString);

        if (req.body.jsonIdFiles !== undefined) {
            for (let key in req.body.jsonIdFiles) {
                let fileName = req.body.jsonIdFiles[key].id;
                let filesPath = [process.env.FILE_PATH + fileName + ".mp3", process.env.FILE_PATH + fileName + ".mp4"]
                for (let it in filesPath) {
                    if (Fs.fileExistsSync(filesPath[it])) {
                        Fs.unlinkSync(filesPath[it]);
                    }
                }
            }
        }
    } catch (err) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
    }
    return (res.status(returnCode).send(returnMessage));
}