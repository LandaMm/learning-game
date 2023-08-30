module.exports = (io, KahootGame) => {
    io.on('connection', (socket) => {
        // Give user game names data
        socket.on('requestDbNames', async () => {
            console.log("started");
            try {
                const games = await KahootGame.find();
                console.log("games", games);
                socket.emit('gameNamesData', games);
            } catch (err) {
                console.error(err);
                socket.emit('error', 'An error occurred fetching game names.');
            }
        });
    });
}
