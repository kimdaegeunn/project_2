const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
const WEB_SERVER_HOME = 'C:\\JoonHee\\Util\\nginx-1.24.0\\html';
app.use('/', express.static(WEB_SERVER_HOME+ '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Oracle 데이터베이스 연결 설정
const dbConfig = {
    user: 'open_source',
    password: '1111',
    connectString: 'localhost:1521/xe'
};

app.set('view engine', 'ejs');
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });
oracledb.autoCommit = true;
// 게시판 메인 페이지 렌더링
app.get('/boardMain', async (req, res) => {
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `SELECT COUNT(*) AS total FROM posts`   // 전체 게시글 수를 파악하네
        );
        const totalPosts = result.rows[0];
        // 사용자 입장에서 수정해야할 상수 : postsPerPage
        const postsPerPage = 8; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산
        // 쿼리 파라메터 사용 방법
        // req.query.[쿼리파라메터변수명]
        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        // current Page가 1이면 startRow는 1, endRow는 10
        // current Page가 2이면 startRow는 10, endRow는 20
        // ...
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
        console.log(`startRow: ${startRow}, endRow: ${endRow}`);
        result = await conn.execute(
            `SELECT  id, title, author_id, to_char(created_at,'YYYY-MM-DD'), views,likes
                FROM (
                    SELECT  p.id, p.title, u.name AS author_id, p.created_at, p.views,p.likes,
                            ROW_NUMBER() OVER (ORDER BY p.id DESC) AS rn
                    FROM posts p
                    JOIN users u ON p.author_id = u.id
                    )
             WHERE rn BETWEEN :startRow AND :endRow`,
            {
                startRow: startRow,
                endRow: endRow
            }
        );
        // 사용자 입장에서 수정해야할 상수 : MAX_PAGE_LIMIT
        const MAX_PAGE_LIMIT = 5; // 페이징의 갯수
        // 5개씩 페이징 처리를 하기 위해 화면에 보이는 페이지 번호를 계산
        // 현재 페이지를 중심으로 전체 페이지에서 현재페이지를 뺀 값이 5(한 화면에 페이징하는 갯수)보다 작다면 시작 페이지를 조정한다.
        // 만약에 현재 페이지가 3을 선택하여 3을 start page로 둔다면 3,4,5,6 이렇게 4개 밖에 표시가 되지 않는다. 따라서 2,3,4,5,6으로 만든다.
        // 즉, 선택한 페이지가 전체 페이지의 끝으로 가더라도 화면에 5(한 화면에 페이징하는 갯수)를 보장하기 위한 조건
        // currentPage(현재 페이지)가 1인 경우 (totalPages * currentPage) => 5 startPage: 1
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        // 기본적으로 endPage는 startPage + MAX_PAGE_LIMIT - 1 이지만 totalPages를 초과하지 말아야 할 조건
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
        console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

        res.render('notice', {
            posts: result.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPages: totalPages,
            maxPageNumber: MAX_PAGE_LIMIT
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
// 로그인
app.get('/login', (req, res) => {
    // '/' 경로로의 요청은 Nginx에서 login.html을 처리하도록 리다이렉트
    res.redirect('/login.html');
});

// 로그인 처리
app.post('/login', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const { username, password } = req.body;
    const authenticatedUser = await varifyID(username, password);

    if (authenticatedUser) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.redirect(`/boardMain?id=${authenticatedUser.id}&username=${authenticatedUser.username}&name=${authenticatedUser.name}`);
    } else {
        res.render('loginFail',{ username});
    }
});
// 로그인 실패
app.get('/loginFail', (req, res) => {
    res.render('/loginFail');
});
app.get('/detailPost/:id', async (req, res) => {
    // 경로는 req.params.경로명으로 받는다.
// 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.params.user_id;
    const userName = req.session.username;
    const userRealName = req.session.userRealName;
    console.log(`username: ${userName}`);

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 조회수 증가 처리
        await conn.execute(
            `UPDATE posts SET views = views + 1 WHERE id = :id`,
            [postId]
        );

        // 변경사항 커밋
        await conn.commit();

        // 게시글 정보 가져오기
        const postResult = await conn.execute(
            `SELECT p.title, u.name AS author_id, p.content, TO_CHAR(p.created_at, 'YYYY-MM-DD') AS created_at, p.views, p.likes 
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글과 댓글의 댓글을 구성
        const comments = [];

        const post = {
            title: postResult.rows[0][0],
            author: postResult.rows[0][1],
            content: postResult.rows[0][2],
            created_at: postResult.rows[0][3],
            views: postResult.rows[0][4],
            likes: postResult.rows[0][5]
        };
        console.log(`post: ${post}, comments: ${comments}`);
        console.log(`id: ${postResult.rows[0][0]}, content: ${postResult.rows[0][2]},
         login username: ${userName} login userRealName: ${userRealName}`);

        res.render('detailPost', {
            post: post,
            userId: userId,
            username: userName,
            userRealName: userRealName,
            comments: comments
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

// 로그아웃처리
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 중 오류 발생:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
        }
    });
});

async function varifyID(username, password) {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            'SELECT * FROM users WHERE username = :username AND password = :password',
            { username, password }
        );

        if (result.rows.length > 0) {
            console.log('varifyID');
            console.log(result.rows[0][0]);
            return {
                id: result.rows[0][0],
                username: result.rows[0][1],
                name: result.rows[0][3]
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('오류 발생:', error);
        return null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// 게시글 작성
app.post('/create', async (req, res) => {
    console.log('Debug: post create');
    const { title, content } = req.body;
    const authorId = req.session.userId; // 현재 로그인한 사용자의 ID
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글을 위한 시퀀스에서 새로운 ID 가져오기
        const result = await conn.execute(
            `SELECT post_id_seq.NEXTVAL FROM DUAL`
        );
        const postId = result.rows[0][0];

        // 게시글 삽입
        await conn.execute(
            `INSERT INTO posts (id, author_id, title, content) VALUES (:id, :authorId, :title, :content)`,
            [postId, authorId, title, content]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect('/boardMain');
    } catch (err) {
        console.error('글 작성 중 오류 발생:', err);
        res.status(500).send('글 작성 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/boardMain`);
});
