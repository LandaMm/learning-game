const { appLogger } = require("../../../logger");

const playerJoinHandler = async (socket, io, params, games, players) => {
  appLogger.info("1. playerJoin params", params);
  appLogger.info("2. playerJoin games", games);
  const game = await games.getGameByPin(params.pin);
  appLogger.info("3. playerJoin game", game);

  if (game) {
    appLogger.info("4. Player connected to game");
    await players.addPlayer(game.hostId, socket.id, params.name, {
      score: 0,
      answer: 0,
    });

    //socket.join(params.pin);
    socket.join(params.pin, () => {
      let rooms = Object.keys(socket.rooms);
      appLogger.info("Socket", socket.id, "joined rooms:", rooms);
    });

    const playersInGame = await players.getPlayers(game.hostId);
    appLogger.info("5. playersInGame", playersInGame);
    appLogger.info("6. params.pin", params.pin);

    io.to(params.pin).emit("updatePlayerLobby", playersInGame);
    io.to(game.hostId).emit("updatePlayerLobby", playersInGame);
    //io.emit('updatePlayerLobby', playersInGame);
    //io.emit('sikimiki');
    //io.emit('sikimikitwo', { aaa: "asdsa" });

    appLogger.info("7. Rooms for socket:", Array.from(socket.rooms)); // Adjusted to convert Set to Array

    appLogger.info("8. AllRooms", io.sockets.adapter.rooms);

    const allRoomsSet = new Set(io.sockets.adapter.rooms.keys());

    io.sockets.sockets.forEach((socket) => allRoomsSet.delete(socket.id));

    const allRooms = [...allRoomsSet];

    appLogger.info("10. AllRooms", allRooms);

    const socketsInRoom = io.sockets.adapter.rooms.get(params.pin);
    appLogger.info(`11. Sockets in room ${params.pin}:`, [...socketsInRoom]);

    // Handle socket errors
    socket.on("error", function (err) {
      appLogger.info("Socket.IO Error");
      err.stack;
    });
  } else {
    socket.emit("noGameFound");
  }
};

module.exports = playerJoinHandler;
