module.exports = function(app) {
    const Test = require('../Controllers/Test/TestServer.js');

    app.route('/test')
      .get(Test.testServer);
  }