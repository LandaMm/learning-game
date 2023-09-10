const hostJoinGameHandler = async (socket, data, utilities) => {
  const oldHostId = data.id;
  console.log("hostJoinGame oldHostId", oldHostId);
  const game = games.getGame(oldHostId);

  if (game) {
    game.hostId = socket.id;
    socket.join(game.pin);

    // Update player hostIds
    for (let player of Object.values(players.players)) {
      if (player.hostId === oldHostId) {
        player.hostId = socket.id;
      }
    }

    await utilities.emitGameQuestions(game.gameData.gameid);
    io.to(game.pin).emit("gameStartedPlayer");
    game.gameData.questionLive = true;
  } else {
    socket.emit("noGameFound");
  }
};

module.exports = hostJoinGameHandler;
