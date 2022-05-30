var AWS = require('aws-sdk');
const Fs = require('fs');

(async function () {
    try {
        AWS.config.setPromisesDependency();
        AWS.config.update({
            accessKeyId: "AKIAVEXTIW63VUWJ2LT7",
            secretAccessKey: "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",
            region: 'us-east-1'
        });

        var s3 = new AWS.S3();
        const data = (await (s3.getObject({
            Bucket: "video-bucket-beyondvision-poc",
            Key: "sampleA.mp4"
        }).promise())).Body;

        console.log(data);
        await (Fs.writeFile("./video.mp4", data, "binary", function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("The file was saved!");
            }
            debugger;
        }));
    } catch (e) {
        console.log('our error', e);
    }
})();
