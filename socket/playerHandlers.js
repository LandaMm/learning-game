module.exports = (io) => {
    return {
        playerJoin: (socket, params, games, players) => {

            console.log("1. playerJoin params", params);
            console.log("2. playerJoin games.games", games.games);
            const game = games.games.find(g => g.pin.toString() === params.pin);

            console.log("3. playerJoin game", game);

            if (game) {
                console.log('4. Player connected to game');
                players.addPlayer(game.hostId, socket.id, params.name, { score: 0, answer: 0 });



                socket.join(params.pin);
                const playersInGame = players.getPlayers(game.hostId);

                console.log('5. playersInGame', playersInGame);
                console.log('6. params.pin', params.pin);

                // ovo nece da radi tj, socket.on('updatePlayerLobby', function (data) { nece da se okine
                io.sockets.to(params.pin).emit('updatePlayerLobby', playersInGame);
                // io.to(params.pin).emit('updatePlayerLobby', "KKKKK"); old code
                io.emit('sikimiki');
                socket.emit('sikimikitwo', playersInGame);



                console.log("7. Rooms for socket:", socket.rooms); // Will show rooms this socket is in
                console.log("8. AllRooms", io.sockets.adapter.rooms);

                const allRoomsSet = new Set(io.sockets.adapter.rooms.keys());

                io.sockets.sockets.forEach((socket) => allRoomsSet.delete(socket.id));

                const allRooms = [...allRoomsSet];

                console.log("10. AllRooms", allRooms);

                const socketsInRoom = io.sockets.adapter.rooms.get(params.pin);

                console.log(`11. Sockets in room ${params.pin}:`, [...socketsInRoom])

                // Handle socket errors
                socket.on('error', function (err) {
                    console.log("Socket.IO Error");
                    console.log(err.stack);
                });


            } else {
                socket.emit('noGameFound');
            }
        },
        playerJoinGame: (socket, data) => {
            // logic for 'player-join-game' event
        },
        // playerAnswer: async (socket, num) => {
        //     // logic for 'playerAnswer' event
        // },
        // // ... add other player related handlers
    };
};
