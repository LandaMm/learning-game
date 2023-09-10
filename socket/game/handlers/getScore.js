const getScoreHandler = async (socket, players) => {
  var player = await players.getPlayer(socket.id);
  socket.emit("newScore", player.gameData.score);
};

module.exports = getScoreHandler;
