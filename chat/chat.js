const express = require('express');
const router = express.Router();
const socketIo = require('socket.io');
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// 사용자 목록을 저장할 배열dd
let users = [];

// Socket.io와의 연결을 설정하는 함수
const attachSocketServer = (server) => {
    const io = socketIo(server);
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
            io.emit('chat message', {username: user.username, message: msg});
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
}

// 라우터 정의
router.get('/', (req, res) => {
    res.render('talk');
});

// 모듈 exports
module.exports = { router, attachSocketServer };