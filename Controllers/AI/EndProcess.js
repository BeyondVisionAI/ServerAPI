exports.endProcess = function(req, response) {
    console.log("End Process");
    response.statusCode = 200;
    response.send("You successfully the End Process");
}