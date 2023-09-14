const nextQuestionHandler = async (socket, io, games, players, utilities) => {
  var playerData = await players.getPlayers(socket.id);

  console.log(playerData);

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
  game.gameData.playersAnswered = 0;
  game.gameData.questionLive = true;
  game.gameData.question += 1;
  game.markModified("gameData");
  await game.save();
  var gameid = game.gameData.gameid;

  try {
    const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

    if (gameData.questions.length >= game.gameData.question) {
      const currentQuestion = gameData.questions[game.gameData.question - 1];

      socket.emit("gameQuestions", {
        q1: currentQuestion.question,
        a1: currentQuestion.answers[0],
        a2: currentQuestion.answers[1],
        a3: currentQuestion.answers[2],
        a4: currentQuestion.answers[3],
        correct: currentQuestion.correct,
        playersInGame: playerData.length,
      });
    } else {
      const playersInGame = await players.getPlayers(game.hostId);
      const leaderboard = playersInGame
        .sort((a, b) => b.gameData.score - a.gameData.score)
        .slice(0, 5)
        .map((p) => ({ name: p.name, score: p.gameData.score }));

      console.log("emitting game over event");
      console.log(
        "player ids",
        playersInGame.map((p) => p.playerId),
      );
      console.log(io.sockets.adapter.rooms);
      io.to(game.pin).emit("GameOver", {
        num1: leaderboard[0]?.name || "",
        num2: leaderboard[1]?.name || "",
        num3: leaderboard[2]?.name || "",
        num4: leaderboard[3]?.name || "",
        num5: leaderboard[4]?.name || "",
      });
    }
  } catch (err) {
    console.error("Error fetching game data:", err);
    socket.emit("error", "An error occurred fetching game data.");
  } finally {
    io.to(game.pin).emit("nextQuestionPlayer");
  }
};

module.exports = nextQuestionHandler;
