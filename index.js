import http from 'http';
import url from 'url'
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: 'rootroot',
    host: "localhost",
    port: "5432",
    database: "test"
})

const server = http.createServer(async (req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    const movieId = pathname.split('/')[2];
    const genreId = pathname.split('/')[4];

    if (req.method === 'POST' && pathname.match(/^\/movies\/\d+\/genres\/\d+$/)) {
        try {
            const result = await pool.query(
                'INSERT INTO movie_genres (movie_id, genre_id) values ($1, $2)',
                [movieId, genreId]
            );
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(`Жанр ${genreId} добавлен к фильму ${movieId}`);
            res.end();
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Ошибка при добавлении жанра к фильму');
            res.end();
        }
    } else if (req.method === 'GET' && pathname.match(/^\/movies\/\d+\/genres$/)) {
        try {
            const result = await pool.query(
                'SELECT genres.name FROM genres JOIN movie_genres ON genres.id = movie_genres.genre_id WHERE movie_genres.movie_id = $1',
                [movieId]
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(result.rows.map(row => row.name)));
            res.end();
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Ошибка при получении жанров к фильму');
            res.end();
        }
    } else if (req.method === 'DELETE' && pathname.match(/^\/movies\/\d+\/genres\/\d+$/)) {
        try {
            const result = await pool.query(
                'DELETE FROM movie_genres WHERE movie_id = $1 AND genre_id = $2',
                [movieId, genreId]
            );
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(`Жанр ${genreId} удален из фильма ${movieId}`);
            res.end();
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Ошибка при удалении жанра из фильма');
            res.end();
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Страница не найдена');
        res.end();
    }
});

server.listen(5555, (err) => {
    if (err) {
        return console.log('ERRORRRRRRRR');
    }

    console.log('Server OK');
});
