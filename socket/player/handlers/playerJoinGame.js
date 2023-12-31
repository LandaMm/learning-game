const playerJoinGameHandler = async (socket, data, games, players) => {
  const player = await players.getPlayer(data.id);
  if (player) {
    const game = await games.getGame(player.hostId);
    socket.join(game.pin);
    player.playerId = socket.id; // Update player id with socket id

    player.markModified("playerId");

    await player.save();

    const playerData = await players.getPlayers(game.hostId);
    socket.emit("playerGameData", playerData);
  } else {
    socket.emit("noGameFound"); // No player found
  }
};

module.exports = playerJoinGameHandler;
