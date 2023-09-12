const { Games } = require("../services/games");
const { Players } = require("../services/players");
const Quizes = require("../services/quiz");
const games = new Games();
const players = new Players();
const quizes = new Quizes();

// Insert a new game
const insertNewQuizz = async (gameData) => {
  if (!gameData.name || !gameData.questions?.length) return null;
  try {
    return await quizes.addQuiz({
      name: gameData.name,
      questions: gameData.questions,
    });
  } catch (err) {
    console.error("Error inserting new game data:", err);
    return null;
  }
};

// Fetch game data by ID
const findAll = async () => {
  try {
    return await games.findAll();
  } catch (err) {
    console.error("Error fetching game data:", err);
    // FIXME: figure out something with that
    // socket.emit("error", "An error occurred fetching game data.");
    return null;
  }
};
// Fetch game data by ID
const fetchGameDataById = async (id) => {
  try {
    return await quizes.findById(id);
  } catch (err) {
    console.error("Error fetching game data:", err);
    // FIXME: figure out something with that
    // socket.emit("error", "An error occurred fetching game data.");
    return null;
  }
};

// Helper functions
const handleHostDisconnect = async (game, io, socket) => {
  if (!game.gameLive) {
    games.removeGame(game.hostId);
    console.log("Game ended with pin:", game.pin);

    const playersToRemove = await players.getPlayers(game.hostId);
    playersToRemove.forEach((p) => players.removePlayer(p.playerId));

    io.to(game.pin).emit("hostDisconnect");
    socket.leave(game.pin);
  }
};

const handlePlayerDisconnect = async (playerId, io, socket) => {
  const player = await players.getPlayer(playerId);
  if (player) {
    const game = games.getGame(player.hostId);
    if (game && !game.gameLive) {
      players.removePlayer(playerId);
      const playersInGame = await players.getPlayers(game.hostId);
      io.to(game.pin).emit("updatePlayerLobby", playersInGame);
      socket.leave(game.pin);
    }
  }
};

async function handlePlayerAnswer(player, game, num, socket, io) {
  player.gameData.answer = num;
  game.gameData.playersAnswered++;

  player.markModified("gameData");
  game.markModified("gameData");

  await player.save();
  await game.save();

  const gameQuestion = game.gameData.question;

  try {
    const gameData = await fetchGameDataById(game.gameData.gameid);
    if (!gameData) return;
    const correctAnswer = gameData.questions[gameQuestion - 1].correct;

    if (num == correctAnswer) {
      player.gameData.score += 100;
      player.markModified("gameData");
      await player.save();
      io.to(game.pin).emit("getTime", socket.id);
      socket.emit("answerResult", true);
    }

    const playersInGame = await players.getPlayers(game.hostId);

    if (game.gameData.playersAnswered == playersInGame.length) {
      game.gameData.questionLive = false;
      game.markModified("gameData");
      await game.save();
      io.to(game.pin).emit("questionOver", playersInGame, correctAnswer);
    } else {
      io.to(game.pin).emit("updatePlayersAnswered", {
        playersAnswered: game.gameData.playersAnswered,
        playersInGame,
      });
    }
  } catch (err) {
    console.error("Error processing player answer:", err);
  }
}

// Emit game questions to the host
const emitGameQuestions = async (gameId, hostId, socket) => {
  try {
    const gameData = await quizes.findById(gameId);

    if (gameData && gameData.questions && gameData.questions.length > 0) {
      const { question, answers, correct } = gameData.questions[0];

      const playersInGame = await players.getPlayers(hostId);

      socket.emit("gameQuestions", {
        q1: question,
        a1: answers[0],
        a2: answers[1],
        a3: answers[2],
        a4: answers[3],
        correct: correct,
        playersInGame: playersInGame.length,
      });
    }
  } catch (err) {
    console.error("Error fetching game questions:", err);
    socket.emit("error", "An error occurred fetching game questions.");
  }
};

module.exports = {
  fetchGameDataById,
  handleHostDisconnect,
  handlePlayerDisconnect,
  handlePlayerAnswer,
  emitGameQuestions,
  findAll,
  insertNewQuizz,
};
