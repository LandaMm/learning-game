var socket = io();
var params = jQuery.deparam(window.location.search);

// Ensure connection to server
socket.on('connect', function () {
    console.log("Connected to server.");
    console.log("Connected to server. params", params);
    document.getElementById('players').value = "";

    //Tell server that it is host connection
    socket.emit('host-join', params);
});

socket.on('showGamePin', function (data) {

    console.log("showGamePin", data);

    document.getElementById('gamePinText').innerHTML = data.pin;
});

socket.on('sikimiki', function (data) {
    console.log("sikimiki");
});

socket.on('updatePlayerLobby', function (data) {
    alert("HIT")
    console.log("updatePlayerLobby");
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
    console.log('Game Started!');
    window.location.href = "/host/game/" + "?id=" + id;
});

socket.on('noGameFound', function () {
    window.location.href = '../../';//Redirect user to 'join game' page
});

// Handle socket errors
socket.on('error', function (err) {
    console.log("Socket.IO Error");
    console.log(err.stack);  // this is shown in the browser console
});
