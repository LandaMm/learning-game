const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  pin: String,
  hostId: String,
  // TODO: check and provide correct type
  gameLive: Boolean,
  gameData: Object,
});

const Game = mongoose.model("game", GameSchema);

module.exports = Game;
