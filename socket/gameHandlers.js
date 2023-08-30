module.exports = (socket) => {
    return {
        nextQuestion: async (socket) => {
            // logic for 'nextQuestion' event
        },
        timeUp: async (socket) => {
            // logic for 'timeUp' event
        },
        requestDbNames: async (utilities) => {
            try {
                const gamesList = await utilities.findAll();
                console.log("gamesList", gamesList);
                socket.emit('gameNamesData', gamesList);
            } catch (err) {
                console.error("Error fetching game names:", err);
                socket.emit('error', 'An error occurred fetching game names.');
            }
        },
    };
};