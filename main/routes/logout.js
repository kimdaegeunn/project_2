// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', (req, res) => {
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

// POST 요청 처리
router.post('/', async (req, res) => {

});

module.exports = router;
