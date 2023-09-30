const mongoose = require("mongoose");
const GameStats = require("./gameStats"); // Import the statistics model

// Define the Game schema
const GameSchema = new mongoose.Schema({
  pin: String,
  hostId: String,
  gameLive: Boolean,
  gameData: Object,
  gameStats: { type: mongoose.Types.ObjectId, ref: GameStats }, // Reference to the statistics
});

// Create the Game model
const Game = mongoose.model("game", GameSchema);

// Export the Game model
module.exports = Game;
