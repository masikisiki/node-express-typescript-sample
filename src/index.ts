import express, { } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import path from 'path';

const { v4: uuidV4 } = require("uuid");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use('/public', express.static('public'));

app.get('/', (_, res) => {
    const filePath = path.join(__dirname, "../public", 'index.html');
    res.sendFile(filePath);
});

app.get('/createroom', (_, res) => {
    res.redirect(`/room/${uuidV4()}`)
});

app.get('/room/:id', (req, res) => {
    res.json({ roomId: req.params.id });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomid) => {
        console.log("user join room  " + roomid);
        socket.join(roomid);
        socket.to(roomid).emit("user-joined", roomid);

    })
    socket.on('send-message', (payload: any) => {
        console.log(`Sending ${payload.type} message to ${payload.roomid}`)
        if (payload.roomid) {
            socket.broadcast.to(payload.roomid).emit('message', payload);
        } else
            socket.broadcast.emit('message', payload);
    });
});

httpServer.listen(4321);
