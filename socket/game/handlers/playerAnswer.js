// Sets data in player class to answer from player
const playerAnswerHandler = async (socket, io, num, games, players, quizes) => {
  console.log("player answer. socket.id", socket.id);
  var player = await players.getPlayer(socket.id);
  var hostId = player.hostId;
  var playerNum = await players.getPlayers(hostId);
  var game = await games.getGame(hostId);

  console.log("player answer->game", game);

  if (game.gameData.questionLive == true) {
    //if the question is still live
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

      // Checks player answer with correct answer
      if (num == correctAnswer) {
        player.gameData.score += 100;
        player.markModified("gameData");
        await player.save();
        io.to(game.pin).emit("getTime", socket.id);
        socket.emit("answerResult", true);
      }

      // Checks if all players answered
      if (game.gameData.playersAnswered == playerNum.length) {
        game.gameData.questionLive = false; // Question has been ended bc players all answered under time
        game.markModified("gameData");
        await game.save();
        var playerData = await players.getPlayers(game.hostId);
        io.to(game.pin).emit("questionOver", playerData, correctAnswer); // Tell everyone that question is over
      } else {
        // update host screen of num players answered
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
