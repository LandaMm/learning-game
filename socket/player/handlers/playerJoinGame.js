const playerJoinGameHandler = (socket, data, games, players) => {
  const player = players.getPlayer(data.id);
  if (player) {
    const game = games.getGame(player.hostId);
    socket.join(game.pin);
    player.playerId = socket.id; // Update player id with socket id

    const playerData = players.getPlayers(game.hostId);
    socket.emit("playerGameData", playerData);
  } else {
    socket.emit("noGameFound"); // No player found
  }
};

module.exports = playerJoinGameHandler;
