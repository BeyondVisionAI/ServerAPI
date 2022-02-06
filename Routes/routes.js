module.exports = function(app) {
  const aiHandler = require("./AI.js");
  const voiceHandler = require("./Voice.js");

  aiHandler(app);
  voiceHandler(app);
}