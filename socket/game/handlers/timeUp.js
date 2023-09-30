const GameStatsService = require("../../../services/gameStats"); // Импорт класса GameStatsService

const timeUpHandler = async (socket, io, games, players, utilities) => {
  var game = await games.getGame(socket.id);
  if (!game) {
    return;
  }

  var gameQuestion = game.gameData.question;
  var gameid = game.gameData.gameid;

  try {
    const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

    var correctAnswer = gameData.questions[gameQuestion - 1].correct;

    // Calculate the number of players who did not answer
    const playerData = await players.getPlayers(game.hostId);
    const totalPlayers = playerData.length;
    const playersWhoAnswered = game.gameData.playersAnswered;
    const playersWhoDidNotAnswer = totalPlayers - playersWhoAnswered;

    // Get or create game statistics
    const gameStats = await GameStatsService.getGameStats(game.id);

    // Update question statistics based on players who did not answer
    await GameStatsService.updateQuestionStats(
      gameStats,
      gameQuestion,
      false, // Indicates that the answer was not correct since they did not answer
    );

    // Update noAnswerCount in question statistics
    const questionStatsIndex = gameStats.questionStats.findIndex(
      (qs) => qs.questionIndex === gameQuestion,
    );

    if (questionStatsIndex !== -1) {
      gameStats.questionStats[questionStatsIndex].noAnswerCount =
        playersWhoDidNotAnswer;
      await gameStats.save();
    }

    game.gameData.questionLive = false;
    game.markModified("gameData");
    await game.save();

    io.to(game.pin).emit("questionOver", playerData, correctAnswer);
  } catch (err) {
    console.error("Error fetching game data:", err);
    socket.emit("error", "An error occurred fetching game data.");
  }
};

module.exports = timeUpHandler;
