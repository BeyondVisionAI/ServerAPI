// var FFmpeg = require('@ffmpeg/ffmpeg');
const Fs = require('fs');
var { exec } = require('child_process');

// -i .\Test\Test1.mp4 -i .\Test\Test1.mp3 -c copy output.mp4

(async function () {
    var video = '.\\Test\\Test1.mp4'
    var audio = '.\\Test\\Test1.mp3'
    var output = 'output.mp4'
    await exec(`ffmpeg.exe -i ${video} -i ${audio} -c copy ${output}`,
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
                return (84);
            }
            console.log('Finish !')
            return (0);
        });
})();