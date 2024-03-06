// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', (req, res) => {

});

// POST 요청 처리
router.post('/:id', async (req, res) => {
// 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const commentId = req.params.id;
    const postId = req.body.post_id;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 댓글 삭제
        await conn.execute(
            `DELETE FROM comments WHERE id = :id OR parent_comment_id = :parent_comment_id`,
            { id: commentId, parent_comment_id: commentId }
        );

        // 변경 사항 커밋
        await conn.commit();

        // 삭제 후 상세 페이지로 리다이렉트
        res.redirect(`/detailPost/${postId}`);
    } catch (err) {
        console.error('댓글 삭제 중 오류 발생:', err);
        res.status(500).send('댓글 삭제 중 오류가 발생했습니다.');
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
