var ffmpeg = require('fluent-ffmpeg');

function baseName(str) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);

    if (base.lastIndexOf(".") != -1) {
        base = base.substring(0, base.lastIndexOf("."));
    }

    return base;
}

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    var filename = val;
    var basename = baseName(filename);
    console.log(index + ': Input File ... ' + filename);

    ffmpeg(filename)
        .output(basename + '-720x480.mp4')
        .videoCodec('libx264')
        .size('720x480')

        .output(basename + '-1280x720.mp4')
        .videoCodec('libx264')
        .size('1280x720')

        .output(basename + '-1920x1080.mp4')
        .videoCodec('libx264')
        .size('1920x1080')

        .output(basename + '-3840x2160.mp4')
        .videoCodec('libx264')
        .size('3840x2160')

        .on('error', function (err) {
            console.log('An error occurred: ' + err.message);
        })
        .on('progress', function (progress) {
            console.log('... frames: ' + progress.frames);
        })
        .on('end', function () {
            console.log('Finished processing');
        })
        .run();
});