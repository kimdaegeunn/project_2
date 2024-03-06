// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/:id',async (req, res) => {
    let conn;

    const loggedInUserId = req.session.loggedInUserId;
    const loggedInUserName = req.session.loggedInUserName;
    const loggedInUserRealName = req.session.loggedInUserRealName;
    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `SELECT COUNT(*) AS total FROM posts`
        );
        const totalPosts = result.rows[0];
        const postsPerPage = 10; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;

        // 정렬 방식에 따른 SQL 쿼리 작성
        let orderByClause = 'ORDER BY p.created_at DESC'; // 기본적으로 최신순 정렬

        if (req.query.sort === 'views_desc') {
            orderByClause = 'ORDER BY p.views DESC, p.created_at DESC'; // 조회수 내림차순, 최신순
        }

        // 검색 조건에 따른 SQL 쿼리 작성
        let searchCondition = ''; // 기본적으로 검색 조건 없음

        if (req.query.searchType && req.query.searchInput) {
            const searchType = req.query.searchType;
            const searchInput = req.query.searchInput;

            // 검색 조건에 따라 WHERE 절 설정
            if (searchType === 'title') {
                searchCondition = ` AND p.title LIKE '%${searchInput}%'`;
                // searchCondition = `p.title LIKE '%${searchInput}%'`;
            } else if (searchType === 'content') {
                searchCondition = ` AND p.content LIKE '%${searchInput}%'`;
                // searchCondition = `p.content LIKE '%${searchInput}%'`;
            } else if (searchType === 'author') {
                searchCondition = ` AND u.username LIKE '%${searchInput}%'`;
                // searchCondition = `u.username LIKE '%${searchInput}%'`;
            }
        }
// if() 다음 블록에 들어가는 조건: true, truesy (false가 아닌 모든값)
// if() 다음 블록이 수행되지 않는 조건: false, falsy(0, null, NaN)
        const sql_query = `SELECT
                 id,title,author,to_char(created_at,'YYYY-MM-DD'),views, likes,
                 (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
             FROM (
                      SELECT
                          p.id, p.title, u.username AS author, p.created_at, p.views, p.likes,
                          ROW_NUMBER() OVER (${orderByClause}) AS rn
                      FROM posts p
                               JOIN users u ON p.author_id = u.id
                      WHERE 1=1 
                          ${searchCondition} 
                  ) p
             WHERE rn BETWEEN :startRow AND :endRow
            `;
        result = await conn.execute(sql_query,
            {
                startRow: startRow,
                endRow: endRow
            }
        );

        const MAX_PAGE_LIMIT = 5;
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);

        res.render('index', {
            userId: loggedInUserId,
            userName: loggedInUserName,
            userRealName: loggedInUserRealName,
            posts: result.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPages: totalPages,
            maxPageNumber: MAX_PAGE_LIMIT
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
