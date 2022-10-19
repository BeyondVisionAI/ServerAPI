const axios = require("axios");
const Fs = require('fs');
const {Errors} = require("../../datas/Errors");
const { uid } = require("uid");

exports.useSignedUrlDownload = async function(signedUrl, objectType = '') {
    try {
        let returnValue = (await (axios.get(signedUrl, (data, err) => {
            if (err)
                throw new Errors.ERROR_DOWNLOAD;
            return data;
        }).promise()));
        let data = returnValue.data;
        let filePath = "";
        const fileId = uid(10);
        switch (objectType) {
            case "Video":
                filePath = process.env.FILES_DIRECTORY + '/Videos/' + fileId + temp[temp.Lenght()];
                break;
            case "Audio":
                filePath = process.env.FILES_DIRECTORY + '/Audios/' + fileId + temp[temp.Lenght()];
                break;
            case "Image":
                filePath = process.env.FILES_DIRECTORY + '/Images/' + fileId + temp[temp.Lenght()];
                break;
            default:
                filePath = process.env.FILES_DIRECTORY + '/' + fileId + temp[temp.Lenght()];
                break;
        }
        await (Fs.writeFile(filePath, data, "binary", function (err) {
            if (err) {
                console.log('Error FS', Errors.ERROR_DOWNLOAD);
                throw (new Errors.ERROR_DOWNLOAD);
            } else {
                return ({ filePath: filePath, fileId: fileId, data: data })
            }
        }));
    } catch (err) {
        console.log(err);
        return (err);
    }
}

/*
// params = {
//  saved : boolean,
//  filePath : string,
//  data: string
// }
*/

exports.useSignedUrlUpload = async function(signedUrl, params) {
    try {
        let data;
        if (params.saved) {
            data = await Fs.promises.readFile(params.filePath, ( returnValue, err ) => {
                if (err)
                    throw new Errors.ERROR_READING_FILE;
            });
        } else {
            data = params.data;
        }
        await axios.post(signedUrl, data, ( returnValue, err ) => {
            if (err)
                throw new Errors.ERROR_UPLOAD;
        });
        return (true);
    } catch (err) {
        console.log(err)
        return (err);
    }
}