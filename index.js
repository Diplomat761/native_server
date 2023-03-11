import http from 'http';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: 'rootroot',
    host: "localhost",
    port: "5432",
    database: "test"
});

const server = http.createServer(async (req, res) => {
  if (req.url === '/genre' && req.method === 'GET') {
    const genres = await pool.query('SELECT * FROM genres');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(genres.rows));
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(5555, (err) => {
  if (err) {
    return console.log('ERRORRRRRRRR');
  }

  console.log('Server OK');
});


