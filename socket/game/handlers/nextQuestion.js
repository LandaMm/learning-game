const { appLogger } = require("../../../logger");

const nextQuestionHandler = async (
  socket,
  io,
  games,
  players,
  utilities,
  questionIndex,
) => {
  var playerData = await players.getPlayers(socket.id);

  appLogger.info(playerData);

  // Reset players current answer to 0
  for await (let player of playerData) {
    if (player.hostId == socket.id) {
      player.gameData.answer = 0;
      player.markModified("gameData");
      await player.save();
    }
  }

  var game = await games.getGame(socket.id);
  if (!game) {
    socket.emit("noGameFound");
    return;
  }
  if (game.gameData.question < questionIndex + 1) {
    game.gameData.playersAnswered = 0;
    game.gameData.questionLive = true;
    game.gameData.question += 1;
    game.markModified("gameData");
    await game.save();
  }
  var gameid = game.gameData.gameid;

  try {
    const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

    if (gameData.questions.length >= game.gameData.question) {
      const currentQuestion = gameData.questions[game.gameData.question - 1];
      appLogger.info("currentQuestion", currentQuestion);

      socket.emit("gameQuestions", {
        q1: currentQuestion.title,
        a1: currentQuestion.answers[0],
        a2: currentQuestion.answers[1],
        a3: currentQuestion.answers[2],
        a4: currentQuestion.answers[3],
        correct: currentQuestion.correct,
        playersInGame: playerData.length,
        questions: gameData.questions.length,
      });
    } else {
      const playersInGame = await players.getPlayers(game.hostId);
      const leaderboard = playersInGame
        .sort((a, b) => b.gameData.score - a.gameData.score)
        .map((p) => ({ name: p.name, score: p.gameData.score }));

      appLogger.info("emitting game over event");
      appLogger.info(
        "player ids",
        playersInGame.map((p) => p.playerId),
      );
      appLogger.info(io.sockets.adapter.rooms);
      io.to(game.pin).emit("GameOver", leaderboard);
      // const result = await players.removePlayersByHostId(game.hostId);
      // appLogger.info("deleted all game's players", result);
      const gameFinishResult = await games.finishGame(game.hostId);
      appLogger.info("finished game by host id", gameFinishResult);
    }
  } catch (err) {
    console.error("Error fetching game data:", err);
    socket.emit("error", "An error occurred fetching game data.");
  } finally {
    io.to(game.pin).emit("nextQuestionPlayer");
  }
};

module.exports = nextQuestionHandler;
