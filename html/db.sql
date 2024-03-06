CREATE TABLE users (
                       id NUMBER PRIMARY KEY,  -- PK
                       username VARCHAR2(50),  -- UserID 또는 User 닉네임
                       password VARCHAR2(50),  -- 패스워드
                       name VARCHAR2(100)      -- 실제 사용자 이름
);

INSERT INTO users (id, username, password, name) VALUES (1, 'user1', 'password1', '김철수');
INSERT INTO users (id, username, password, name) VALUES (2, 'user2', 'password2', '이영희');
INSERT INTO users (id, username, password, name) VALUES (3, 'user3', 'password3', '박민수');
-- posts 테이블의 시퀀스 생성
CREATE SEQUENCE post_id_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;



-- 게시글 테이블 생성
CREATE TABLE posts (
                       id NUMBER PRIMARY KEY,
                       author_id NUMBER,
                       title VARCHAR2(255), -- 최대 사이즈 4000 바이트
                       content CLOB,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       views NUMBER DEFAULT 0,
                       likes NUMBER DEFAULT 0,
                       FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 55개의 더미 글 작성 ver1: 동일 시간에 생성되는 문제가 있다.
BEGIN
FOR i IN 1..55 LOOP
        INSERT INTO posts (id, title, content, author_id)
        VALUES (post_id_seq.nextval, '게시글 제목 ' || i, '게시글 내용 ' || i, ROUND(DBMS_RANDOM.VALUE(1, 3)));
END LOOP;
COMMIT;
END;
/

BEGIN
FOR i IN 1..55 LOOP
    INSERT INTO posts (id, title, content, author_id, created_at)
    VALUES (post_id_seq.nextval,
            '게시글 제목 ' || i,
            '게시글 내용 ' || i,
            ROUND(DBMS_RANDOM.VALUE(1, 3)),
            SYSTIMESTAMP + INTERVAL '0.001' SECOND * i);
END LOOP;
COMMIT;
END;
/

drop sequence comment_id_seq;
-- comments 테이블의 시퀀스 생성
CREATE SEQUENCE comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;
drop talbe comments;
CREATE TABLE comments (
                          id NUMBER PRIMARY KEY,
                          post_id NUMBER,
                          author_id NUMBER,
                          content CLOB,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          parent_comment_id number,
                          FOREIGN KEY (post_id) REFERENCES posts(id),
                          FOREIGN KEY (author_id) REFERENCES users(id),
                          FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

commit;