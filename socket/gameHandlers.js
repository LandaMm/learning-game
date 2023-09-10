module.exports = (socket) => {
  return {
    requestDbNames: async (utilities) => {
      try {
        const gamesList = await utilities.findAll();
        console.log("gamesList", gamesList);
        socket.emit("gameNamesData", gamesList);
      } catch (err) {
        console.error("Error fetching game names:", err);
        socket.emit("error", "An error occurred fetching game names.");
      }
    },

    // When a host or player leaves the site
    disconnect: async (socket, games, players) => {
      var game = games.getGame(socket.id); //Finding game with socket.id
      //If a game hosted by that id is found, the socket disconnected is a host
      if (game) {
        //Checking to see if host was disconnected or was sent to game view
        if (game.gameLive == false) {
          games.removeGame(socket.id); //Remove the game from games class
          console.log("Game ended with pin:", game.pin);

          var playersToRemove = players.getPlayers(game.hostId); //Getting all players in the game

          //For each player in the game
          for (var i = 0; i < playersToRemove.length; i++) {
            players.removePlayer(playersToRemove[i].playerId); //Removing each player from player class
          }

          io.to(game.pin).emit("hostDisconnect"); //Send player back to 'join' screen
          socket.leave(game.pin); //Socket is leaving room
        }
      } else {
        //No game has been found, so it is a player socket that has disconnected
        var player = players.getPlayer(socket.id); //Getting player with socket.id
        //If a player has been found with that id
        if (player) {
          var hostId = player.hostId; //Gets id of host of the game
          var game = games.getGame(hostId); //Gets game data with hostId
          var pin = game.pin; //Gets the pin of the game

          if (game.gameLive == false) {
            players.removePlayer(socket.id); //Removes player from players class
            var playersInGame = players.getPlayers(hostId); //Gets remaining players in game

            io.to(pin).emit("updatePlayerLobby", playersInGame); //Sends data to host to update screen
            socket.leave(pin); //Player is leaving the room
          }
        }
      }
    },

    // Sets data in player class to answer from player
    playerAnswer: async (socket, num, games, players, utilities) => {
      var player = players.getPlayer(socket.id);
      var hostId = player.hostId;
      var playerNum = players.getPlayers(hostId);
      var game = games.getGame(hostId);

      if (game.gameData.questionLive == true) {
        //if the question is still live
        player.gameData.answer = num;
        game.gameData.playersAnswered += 1;

        var gameQuestion = game.gameData.question;
        var gameid = game.gameData.gameid;

        try {
          const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

          var correctAnswer = gameData.questions[gameQuestion - 1].correct;

          // Checks player answer with correct answer
          if (num == correctAnswer) {
            player.gameData.score += 100;
            io.to(game.pin).emit("getTime", socket.id);
            socket.emit("answerResult", true);
          }

          // Checks if all players answered
          if (game.gameData.playersAnswered == playerNum.length) {
            game.gameData.questionLive = false; // Question has been ended bc players all answered under time
            var playerData = players.getPlayers(game.hostId);
            io.to(game.pin).emit("questionOver", playerData, correctAnswer); // Tell everyone that question is over
          } else {
            // update host screen of num players answered
            io.to(game.pin).emit("updatePlayersAnswered", {
              playersInGame: playerNum.length,
              playersAnswered: game.gameData.playersAnswered,
            });
          }
        } catch (err) {
          console.error("Error fetching game data:", err);
          socket.emit("error", "An error occurred fetching game data.");
        }
      }
    },

    getScore: async (socket, players) => {
      var player = players.getPlayer(socket.id);
      socket.emit("newScore", player.gameData.score);
    },

    time: async (players) => {
      var time = data.time / 20;
      time = time * 100;
      var playerid = data.player;
      var player = players.getPlayer(playerid);
      player.gameData.score += time;
    },

    timeUp: async (games, players, utilities) => {
      var game = games.getGame(socket.id);
      game.gameData.questionLive = false;
      var playerData = players.getPlayers(game.hostId);

      var gameQuestion = game.gameData.question;
      var gameid = game.gameData.gameid;

      try {
        const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

        var correctAnswer = gameData.questions[gameQuestion - 1].correct;
        io.to(game.pin).emit("questionOver", playerData, correctAnswer);
      } catch (err) {
        console.error("Error fetching game data:", err);
        socket.emit("error", "An error occurred fetching game data.");
      }
    },

    nextQuestion: async (games, players, utilities) => {
      var playerData = players.getPlayers(socket.id);

      // Reset players current answer to 0
      for (let player of players.players) {
        if (player.hostId == socket.id) {
          player.gameData.answer = 0;
        }
      }

      var game = games.getGame(socket.id);
      game.gameData.playersAnswered = 0;
      game.gameData.questionLive = true;
      game.gameData.question += 1;
      var gameid = game.gameData.gameid;

      try {
        const gameData = await utilities.fetchGameDataById(gameid); // Using utilities to fetch data

        if (gameData.questions.length >= game.gameData.question) {
          const currentQuestion =
            gameData.questions[game.gameData.question - 1];

          socket.emit("gameQuestions", {
            q1: currentQuestion.question,
            a1: currentQuestion.answers[0],
            a2: currentQuestion.answers[1],
            a3: currentQuestion.answers[2],
            a4: currentQuestion.answers[3],
            correct: currentQuestion.correct,
            playersInGame: playerData.length,
          });
        } else {
          const playersInGame = players.getPlayers(game.hostId);
          const leaderboard = playersInGame
            .sort((a, b) => b.gameData.score - a.gameData.score)
            .slice(0, 5)
            .map((p) => ({ name: p.name, score: p.gameData.score }));

          io.to(game.pin).emit("GameOver", {
            num1: leaderboard[0]?.name || "",
            num2: leaderboard[1]?.name || "",
            num3: leaderboard[2]?.name || "",
            num4: leaderboard[3]?.name || "",
            num5: leaderboard[4]?.name || "",
          });
        }
      } catch (err) {
        console.error("Error fetching game data:", err);
        socket.emit("error", "An error occurred fetching game data.");
      }

      io.to(game.pin).emit("nextQuestionPlayer");
    },

    //When the host starts the game
    startGame: async (socket, games) => {
      var game = games.getGame(socket.id); //Get the game based on socket.id
      game.gameLive = true;
      socket.emit("gameStarted", game.hostId); //Tell player and host that game has started
    },

    newQuiz: async (socket, utilities) => {
      try {
        const allGames = await utilities.findAll();

        if (!allGames) {
          socket.emit("error", "An error occurred fetching all game data.");
          return;
        }

        const numGames = allGames.length;

        // Adjusting the game ID logic
        const gameId = numGames === 0 ? 1 : allGames[numGames - 1].id + 1;
        data.id = gameId;

        // Inserting the new game data
        await utilities.insertNewGame(data);

        socket.emit("startGameFromCreator", gameId);
      } catch (err) {
        console.error("Error in newQuiz function:", err);
        socket.emit("error", "An error occurred during the newQuiz operation.");
      }
    },
  };
};
