const hostJoinGameHandler = async (
  socket,
  io,
  data,
  utilities,
  games,
  players,
) => {
  try {
    const oldHostId = data.id;
    console.log("hostJoinGame oldHostId", oldHostId);
    const game = await games.getGame(oldHostId);
    console.log("hostJoinGame game found", game);

    if (game) {
      game.hostId = socket.id;
      socket.join(game.pin);

      // Update player hostIds
      const playersInGame = await players.getPlayers(oldHostId);
      for await (let player of playersInGame) {
        player.hostId = socket.id;
        player.markModified("hostId");
        await player.save();
      }

      await utilities.emitGameQuestions(game.gameData.gameid, socket);
      io.to(game.pin).emit("gameStartedPlayer");
      game.gameData.questionLive = true;

      game.markModified("gameData");
      await game.save();
    } else {
      socket.emit("noGameFound");
    }
  } catch (err) {
    console.log("ERROR WHILE LAUNCHING THE GAME", err);
  }
};

module.exports = hostJoinGameHandler;
