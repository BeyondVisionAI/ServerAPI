var AWS = require('aws-sdk');
const Fs = require('fs');
const { uid } = require('uid');
const { Errors } = require("../../datas/Errors.js");

exports.downloadFile = async function (bucketnName, keyName, saveIt = false, type = "") {
    try {
        let s3 = new AWS.S3();
        const data = (await (s3.getObject({
            Bucket: bucketnName,
            Key: keyName
        }).promise())).Body;

        console.log(data);
        if (saveIt === true) {
            let temp = keyName.split('.');
            const fileId = uid(10);
            let filePath = "";
            switch (type) {
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
                    console.log('Error FS', Errors.ERROR_S3_DOWNLOAD);
                    return ({ code: 84, err: Errors.ERROR_S3_DOWNLOAD });
                } else {
                    return ({ code: 0, filePath: filePath, fileId: fileId, data: data })
                }
            }));
        } else {
            return ({ code: 0, data: data });
        }
    } catch (err) {
        console.log('Error catch', err);
        return ({ code: 84, err: err });
    }
};

exports.uploadFile = async function (bucketnName, keyName, params) {
    try {
        let data
        if (params.saved) {
            data = await Fs.promises.readFile(params.filePath);
        } else if (params.data) {
            data = params.data
        } else {
            throw 'No data set';
        }
        let s3 = new AWS.S3();
        const paramsToSend = {
            Bucket: bucketnName,
            Key: keyName,
            Body: data
        };

        // Uploading files to the bucket
        s3.upload(paramsToSend, function (err, data) {
            if (err) {
                console.log('Error S3', Errors.ERROR_S3_UPLOAD);
                return ({ code: 84, err: Errors.ERROR_S3_UPLOAD });
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            return ({ Code: 0 })
        });
    } catch (err) {
        console.log('Error catch', err);
        return ({ code: 84, err: err });
    }
};

exports.createFolder = async function (bucketnName, keyName) {
    try {
        if (right(keyName, 1) !== '/')
            keyName += '/';

        let s3 = new AWS.S3();
        const params = {
            Bucket: bucketnName,
            Key: keyName
        };

        // Uploading the folder to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                console.log('Error S3', Errors.ERROR_S3_UPLOAD);
                return ({ code: 84, err: Errors.ERROR_S3_UPLOAD });
            }
            console.log(`Folder created successfully. ${data.Location}`);
            return ({ Code: 0 })
        });
    } catch (err) {
        console.log('Error catch', err);
        return ({ code: 84, err: err });
    }
};

exports.deleteFile = async function (bucketName, keyname) {
    try {
        let s3 = new AWS.S3();

        const params = {
            Bucket: bucketnName,
            Key: keyName
        };

        s3.deleteObject(params, function (err, data) {
            if (err) {
                console.log('Error S3', Errors.ERROR_S3_DELETE);
                return ({ code: 84, err: Errors.ERROR_S3_DELETE });
            }
            console.log(`File deleted successfully. ${data.Location}`);
            return ({ Code: 0 })               // deleted
        });
    } catch (err) {
        console.log('Error catch', err);
        return ({ code: 84, err: err });
    }
}