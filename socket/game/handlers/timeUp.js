const timeUpHandler = async (socket, io, games, players, utilities) => {
  var game = games.getGame(socket.id);
  game.gameData.questionLive = false;
  var playerData = await players.getPlayers(game.hostId);

  var gameQuestion = game.gameData.question;
  var gameid = game.gameData.gameid;

  try {
    const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

    var correctAnswer = gameData.questions[gameQuestion - 1].correct;
    io.to(game.pin).emit("questionOver", playerData, correctAnswer);
  } catch (err) {
    console.error("Error fetching game data:", err);
    socket.emit("error", "An error occurred fetching game data.");
  }
};

module.exports = timeUpHandler;
