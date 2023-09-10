const {
  handleHostDisconnect,
  handlePlayerDisconnect,
} = require("../../utilities");

// When a host or player leaves the site
const gameDisconnectHandler = async (socket, io, games, players) => {
  const game = games.getGame(socket.id); //Finding game with socket.id
  //If a game hosted by that id is found, the socket disconnected is a host
  if (game) {
    //Checking to see if host was disconnected or was sent to game view
    handleHostDisconnect(game, io, socket);
  } else {
    //No game has been found, so it is a player socket that has disconnected
    const player = await players.getPlayer(socket.id); //Getting player with socket.id
    //If a player has been found with that id
    if (player) {
      const playerId = socket.id;

      handlePlayerDisconnect(playerId, io, socket);
    }
  }
};

module.exports = gameDisconnectHandler;
