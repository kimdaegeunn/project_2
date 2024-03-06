// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get('/', (req, res) => {
    res.render('create', {
        userId: req.session.userId,
        username: req.session.username,
        userRealName: req.session.userRealName
    });
});

// POST 요청 처리
router.post('/', async (req, res) => {
    console.log('Debug: post create');
    const { title, content } = req.body;
    /*
    - req.files: 이것은 Multer라는 미들웨어에 의해 추가.
    Multer는 파일 업로드를 처리하기 위한 미들웨어로,
    업로드된 파일에 대한 정보를 req.files 객체에 저장
    - files: req.files의 file객체들의 정보중
     */
    const files = req.files.map(file => {
        return {
            // Multer의 file객체가 관리하는 업로드된 파일의 원본 이름
            originalName: file.originalname,
            // Multer의 file객체가 관리하는 업로드된 파일의 변환된 이름
            storedName: file.filename
        };
    });
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
            `INSERT INTO posts (id, author_id, title, content, file_original_name, file_stored_name) VALUES (:id, :authorId, :title, :content, :file_original_name, :file_stored_name)`,
            {
                id: postId,
                authorId: authorId,
                title: title,
                content: content,
                file_original_name: files.map(file => file.originalName).join(';'), // 파일의 원본 이름을 세미콜론으로 구분하여 저장
                file_stored_name: files.map(file => file.storedName).join(';') // 파일의 변환된 이름을 세미콜론으로 구분하여 저장
            }
        );

        // 변경 사항 커밋
        await conn.commit();

        // 파일 이동 및 임시 폴더의 파일 삭제
        // for (개별 요소 of 전체요소) : 전체 요소를 순회할 때 향상된 for문
        for (const file of req.files) {
            // multer에서 관리하는 file 객체의 path속성은 시스템에서 지정하는 TEMP 환경변수에 지정된 경로를
            // 디폴트 값으로 임시저장 폴더를 지정한다.
            // 임시폴더와 타겟폴더를 지정하는 이유는 업로드한 파일의 위험성을 temp 디렉토리에서 검증하기 위한
            // 일반적인 절차이다.
            // 추가적으로 보안조치를 취할 경우 아래  fs.renameSync 메소드를 통해 최종 이동하기 전에 필요로직을 구현한다.
            const tempFilePath = file.path;
            const targetFilePath = path.join(UPLOADS_FOLDER, file.filename);

            // 임시폴더의 파일을 타겟 경로로 이동
            fs.renameSync(tempFilePath, targetFilePath);
        }

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect('/boardMain');
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
