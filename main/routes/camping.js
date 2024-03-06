// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

async function getTopCampingData() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT camping_ground, category, views 
             FROM (SELECT camping_ground, category, views 
                   FROM camping 
                   ORDER BY views DESC) 
             WHERE rownum <= 5`
        );
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err; // 오류 발생 시 상위 핸들러로 전파
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

router.get('/', async (req, res) => {
    try {
        const campingData = await getTopCampingData();
        res.render('camping', { campingData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// POST 요청 처리
router.post('/', async (req, res) => {

});

module.exports = router;
