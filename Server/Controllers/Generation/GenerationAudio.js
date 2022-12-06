const { downloadFile, uploadFile } = require('../MediaManager/S3Manager/S3Manager');
const { Errors } = require("../../datas/Errors.js");
const axios = require('axios');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

const fs = require("fs");


//TODO Remplir le header quand sera fait
/**
 * Concat all the Audios files of a project to create the "Final audio"
 * @param { Request } req { body: { projectId: string,  audioInfo: List[id: string, timeStamp: float, duration: float]} }
 * @param { Response } res
 * @returns { response to send }
 */

exports.generationAudio = async function (req, res) {
    console.log("Generating a Final Audio...");
    if (!req.body.projectId || !req.body.audioInfo)
        return (res.status(400).send(Errors.BAD_REQUEST_MISSING_INFOS));
    console.log('Generation Audio');
    const audio_dest = `${process.env.FILES_DIRECTORY}/Audios/${req.body.projectId}`
    const urlSetStatus = `${process.env.BACKEND_URL}/projects/${req.body.projectId}/setStatus`;
    let returnCode = 200;
    let returnMessage = "You successfully generate the audio";
    let returnStatus = "Done";
    try {
        await axios.post(urlSetStatus, { statusType: 'InProgress', stepType: 'AudioGeneration' });
        audioInfo = await sortInput(req.body.audioInfo);
        updatedAudioInfo = await getfiles(req.body.projectId, audioInfo);
        roadGen = await genBlanks(updatedAudioInfo);
        ad_file = await concatAudios(roadGen, `${audio_dest}-out.mp3`);
        if (!ad_file || !fs.existsSync(ad_file))
            throw(new Error('Could not generate the audiodescription file'));
        aws_resp = await uploadFile(`${process.env.S3_BUCKET_FINISHED_PRODUCT_AWS}`, `Audio/${req.body.projectId}.mp3`, {saved: true, filePath: ad_file})
        if (aws_resp.err)
            throw(new Error(aws_resp.err));
        roadGen.push(ad_file)
        clearFiles(roadGen)
    } catch (e) {
        returnCode = 400;
        returnMessage = Errors.BAD_REQUEST_BAD_INFOS;
        returnStatus = 'Error';
    }
    await axios.post(urlSetStatus, { statusType: returnStatus, stepType: 'AudioGeneration' });
    const temp = res.status(returnCode).send(returnMessage);
    return (temp);
}

const getEnd = (audio) => audio.timeStamp + audio.duration;

async function getfiles(projectId, audioInfo) {
    var updatedAudioInfo = []
    try {
        for (let audio of audioInfo) {
            if (audio.id == undefined || audio.timeStamp == undefined || audio.duration == undefined)
                throw(new Error("Invalid object"));
            var keyName = `${projectId}/${audio.id}.mp3`;
            let dl = await downloadFile(process.env.S3_BUCKET_AUDIOS_AWS, keyName, true, `Audio`);
            let updatedAudio = {
                filePath: dl.filePath,
                id: dl.fileId,
                timeStamp: audio.timeStamp,
                duration: audio.duration
            }
            updatedAudioInfo.push(updatedAudio);
        }
    } catch (error) {
        throw(new Error("Could not get the files from S3"))
    }
    return (updatedAudioInfo)
}

async function genBlanks(updatedAudioInfo) {
    var roadGen = []
    try {
        var prevEnd = 0;
        for (let audio of updatedAudioInfo) {
            if (prevEnd < audio.timeStamp) {
                blank = await genBlankAudio(audio.timeStamp - prevEnd, audio)
                if (!blank)
                    throw(new Error("Error while generating blank audio, it might be a problem with ffmpeg."))
                roadGen.push(blank)
            }
            if (audio.filePath != null)
                roadGen.push(audio.filePath)
            prevEnd = getEnd(audio);
        }
    } catch (error) {
        throw(new Error("Could not generate the blanks audio files"))
    }
    return (roadGen)
}

async function genBlankAudio(time, audioObj) {
    try {

        dest = `${process.cwd()}/${process.env.FILES_DIRECTORY}/Audios/blank-${audioObj.id}.mp3` // ffmpeg don't handle non aboslute path, generation of the path to file with os separators
        dest_out = `${process.env.FILES_DIRECTORY}/Audios/blank-${audioObj.id}.mp3`
        const {error, stdout, stderr} = await exec(`${process.env.FFMPEG_CMD} -f lavfi -i anullsrc=r=22050:cl=mono -t ${time} -id3v2_version 3 ${dest}`)

        if (error)
            throw(new Error(error))
        return (dest_out)
    } catch (error) {
        console.error('ERROR: ' + error)
        return (null)
    }
}

async function concatAudios(roadGen, dest_out) {
    try {
        results = true
        files = ""
        for (let audio of roadGen) {
            files = files.concat(process.cwd(), '/', audio, '|')
        }
        files = files.slice(0, -1)

        const {error, stdout, stderr} = await exec(`${process.env.FFMPEG_CMD} -i "concat:${files}" -acodec copy ${process.cwd()}/${dest_out}`)

        if (error) {
            console.log(error)
            throw(new Error('Could not generate the audiodescription audio'))
        }
        return (dest_out)
    } catch (err) {
        console.log(err)
        return (null)
    }
}

function clearFiles(files) {
    for (let file of files) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
            })
        }
    }
}

async function sortInput(audioInfo) {
    await audioInfo.sort((a, b) => {
        if (a.timeStamp > b.timeStamp)
            return(1);
        else if (a.timeStamp < b.timeStamp)
            return(-1);
        else
            return(0);
    })
    return(audioInfo);
}