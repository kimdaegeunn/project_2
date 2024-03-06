const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require("http");
const socketIo = require('socket.io');


const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
// const WEB_SERVER_HOME = 'D:\\HKLee\\Util\\nginx-1.24.0\\html';
const WEB_SERVER_HOME = 'C:\\JHJang\\util\\nginx-1.24.0\\html';
app.use('/', express.static(WEB_SERVER_HOME+ '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
// app.use(express.static('main/js'));

// Oracle 데이터베이스 연결 설정
const dbConfig = {
    user: 'open_source',
    password: '1111',
    connectString: 'localhost:1521/xe'
};

app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });
oracledb.autoCommit = true;

// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true,
}));


app.use('/DKaddComment', require('./routes/DKaddComment'));
app.use('/DKboardMain', require('./routes/DKboardMain'));
app.use('/DKcreate', require('./routes/DKcreate'));
app.use('/DKdeletePost', require('./routes/DKdeletePost'));
app.use('/DKdetailPost', require('./routes/DKdetailPost'));
app.use('/DKeditPost', require('./routes/DKeditPost'));
app.use('/DKeditComment', require('./routes/DKeditComment'));
app.use('/DKdeleteComment', require('./routes/DKdeleteComment'));



// 준희
app.use('/addComment', require('./routes/addComment'));
app.use('/boardMain', require('./routes/boardMain'));
app.use('/create', require('./routes/create'));
app.use('/deletePost', require('./routes/deletePost'));
app.use('/detailPost', require('./routes/detailPost'));
app.use('/editPost', require('./routes/editPost'));
app.use('/login', require('./routes/login'));
app.use('/loginFail', require('./routes/loginFail'));
app.use('/logout', require('./routes/logout'));
app.use('/editComment', require('./routes/editComment'));
app.use('/deleteComment', require('./routes/deleteComment'));
app.use('/main', require('./routes/main.js'));
app.use('/register', require('./routes/register.js'));
app.use('/introduce', require('./routes/introduce.js'));
app.use('/camping', require('./routes/camping.js'));
// app.use('/chat', require('./routes/chat.js'));

app.get('/detailcamping/:id', async (req, res) => {

    const postId = req.params.id;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        await conn.execute(
            `UPDATE camping SET views = views + 1 WHERE id = :id`,
            [postId]
        );

        const postResult = await conn.execute(
            `SELECT id, camping_ground, address_marking, website, category, facility,views
             FROM camping
            WHERE id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        const post = {
            id: postResult.rows[0][0],
            camping_ground: postResult.rows[0][1],
            address_marking: postResult.rows[0][2],
            website: postResult.rows[0][3],
            category: postResult.rows[0][4],
            facility: postResult.rows[0][5],
            views: postResult.rows[0][6]
        };
        res.render('detailcamping', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detail1/', async (req,res) => {
        let conn;

        try {
            conn = await oracledb.getConnection(dbConfig);

            // 캠핑장 총 개수 가져오기
            const totalResult = await conn.execute(
                `SELECT COUNT(*) AS total FROM camping
             WHERE category LIKE '%일반%'`
            );

            // 캠핑장 정보 가져오기
            const postResult = await conn.execute(
                `SELECT id, camping_ground, category
             FROM camping
             WHERE category LIKE '%일반%'`
            );

            const post = {
                id:postResult.rows,
                camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
                category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
                total: totalResult.rows[0][0] // 전체 개수
            };

            res.render('detail1', {
                post: post
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } finally {
            if (conn) {
                try {
                    await conn.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });

app.get('/detail2/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE category LIKE '%자동차%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE category LIKE '%자동차%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detail2', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detail3/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE category LIKE '%카라반%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE category LIKE '%카라반%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detail3', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detail4/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE category LIKE '%글램핑%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE category LIKE '%글램핑%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detail4', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detailTag1/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE facility LIKE '%반려동물%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE facility LIKE '%반려동물%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detailTag1', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});
app.get('/detailTag2/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE facility LIKE '%놀이방%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE facility LIKE '%놀이방%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detailTag2', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});
app.get('/detailTag3/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE facility LIKE '%수영장%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE facility LIKE '%수영장%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detailTag3', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detailTag4/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE facility LIKE '%바비큐%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE facility LIKE '%바비큐%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detailTag4', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detailTag5/', async (req,res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE facility LIKE '%인터넷%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id, camping_ground, category
             FROM camping
             WHERE facility LIKE '%인터넷%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0] // 전체 개수
        };

        res.render('detailTag5', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.get('/detailSearch/', async (req,res) => {
    let conn;

    const searchInput = req.query.searchInput;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 캠핑장 총 개수 가져오기
        const totalResult = await conn.execute(
            `SELECT COUNT(*) AS total FROM camping
             WHERE camping_ground LIKE '%${searchInput}%'
                OR category LIKE '%${searchInput}%'
                OR address_marking LIKE '%${searchInput}%'
                OR facility LIKE '%${searchInput}%'`
        );

        // 캠핑장 정보 가져오기
        const postResult = await conn.execute(
            `SELECT id,camping_ground,category FROM camping
             WHERE camping_ground LIKE '%${searchInput}%'
                OR category LIKE '%${searchInput}%'
                OR address_marking LIKE '%${searchInput}%'
                OR facility LIKE '%${searchInput}%'`
        );

        const post = {
            id:postResult.rows,
            camping_ground: postResult.rows.map(row => row[1]), // 캠핑장 이름만 가져옴
            category: postResult.rows.map(row => row[2]), // 카테고리만 가져옴
            total: totalResult.rows[0][0],// 전체 개수
            searchResult : searchInput
        };

        res.render('detailSearch', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});



app.get('/detailcamping/:id', async (req, res) => {

    const postId = req.params.id;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        const postResult = await conn.execute(
            `SELECT id, camping_ground, address_marking, website, category, facility
             FROM camping
            WHERE id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        const post = {
            id: postResult.rows[0][0],
            camping_ground: postResult.rows[0][1],
            address_marking: postResult.rows[0][2],
            website: postResult.rows[0][3],
            category: postResult.rows[0][4],
            facility: postResult.rows[0][5]
        };
        res.render('detailcamping', {
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});





// Socket.io와의 연결을 설정하는 함수
const attachSocketServer = (server) => {
    const io = socketIo(server);
    io.on('connection', (socket) => {
        console.log('a user connected');
        let users = [];
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
attachSocketServer(server);
app.get('/chat', async (req,res) => {
    res.render('talk');
});



// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/main`);
});
