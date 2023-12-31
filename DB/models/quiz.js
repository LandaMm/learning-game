const mongoose = require("mongoose");
const Teacher = require("./teacher");

const QuizSchema = new mongoose.Schema(
  {
    name: String,
    /**
     * Question type:
     * {
     *  question: String,
     *  answers: Array,
     *  correct: String
     *  weight: Number
     * }
     */
    questions: Array,
    createdBy: { ref: Teacher, type: mongoose.Types.ObjectId, default: null },
  },
  { timestamps: true },
);

const Quiz = mongoose.model("quiz", QuizSchema);

module.exports = Quiz;
