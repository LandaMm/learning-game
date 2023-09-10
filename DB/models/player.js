const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  hostId: String,
  playerId: String, // socket's id
  name: String,
  gameData: Object,
});

const Player = mongoose.model("player", PlayerSchema);

module.exports = Player;
