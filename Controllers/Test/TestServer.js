exports.testServer = function(req, response) {
    response.statusCode = 200;
    response.send("You successfully contacted the server");
}