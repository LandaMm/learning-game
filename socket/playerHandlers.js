module.exports = (io) => {
  return {
    playerJoin: (socket, params, games, players) => {
      console.log("1. playerJoin params", params);
      console.log("2. playerJoin games.games", games.games);
      const game = games.games.find((g) => g.pin.toString() === params.pin);
      console.log("3. playerJoin game", game);

      if (game) {
        console.log("4. Player connected to game");
        players.addPlayer(game.hostId, socket.id, params.name, {
          score: 0,
          answer: 0,
        });

        //socket.join(params.pin);
        socket.join(params.pin, () => {
          let rooms = Object.keys(socket.rooms);
          console.log("Socket", socket.id, "joined rooms:", rooms);
        });

        const playersInGame = players.getPlayers(game.hostId);
        console.log("5. playersInGame", playersInGame);
        console.log("6. params.pin", params.pin);

        io.to(params.pin).emit("updatePlayerLobby", playersInGame);
        //io.emit('updatePlayerLobby', playersInGame);
        //io.emit('sikimiki');
        //io.emit('sikimikitwo', { aaa: "asdsa" });

        console.log("7. Rooms for socket:", Array.from(socket.rooms)); // Adjusted to convert Set to Array

        console.log("8. AllRooms", io.sockets.adapter.rooms);

        const allRoomsSet = new Set(io.sockets.adapter.rooms.keys());

        io.sockets.sockets.forEach((socket) => allRoomsSet.delete(socket.id));

        const allRooms = [...allRoomsSet];

        console.log("10. AllRooms", allRooms);

        const socketsInRoom = io.sockets.adapter.rooms.get(params.pin);
        console.log(`11. Sockets in room ${params.pin}:`, [...socketsInRoom]);

        // Handle socket errors
        socket.on("error", function (err) {
          console.log("Socket.IO Error");
          console.log(err.stack);
        });
      } else {
        socket.emit("noGameFound");
      }
    },

    playerJoinGame: (socket, data, games, players) => {
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
    },

    playerAnswer: async (socket, num, games, players, utilities) => {
      const player = players.getPlayer(socket.id);
      const game = games.getGame(player.hostId);

      if (game && game.gameData.questionLive) {
        const gameData = await utilities.fetchGameDataById(
          game.gameData.gameid,
        );
        if (gameData) {
          utilities.handlePlayerAnswer(player, game, num);
        } else {
          socket.emit("error", "An error occurred fetching game data.");
        }
      }
    },
  };
};
