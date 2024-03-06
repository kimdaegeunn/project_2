const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const oracledb = require('oracledb');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const dbConfig = {
    user: 'open_source',
    password: '1111',
    connectString: 'localhost:1521/xe'
};
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });
oracledb.autoCommit = true;

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



app.get('/', async (req, res) => {
    const campingData = await getTopCampingData();
    res.render('index', { campingData });
});

io.on('connection', (socket) => {
    console.log('A user connected');
});

server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});