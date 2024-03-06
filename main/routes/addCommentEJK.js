const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();
router.get('/', async (req, res) => {
    const postId = req.query.post_id; // postId 가져오기
    const userId = req.session.loggedInUserId;
    const username = req.session.loggedInUserName;
    const userRealName = req.session.loggedInUserRealName;
    res.render('addComment',{postId: postId, userId:userId, userName:username, userRealName:userRealName});
});
router.post('/', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const post_id  = req.body.post_id;
    const author_id = req.session.loggedInUserId;
    const comment_id = req.body.comment_id; // req.body에서 comment_id를 가져옴
    const { content } = req.body;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 댓글 추가
        await conn.execute(
            `INSERT INTO comments (id, post_id, author_id, content, parent_comment_id) 
             VALUES (comment_id_seq.nextval, :post_id, :author_id, :content, :parent_id)`, // parend_id를 parent_id로 수정
            [post_id, author_id, content, comment_id]
        );

        await conn.commit();

        res.redirect(`/detailPostEJK/${post_id}`);
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
})
module.exports = router;