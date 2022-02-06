exports.newProcess = function(req, response) {
    console.log("New Process : " + req.body);
    response.statusCode = 200;
    response.send("You successfully the New Process");
}