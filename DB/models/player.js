const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema(
  {
    hostId: String,
    playerId: String, // socket's id
    name: String,
    gameData: Object,
  },
  { timestamps: true },
);

const Player = mongoose.model("player", PlayerSchema);

module.exports = Player;
