var AWS = require('aws-sdk');

(async function () {
    try {
        AWS.config.setPromisesDependency();
        AWS.config.update({
            accessKeyId: "AKIAVEXTIW63VUWJ2LT7",
            secretAccessKey: "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",
            region: 'us-east-1'
        });

        var s3 = new AWS.S3();
        const params = {
            Bucket: "finished-product",
            Key: `TESTAAAAAA/${filename}.mp3`, // File name you want to save as in S3
            Body: fileContent
        };

        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });

        console.log(data);
        debugger;
    } catch (e) {
        console.log('our error', e);
    }
})();
