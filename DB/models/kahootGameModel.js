const mongoose = require("mongoose");

const KahootGameSchema = new mongoose.Schema({
  pin: String,
  hostId: String,
  // TODO: check and provide correct type
  gameLive: String,
  gameData: Object,
});

const KahootGame = mongoose.model("kahootgames", KahootGameSchema);

module.exports = KahootGame;
