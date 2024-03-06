// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('/loginFail');
});

// POST 요청 처리
router.post('/', async (req, res) => {

});

module.exports = router;
