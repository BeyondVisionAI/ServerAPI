exports.setStatus = function(req, response) {
    console.log("Set Status");
    response.statusCode = 200;
    response.send("You successfully the Set Status");
}