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
        const data = (await (s3.getObject({
            Bucket: "finished-product",
            Key: "TESTAAAAAA"
        }).promise())).Body;

        console.log(data);
        debugger;
    } catch (e) {
        console.log('our error', e);
    }
})();
