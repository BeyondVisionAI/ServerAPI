var AWS = require('aws-sdk');


(async function () {
    try {
        AWS.config.setPromisesDependency();
        AWS.config.update({
            accessKeyId: "AKIAVEXTIW63VUWJ2LT7",
            secretAccessKey: "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",
            region: 'us-east-1'
        });

        var translate = new AWS.Translate();
        const params = {
            SourceLanguageCode: 'auto',
            TargetLanguageCode: 'fr',
            Text: 'Hello world !',
            Settings: {
                Profanity: "MASK"
            }
        };

        console.log("Hello world !");
        await (translate.translateText(params, function (err, data) {
            if (err)
                console.log(err, err.stack); // an error occurred
            else
                console.log(data);        // successful response
        }));
    } catch (e) {
        console.log('our error', e);
    }
})();