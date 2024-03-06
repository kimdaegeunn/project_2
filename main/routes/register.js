// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', (req, res) => {
        res.render('register');
});

// POST 요청 처리
router.post('/', async (req, res) => {
    console.log('Debug: post create');
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    // const birthday = req.body.birthday; // Fix this line, it should be req.body.birthday
    // const tell = req.body.tell;

    try {
        const conn = await oracledb.getConnection(dbConfig);

        const result = await conn.execute(`select * from users where username = :username`, { username });
        if (result.rows.length === 0) {

            await conn.execute(
                `insert into users (id,username, password, name)
                 values (USER_id_SEQ.nextval,:username, :password, :name)`,
                [ username, password, name]
            );
            console.log("회원가입 성공");
            res.redirect(`/main`);
        } else {
            console.log("회원가입 실패");
            res.redirect('/login');
        }
    } catch (err) {
        console.error("오류 발생:", err);
        res.status(500).send("서버 오류 발생");
    }
});


module.exports = router;
