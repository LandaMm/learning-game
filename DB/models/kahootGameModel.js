const mongoose = require('mongoose');

const KahootGameSchema = new mongoose.Schema({
    id: Number,
});

const KahootGame = mongoose.model('kahootgames', KahootGameSchema);

module.exports = KahootGame;
