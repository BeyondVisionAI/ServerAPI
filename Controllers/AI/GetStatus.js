exports.getStatus = function(req, response) {
    console.log("Get Status");
    response.statusCode = 200;
    response.send("You successfully the Get Status");
}