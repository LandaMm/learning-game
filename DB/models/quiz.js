const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  name: String,
  /**
   * Question type:
   * {
   *  question: String,
   *  answers: Array,
   *  correct: String
   * }
   */
  questions: Array,
});

const Quiz = mongoose.model("quiz", QuizSchema);

module.exports = Quiz;
