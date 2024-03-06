const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 사용자 목록을 저장할 배열
let users = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // 사용자가 채팅에 참여할 때 사용자 목록에 추가하고 다른 사용자들에게 입장 메시지 전송
    socket.on('join', (username) => {
        users.push({
            id: socket.id,
            username: username
        });

        io.emit('user joined', username);
        io.emit('user list', users.map(user => user.username));
    });

    // 사용자가 채팅 메시지를 보낼 때
    socket.on('chat message', (msg) => {
        const user = users.find(u => u.id === socket.id);
        io.emit('chat message', { username: user.username, message: msg });
    });

    // 사용자가 채팅을 종료할 때
    socket.on('disconnect', () => {
        const user = users.find(u => u.id === socket.id);
        if (user) {
            users = users.filter(u => u.id !== socket.id);
            io.emit('user left', user.username);
            io.emit('user list', users.map(user => user.username));
        }
        console.log('a user disconnected');
    });
});

server.listen(5000, () => {
    console.log('listening on *:5000');
});
