var FFmpeg = require('ffmpeg');
const Fs = require('fs');



(async function () {
    var video = '';
    var audio = '';
    await Fs.readFile('', (err, data) => {
        if (err) {
            console.log(err);
            return
        } else
            video = data;
    });

    await Fs.readFile('', (err, data) => {
        if (err) {
            console.log(err);
            return
        } else
            audio = data;
    });

    let { createFFmpeg, fetchFile } = FFmpeg;
    let ffmpeg = createFFmpeg();
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(video));
    ffmpeg.FS('writeFile', 'audio.mp4', await fetchFile(audio));
    await ffmpeg.run('-i', 'video.mp4', '-i', 'audio.mp4', '-c', 'copy', 'output.mp4');
    let data = await ffmpeg.FS('readFile', 'output.mp4');
    return new Uint8Array(data.buffer);
})();