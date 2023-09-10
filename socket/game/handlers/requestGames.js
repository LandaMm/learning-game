const requestGamesHandler = async (socket, utilities) => {
  try {
    const gamesList = await utilities.findAll();
    console.log("gamesList", gamesList);
    socket.emit("gameNamesData", gamesList);
  } catch (err) {
    console.error("Error fetching game names:", err);
    socket.emit("error", "An error occurred fetching game names.");
  }
};

module.exports = requestGamesHandler;
