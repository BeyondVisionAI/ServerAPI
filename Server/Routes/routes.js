module.exports = function (app) {
  const aiHandler = require("./AI.js");
  const voiceHandler = require("./Voice.js");
  const generation = require("./Generation.js");
  const project = require("./Project.js");

  aiHandler(app);
  voiceHandler(app);
  generation(app);
  project(app);
}