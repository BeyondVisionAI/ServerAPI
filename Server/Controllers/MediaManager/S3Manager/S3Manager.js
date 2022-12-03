var AWS = require('aws-sdk');
const Fs = require('fs');
const { uid } = require('uid');
const { Errors } = require("../../../datas/Errors.js");

const AWSAccess = {
    accessKeyId: process.env.SECRET_KEY_ID_AWS,
    secretAccessKey: process.env.SECRET_KEY_ACCES_AWS,
    region: process.env.REGION_AWS
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

exports.downloadFile = async function (bucketName, keyName, saveIt = false, objectType = "") {
    console.log("access id is: " + AWSAccess.accessKeyId);
    console.log("secret id is: " + AWSAccess.secretAccessKey);
    console.log("region is: " + AWSAccess.region);
    console.log("Bucket name: " + bucketName);
    console.log("Key: " + keyName);
    
    try {
        let s3 = new AWS.S3(AWSAccess);
        sleep(5000);
        const result = await  new Promise((resolve, reject) => {
            s3.getObject({
                Bucket: bucketName,
                Key: keyName
            }, (err, data) => {
                if (err) {
                    console.log("B")
                    reject ({code: 84, err: err})
                }
                console.log("A")
               resolve({code: 0, data: data.Body})
            });
        });

        if (saveIt === true) {
            let temp = keyName.split('.');
            const fileId = uid(10);
            let filePath = "";

            switch (objectType) {
                case "Video":
                    filePath = `${process.env.FILES_DIRECTORY}/Videos/${fileId}.${temp[temp.length -1]}`;
                    break;
                case "Audio":
                    filePath = `${process.env.FILES_DIRECTORY}/Audios/${fileId}.${temp[temp.length -1]}`;
                    break;
                case "Image":
                    filePath = `${process.env.FILES_DIRECTORY}/Images/${fileId}.${temp[temp.length -1]}`;
                    break;
                default:
                    filePath = `${process.env.FILES_DIRECTORY}/${fileId}.${temp[temp.length -1]}`;
                    break;
            }
            console.log(result);
            await (Fs.writeFile(filePath, result.data, "binary", function (err) {
                if (err) {
                    console.log('Error FS', Errors.ERROR_S3_DOWNLOAD);
                    throw ({ code: 84, err: Errors.ERROR_S3_DOWNLOAD });
                }
            }));
            return ({code : 0, filePath: filePath, fileId: fileId, data: result.data})
        } else {
            return ({ code: 0, data: result.data });
        }
    } catch (err) {
        console.log('Error catch :', err);
        return ({ code: 84, err: err.err });
    }
};

exports.uploadFile = async function (bucketName, keyName, params) {
    try {
        let data
        if (params.saved) {
            data = await Fs.promises.readFile(params.filepath);
        } else if (params.data) {
            data = params.data
        } else {
            throw 'No data set';
        }
        let s3 = new AWS.S3(AWSAccess);
        const paramsToSend = {
            Bucket: bucketName,
            Key: keyName,
            Body: data
        };

        // Uploading files to the bucket
        return await new Promise((resolve, reject) => {
            s3.upload(paramsToSend, function (err, data) {
                if (err) {
                    console.log('Error S3', Errors.ERROR_S3_UPLOAD);
                    reject ({ code: 84, err: Errors.ERROR_S3_UPLOAD });
                }
                console.log(`File uploaded successfully. ${data.Location}`);
                resolve ({ code: 0 })
            });
        });
    } catch (err) {
        console.log('Error catch :', err);
        return ({ code: 84, err: err });
    }
};

exports.createFolder = async function (bucketName, keyName) {
    try {
        if (right(keyName, 1) !== '/')
            keyName += '/';

        let s3 = new AWS.S3(AWSAccess);
        const params = {
            Bucket: bucketName,
            Key: keyName
        };

        // Uploading the folder to the bucket
        return await new Promise((resolve, reject) => {
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log('Error S3', Errors.ERROR_S3_UPLOAD);
                    reject ({code: 84, err: Errors.ERROR_S3_UPLOAD});
                }
                console.log(`Folder created successfully. ${data.Location}`);
                resolve ({code: 0})
            })
        });
    } catch (err) {
        console.log('Error catch', err);
        return ({ code: 84, err: err });
    }
};

exports.deleteFile = async function (bucketName, keyname) {
    try {
        let s3 = new AWS.S3(AWSAccess);

        const params = {
            Bucket: bucketName,
            Key: keyName
        };

        return await new Promise((resolve, reject) => {
            s3.deleteObject(params, function (err, data) {
                if (err) {
                    console.log('Error S3', Errors.ERROR_S3_DELETE);
                    reject ({ code: 84, err: Errors.ERROR_S3_DELETE });
                }
                console.log(`File deleted successfully. ${data.Location}`);
                resolve ({ code: 0 })               // deleted
            })
        });
    } catch (err) {
        console.log('Error catch', err);
        return ({ code: 84, err: err });
    }
}