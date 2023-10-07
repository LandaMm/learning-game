const { appLogger } = require("../../../logger");
const GameStatsService = require("../../../services/gameStats"); // Импорт класса GameStatsService

// Handles the player's answer to a question
const playerAnswerHandler = async (socket, io, num, games, players, quizes) => {
  appLogger.info("player answer. socket.id", socket.id);
  var player = await players.getPlayer(socket.id);
  var hostId = player.hostId;
  var playerNum = await players.getPlayers(hostId);
  var game = await games.getGame(hostId);

  appLogger.info("player answer->game", game);

  if (game.gameData.questionLive == true) {
    // If the question is still live
    player.gameData.answer = num;
    game.gameData.playersAnswered += 1;

    player.markModified("gameData");
    game.markModified("gameData");

    await player.save();
    await game.save();

    var gameQuestion = game.gameData.question;
    var gameid = game.gameData.gameid;

    try {
      const gameData = await quizes.findById(gameid); // Using utilities to fetch data

      var correctAnswer = gameData.questions[gameQuestion - 1].correct;
      const weight = gameData.questions[gameQuestion - 1].weight || 100;

      // Check player's answer with the correct answer
      if (num == correctAnswer) {
        player.gameData.score += weight;
        player.markModified("gameData");
        await player.save();
        io.to(game.pin).emit("getTime", socket.id);
        socket.emit("answerResult", true);
      }

      // Get or create game statistics
      const gameStats = await GameStatsService.getGameStats(game.id, gameData);

      // Update question statistics based on player's answer
      await GameStatsService.updateQuestionStats(
        gameStats,
        gameQuestion,
        num == correctAnswer,
      );

      // Check if all players answered
      if (game.gameData.playersAnswered == playerNum.length) {
        game.gameData.questionLive = false; // Question has been ended because all players answered under time
        game.markModified("gameData");
        await game.save();
        var playerData = await players.getPlayers(game.hostId);
        io.to(game.pin).emit("questionOver", playerData, correctAnswer); // Tell everyone that the question is over
      } else {
        // Update host screen with the number of players who answered
        io.to(game.pin).emit("updatePlayersAnswered", {
          playersInGame: playerNum.length,
          playersAnswered: game.gameData.playersAnswered,
        });
      }
    } catch (err) {
      console.error("Error fetching game data:", err);
      socket.emit("error", "An error occurred fetching game data.");
    }
  }
};

module.exports = playerAnswerHandler;
