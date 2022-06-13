const express = require("express");
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

AWS.config.setPromisesDependency();
AWS.config.update({
  accessKeyId: process.env.SECRET_KEY_ID_AWS,
  secretAccessKey: process.env.SECRET_KEY_ACCES_AWS,
  region: process.env.REGION_AWS
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
    res.send();
  });
});

var routes = require('./Routes/routes');

routes(app);

const port = process.env.PORT || 8082;
app.listen(port);
console.log("Server started on PORT : " + port);
