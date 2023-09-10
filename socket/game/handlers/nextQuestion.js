const nextQuestionHandler = async (socket, io, games, players, utilities) => {
  var playerData = await players.getPlayers(socket.id);

  // Reset players current answer to 0
  for (let player of players.players) {
    if (player.hostId == socket.id) {
      player.gameData.answer = 0;
    }
  }

  var game = games.getGame(socket.id);
  game.gameData.playersAnswered = 0;
  game.gameData.questionLive = true;
  game.gameData.question += 1;
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
  }

  io.to(game.pin).emit("nextQuestionPlayer");
};

module.exports = nextQuestionHandler;
