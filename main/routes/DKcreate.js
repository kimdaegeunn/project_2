// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('DKcreate', {
        userId: req.session.userId,
        username: req.session.username,
        userRealName: req.session.userRealName
    });
});

// POST 요청 처리
router.post('/', async (req, res) => {
    console.log('Debug: post create');
    const { title, content } = req.body;
    const authorId = req.session.loggedInUserId; // 현재 로그인한 사용자의 ID
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
            `INSERT INTO campingtip (id, author_id, title, content) VALUES (:id, :authorId, :title, :content)`,
            [postId, authorId, title, content]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect(`/DKdetailPost/${postId}`);
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

module.exports = router;
