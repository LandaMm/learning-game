const mongoose = require('mongoose');

const KahootGameSchema = new mongoose.Schema({
    id: Number,
});

const KahootGame = mongoose.model('kahootGames', KahootGameSchema);

module.exports = KahootGame;
