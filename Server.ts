import * as http from 'http';
import { Server, Socket } from "socket.io";

const httpServer = http.createServer();
const io = new Server(httpServer, {
    // ...
});
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (data) => {

        console.log(data['event']);
        console.log(data['data'][0]);


        socket.emit('message', `Echo: ${data}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

httpServer.listen(3000);
