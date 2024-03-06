// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', async(req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // // 변경 사항을 커밋
        // await conn.commit();
        const postId = req.params.id;
        // 게시글 정보 가져오기
        const postResult = await conn.execute(
            `select camping_ground, category
             from camping`
        );
        const post = {
            camping_ground: postResult.rows,
            category: postResult.rows
        }
        res.render('main', {
            post: post
            // camping: post.camping_ground,
            // category: post.category
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

// POST 요청 처리
router.post('/', async (req, res) => {

});

module.exports = router;
