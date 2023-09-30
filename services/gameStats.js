const GameStats = require("../DB/models/gameStats"); // Import the gameStats model

class GameStatsService {
  // Function for creating or retrieving game statistics
  static async getGameStats(gameId) {
    let gameStats = await GameStats.findOne({ gameId });

    if (!gameStats) {
      // If game statistics do not exist, create a new one
      gameStats = new GameStats({
        gameId,
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
}

module.exports = GameStatsService;
