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

// var url = process.env.DB_CONN_STRING;

// if (process.env.MONGO_STR) {
//   await mongoose.connect(
//     process.env.DB_CONN_STRING,
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//     .then(() => {
//       console.log("Connected to mongo db")
//     })
//     .catch(err => {
//       console.error("Unable to connect to mongo db", err)
//     });
// } else {
//   console.log("Missing enviroment variable : DB_CONN_STRING");
//   process.exit(84);
// }

const port = process.env.PORT || 8080;
app.listen(port);
console.log("Server started on PORT : " + port);