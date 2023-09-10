const timeHandler = async (players, data) => {
  var time = data.time / 20;
  time = time * 100;
  var playerid = data.player;
  var player = players.getPlayer(playerid);
  player.gameData.score += time;
};

module.exports = timeHandler;
