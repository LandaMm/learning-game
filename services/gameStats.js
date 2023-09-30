const GameStats = require("../DB/models/gameStats"); // Import the gameStats model
const { Games } = require("./games");
const Quizes = require("./quiz");

class GameStatsService {
  // Function for creating or retrieving game statistics
  static async getGameStats(gameId, quiz) {
    let gameStats = await GameStats.findOne({ gameId });

    if (!gameStats) {
      // If game statistics do not exist, create a new one
      gameStats = new GameStats({
        gameId,
        quizId: quiz,
        questionStats: [],
      });
      await gameStats.save();
    }

    return gameStats;
  }

  // Function for updating question statistics
  static async updateQuestionStats(gameStats, questionIndex, isCorrect) {
    let questionStatsIndex = gameStats.questionStats.findIndex(
      (qs) => qs.questionIndex === questionIndex,
    );

    if (questionStatsIndex === -1) {
      // If question statistics do not exist, create a new one
      gameStats.questionStats.push({
        questionIndex,
        correctCount: 0,
        incorrectCount: 0,
        noAnswerCount: 0,
      });
      questionStatsIndex = gameStats.questionStats.length - 1;
    }

    if (isCorrect) {
      gameStats.questionStats[questionStatsIndex].correctCount += 1;
    } else {
      gameStats.questionStats[questionStatsIndex].incorrectCount += 1;
    }

    await gameStats.save();
  }

  async findGameEasiestQuestions(gameId) {
    const games = new Games();
    const game = await games.getGameById(gameId);
    const quizes = new Quizes();
    const quiz = await quizes.findById(game.gameData.gameid);
    const gameStats = await GameStatsService.getGameStats(gameId, quiz);
    const sorted = gameStats.questionStats.sort(
      (a, b) => b.correctCount - a.correctCount,
    );
    return {
      questions: sorted.map((q) => quiz.questions[q.questionIndex]),
      stats: sorted,
    };
  }

  async findGameMostMissAnsweredQuestions(gameId) {
    const games = new Games();
    const game = await games.getGameById(gameId);
    const quizes = new Quizes();
    const quiz = await quizes.findById(game.gameData.gameid);
    const gameStats = await GameStatsService.getGameStats(gameId, quiz);
    const sorted = gameStats.questionStats.sort(
      (a, b) => b.noAnswerCount - a.noAnswerCount,
    );
    return {
      questions: sorted.map((q) => quiz.questions[q.questionIndex]),
      stats: sorted,
    };
  }

  async findGameHardestQuestions(gameId) {
    const games = new Games();
    const game = await games.getGameById(gameId);
    const quizes = new Quizes();
    const quiz = await quizes.findById(game.gameData.gameid);
    const gameStats = await GameStatsService.getGameStats(gameId, quiz);
    const sorted = gameStats.questionStats.sort(
      (a, b) => b.incorrectCount - a.incorrectCount,
    );
    return {
      questions: sorted.map((q) => quiz.questions[q.questionIndex]),
      stats: sorted,
    };
  }

  async findQuizEasiestQuestions(quizId) {
    // Find the easiest question (maximum correct answers)
    const easiestQuestion = await this.model
      .aggregate([
        { $match: { quizId } },
        { $unwind: "$questionStats" },
        { $sort: { "questionStats.correctCount": -1 } },
      ])
      .exec();

    return easiestQuestion;
  }

  async findQuizHardestQuestions(quizId) {
    // Find the hardest question (maximum incorrect answers)
    const hardestQuestion = await this.model
      .aggregate([
        { $match: { quizId } },
        { $unwind: "$questionStats" },
        { $sort: { "questionStats.incorrectCount": -1 } },
      ])
      .exec();

    return hardestQuestion;
  }

  async findQuizMostNoAnswerQuestions(quizId) {
    // Find the hardest question (maximum incorrect answers)
    const mostNoAnswerQuestions = await this.model
      .aggregate([
        { $match: { quizId } },
        { $unwind: "$questionStats" },
        { $sort: { "questionStats.noAnswerCount": -1 } },
      ])
      .exec();

    return mostNoAnswerQuestions;
  }
}

module.exports = GameStatsService;
