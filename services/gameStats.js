const { default: mongoose } = require("mongoose");
const GameStats = require("../DB/models/gameStats"); // Import the gameStats model
const { appLogger } = require("../logger");
const { Games } = require("./games");
const Quizes = require("./quiz");

const quizes = new Quizes();

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
    appLogger.info("game stats easiest", gameStats);
    const grouped = gameStats.questionStats.reduce((res, item) => {
      const copy = [...res];
      const index = copy.findIndex(
        (el) => el.questionIndex === item.questionIndex,
      );
      if (index !== -1) {
        copy[index].correctCount += item.correctCount;
        copy[index].incorrectCount += item.incorrectCount;
        copy[index].noAnswerCount += item.noAnswerCount;
      } else {
        copy.push(item);
      }
      return copy;
    }, []);
    const sorted = grouped.sort((a, b) => b.correctCount - a.correctCount);
    appLogger.info("sorted", sorted);
    return {
      questions: sorted.map((q) => quiz.questions[q.questionIndex - 1]),
      stats: sorted,
    };
  }

  async findGameMostMissAnsweredQuestions(gameId) {
    const games = new Games();
    const game = await games.getGameById(gameId);
    const quizes = new Quizes();
    const quiz = await quizes.findById(game.gameData.gameid);
    const gameStats = await GameStatsService.getGameStats(gameId, quiz);
    const grouped = gameStats.questionStats.reduce((res, item) => {
      const copy = [...res];
      const index = copy.findIndex(
        (el) => el.questionIndex === item.questionIndex,
      );
      if (index !== -1) {
        copy[index].correctCount += item.correctCount;
        copy[index].incorrectCount += item.incorrectCount;
        copy[index].noAnswerCount += item.noAnswerCount;
      } else {
        copy.push(item);
      }
      return copy;
    }, []);
    const sorted = grouped.sort((a, b) => b.noAnswerCount - a.noAnswerCount);
    return {
      questions: sorted.map((q) => quiz.questions[q.questionIndex - 1]),
      stats: sorted,
    };
  }

  async findGameHardestQuestions(gameId) {
    const games = new Games();
    const game = await games.getGameById(gameId);
    const quizes = new Quizes();
    const quiz = await quizes.findById(game.gameData.gameid);
    const gameStats = await GameStatsService.getGameStats(gameId, quiz);
    const grouped = gameStats.questionStats.reduce((res, item) => {
      const copy = [...res];
      const index = copy.findIndex(
        (el) => el.questionIndex === item.questionIndex,
      );
      if (index !== -1) {
        copy[index].correctCount += item.correctCount;
        copy[index].incorrectCount += item.incorrectCount;
        copy[index].noAnswerCount += item.noAnswerCount;
      } else {
        copy.push(item);
      }
      return copy;
    }, []);
    const sorted = grouped.sort((a, b) => b.incorrectCount - a.incorrectCount);
    return {
      questions: sorted.map((q) => quiz.questions[q.questionIndex - 1]),
      stats: sorted,
    };
  }

  async findQuizEasiestQuestions(quizId) {
    // Find the easiest question (maximum correct answers)
    const easiestQuestion = await GameStats.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $unwind: "$questionStats" },
      { $project: { questionStats: 1, _id: 1 } },
      {
        $group: {
          _id: "$questionStats.questionIndex",
          correct: { $sum: "$questionStats.correctCount" },
          incorrect: { $sum: "$questionStats.incorrectCount" },
          noAnswer: { $sum: "$questionStats.noAnswerCount" },
        },
      },
      { $sort: { correct: -1 } },
    ]).exec();

    appLogger.info("easieasQuestions", easiestQuestion);

    const quiz = await quizes.findById(quizId);

    return easiestQuestion.map((q) => ({
      ...q,
      title: quiz.questions[q._id - 1].title,
    }));
  }

  async findQuizHardestQuestions(quizId) {
    // Find the hardest question (maximum incorrect answers)
    const hardestQuestion = await GameStats.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $unwind: "$questionStats" },
      { $project: { questionStats: 1, _id: 1 } },
      {
        $group: {
          _id: "$questionStats.questionIndex",
          correct: { $sum: "$questionStats.correctCount" },
          incorrect: { $sum: "$questionStats.incorrectCount" },
          noAnswer: { $sum: "$questionStats.noAnswerCount" },
        },
      },
      { $sort: { incorrect: -1 } },
    ]).exec();

    const quiz = await quizes.findById(quizId);

    return hardestQuestion.map((q) => ({
      ...q,
      title: quiz.questions[q._id - 1].title,
    }));
  }

  async findQuizMostNoAnswerQuestions(quizId) {
    // Find the hardest question (maximum incorrect answers)
    const mostNoAnswerQuestions = await GameStats.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $unwind: "$questionStats" },
      { $project: { questionStats: 1, _id: 1 } },
      {
        $group: {
          _id: "$questionStats.questionIndex",
          correct: { $sum: "$questionStats.correctCount" },
          incorrect: { $sum: "$questionStats.incorrectCount" },
          noAnswer: { $sum: "$questionStats.noAnswerCount" },
        },
      },
      { $sort: { noAnswer: -1 } },
    ]).exec();

    const quiz = await quizes.findById(quizId);

    return mostNoAnswerQuestions.map((q) => ({
      ...q,
      title: quiz.questions[q._id - 1].title,
    }));
  }
}

module.exports = GameStatsService;
