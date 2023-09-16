const { appLogger } = require("../../logger");

var socket = io();
var params = jQuery.deparam(window.location.search);

// Ensure connection to server
socket.on('connect', function () {
    appLogger.info("session id", socket.id)
    appLogger.info("Connected to server.");
    appLogger.info("Connected to server. params", params);
    document.getElementById('players').value = "";

    //Tell server that it is host connection
    socket.emit('host-join', params);
});

socket.on('showGamePin', function (data) {

    appLogger.info("showGamePin", data);

    document.getElementById('gamePinText').innerHTML = data.pin;
});

socket.on('sikimiki', function (data) {
    appLogger.info("CLIENT sikimiki", data, Date.now());
});
socket.on('sikimikitwo', function (data) {
    appLogger.info("CLIENT sikimikitwo", data, Date.now());
});

socket.on('updatePlayerLobby', function (data) {
    alert("HIT")
    appLogger.info("updatePlayerLobby");
    document.getElementById('players').value = "";

    for (var i = 0; i < data.length; i++) {
        document.getElementById('players').value += data[i].name + "\n";
    }
});

function startGame() {
    socket.emit('startGame');
}

function endGame() {
    window.location.href = "/";
}

socket.on('gameStarted', function (id) {
    appLogger.info('Game Started!');
    window.location.href = "/host/game/" + "?id=" + id;
});

socket.on('noGameFound', function () {
    window.location.href = '../../';//Redirect user to 'join game' page
});

// Handle socket errors
socket.on('error', function (err) {
    appLogger.info("Socket.IO Error");
    appLogger.info(err.stack);  // this is shown in the browser console
});
