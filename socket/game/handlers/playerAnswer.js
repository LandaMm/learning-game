// Sets data in player class to answer from player
const playerAnswerHandler = async (
  socket,
  io,
  num,
  games,
  players,
  utilities,
) => {
  var player = players.getPlayer(socket.id);
  var hostId = player.hostId;
  var playerNum = players.getPlayers(hostId);
  var game = games.getGame(hostId);

  if (game.gameData.questionLive == true) {
    //if the question is still live
    player.gameData.answer = num;
    game.gameData.playersAnswered += 1;

    var gameQuestion = game.gameData.question;
    var gameid = game.gameData.gameid;

    try {
      const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

      var correctAnswer = gameData.questions[gameQuestion - 1].correct;

      // Checks player answer with correct answer
      if (num == correctAnswer) {
        player.gameData.score += 100;
        io.to(game.pin).emit("getTime", socket.id);
        socket.emit("answerResult", true);
      }

      // Checks if all players answered
      if (game.gameData.playersAnswered == playerNum.length) {
        game.gameData.questionLive = false; // Question has been ended bc players all answered under time
        var playerData = players.getPlayers(game.hostId);
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
