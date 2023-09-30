const mongoose = require("mongoose");
const Quiz = require("./quiz");

// Define the GameStats schema
const GameStatsSchema = new mongoose.Schema({
  gameId: { type: mongoose.Types.ObjectId, ref: "game" }, // Reference to the game
  quizId: { type: mongoose.Types.ObjectId, ref: Quiz },
  questionStats: [
    {
      questionIndex: Number, // Index of the question in the game
      correctCount: Number, // Number of students who answered correctly
      incorrectCount: Number, // Number of students who answered incorrectly
      noAnswerCount: Number, // Number of students who did not answer
    },
  ],
});

// Create the GameStats model
const GameStats = mongoose.model("gameStats", GameStatsSchema);

// Export the GameStats model
module.exports = GameStats;
