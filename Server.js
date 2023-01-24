"use strict";
exports.__esModule = true;
var http = require("http");
var socket_io_1 = require("socket.io");
var httpServer = http.createServer();
var io = new socket_io_1.Server(httpServer, {
// ...
});
io.on('connection', function (socket) {
    console.log('A user connected');
    socket.on('message', function (data) {
        console.log(data['event']);
        console.log(data['data'][0]);
        socket.emit('message', "Echo: ".concat(data));
    });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});
httpServer.listen(3000);
