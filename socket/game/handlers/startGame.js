//When the host starts the game
const startGameHandler = async (socket, games) => {
  var game = await games.getGame(socket.id); //Get the game based on socket.id
  game.gameLive = true;
  socket.emit("gameStarted", game.hostId); //Tell player and host that game has started
};

module.exports = startGameHandler;
