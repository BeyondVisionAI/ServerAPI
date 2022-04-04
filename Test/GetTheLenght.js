// As a CommonJS Module
const Fs = require('fs');
const Mp3Duration = require('../datas/Mp3Duration');

var mp3Duration = new Mp3Duration();
(async function () {
    var file = await Fs.promises.readFile('./Test1.mp3');

    var duration = mp3Duration.getDuration(file, (err, duration) => {
        if (err) throw err;
        return duration
    });
    console.log(duration);
})();