const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();
router.get('/', async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/loginModal'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.session.loggedInUserId;
    const userName = req.session.loggedInUserName;
    const userRealName = req.session.loggedInUserRealName;
    console.log(`username: ${userName}`);
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 조회수 증가 처리
        await conn.execute(
            `UPDATE recipes SET views = views + 1 WHERE id = :id`,
            [postId]
        );

        // 변경 사항을 커밋
        await conn.commit();

        // 게시글 정보 가져오기
        const recipeResult = await conn.execute(
            `SELECT r.id, r.title, u.username AS author, r.content, TO_CHAR(r.created_at, 'YYYY-MM-DD') AS created_at,
                    r.views, r.likes, r.file_original_name, r.file_stored_name
             FROM recipes r
                      JOIN users u ON r.author_id = u.id
             WHERE r.id = :id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글 가져오기
        const commentResult = await conn.execute(
            `SELECT c.id, c.author_id, c.content, u.username AS author, TO_CHAR(c.created_at, 'YYYY-MM-DD HH:MM') AS created_at, c.parent_comment_id
             FROM comments c
                      JOIN users u ON c.author_id = u.id
             WHERE c.post_id = :id
             ORDER BY c.id`,
            [postId],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글과 댓글의 댓글을 구성
        const comments = [];
        const commentMap = new Map(); // 댓글의 id를 key로 하여 댓글을 맵으로 저장

        commentResult.rows.forEach(row => {
            const comment = {
                id: row[0],
                author_id: row[1],
                content: row[2],
                author: row[3],
                created_at: row[4],
                children: [], // 자식 댓글을 저장할 배열
            };

            const parentId = row[5]; // 부모 댓글의 id

            if (parentId === null) {
                // 부모 댓글이 null이면 바로 댓글 배열에 추가
                comments.push(comment);
                commentMap.set(comment.id, comment); // 맵에 추가
            } else {
                // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
                const parentComment = commentMap.get(parentId);
                parentComment.children.push(comment);
            }
        });
        const recipe = {
            id: recipeResult.rows[0][0],
            title: recipeResult.rows[0][1],
            author: recipeResult.rows[0][2],
            content: recipeResult.rows[0][3],
            created_at: recipeResult.rows[0][4],
            views: recipeResult.rows[0][5],
            likes: recipeResult.rows[0][6],
            file_original_name: recipeResult.rows[0][7],
            file_stored_name: recipeResult.rows[0][8]
        };
        res.render('detailPost', {
            recipe: recipe,
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
})
router.post('/', async (req, res) => {
    //
})
module.exports = router;