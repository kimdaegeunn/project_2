// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', (req, res) => {

});

// POST 요청 처리
router.post('/:commentId', async (req, res) => {
    const { commentId } = req.params; // 요청에서 댓글 ID 가져오기
    const { content, post_id } = req.body; // 요청에서 수정된 내용 가져오기

    try {
        // 댓글 수정 쿼리 실행
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `UPDATE comments SET content = :content WHERE id = :commentId`,
            { content, commentId }
        );
        // 삭제 후 상세 페이지로 리다이렉트
        res.redirect(`/detailPost/${post_id}`);
    } catch (error) {
        // 댓글 수정 실패 시 에러 응답 반환
        console.error('댓글 수정 에러:', error);
        res.status(500).send('댓글 수정 중 오류가 발생했습니다.');
    }
});

module.exports = router;
