var { exec } = require('child_process');

(async function () {
    // var filePath = 'Test1.mp3';
    var filePath = 'Test1.mp3';
    var tempo = '0.5';
    // var outputPath = 'Testx2.mp3';
    var outputPath = 'Testx0.5.mp3';

    let code = await exec(`ffmpeg.exe -i ${filePath} -filter:a "atempo=${tempo}" -vn ${outputPath}`,
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
                return (84);
            }
            console.log('Finish !')
            return (0);
        }
    );
})();