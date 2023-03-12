import http from 'http';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: 'rootroot',
    host: 'localhost',
    port: 5432,
    database: 'test'
});

const server = http.createServer(async (req, res) => {
    const { method, url, headers } = req;
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', async () => {
        body = Buffer.concat(body).toString();
        let statusCode = 404;
        let response = {};
        try {
            if (method === 'GET' && url === '/movie') {
                const movies = await pool.query('SELECT * FROM movies');
                statusCode = 200;
                response = movies.rows;
            } else if (method === 'GET' && url.startsWith('/movie/')) {
                const id = url.split('/')[2];
                const movie = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
                if (movie.rows.length === 1) {
                    statusCode = 200;
                    response = movie.rows[0];
                }
            } else if (method === 'POST' && url === '/movie') {
                const { id, title, release_year } = JSON.parse(body);
                const newMovie = await pool.query('INSERT INTO movies (id, title, release_year) VALUES ($1, $2, $3) RETURNING *', [id, title, release_year]);
                statusCode = 201;
                response = newMovie.rows[0];
            } else if (method === 'PUT' && url === '/movie') {
                const { id, title, release_year } = JSON.parse(body);
                const updatedMovie = await pool.query('UPDATE movies SET title = $1, release_year = $2 WHERE id = $3 RETURNING *', [title, release_year, id]);
                statusCode = 200;
                response = updatedMovie.rows[0];
            } else if (method === 'DELETE' && url.startsWith('/movie/')) {
                const id = url.split('/')[2];
                const deletedMovie = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
                if (deletedMovie.rows.length === 1) {
                    statusCode = 200;
                    response = deletedMovie.rows[0];
                }
            } else if (method === 'GET' && url === '/genre') {
                const genres = await pool.query('SELECT * FROM genres');
                statusCode = 200;
                response = genres.rows;
            } else if (method === 'GET' && url.startsWith('/genre/')) {
                const id = url.split('/')[2];
                const genre = await pool.query('SELECT * FROM genres WHERE id = $1', [id]);
                if (genre.rows.length === 1) {
                    statusCode = 200;
                    response = genre.rows[0];
                }
            } else if (method === 'POST' && url === '/genre') {
                const { id, name } = JSON.parse(body);
                const newGenre = await pool.query('INSERT INTO genres (id, name) VALUES ($1, $2) RETURNING *', [id, name]);
                statusCode = 201;
                response = newGenre.rows[0];
            } else if (method === 'PUT' && url === '/genre') {
                const { id, name } = JSON.parse(body);
                const updatedGenre = await pool.query('UPDATE genres SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
                statusCode = 200;
                response = updatedGenre.rows[0];
            } else if (method === 'DELETE' && url.startsWith('/genre/')) {
                const id = url.split('/')[2];
                const deletedGenre = await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
                if (deletedGenre.rows.length === 1) {
                    statusCode = 200;
                    response = deletedGenre.rows[0];
                }
            }
        } catch (err) {
            statusCode = 500;
            response = { error: err.message };
        } finally {
            res.writeHead(statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(response));
        }
    });
});

server.listen(5555, () => {
    console.log('Server OK');
});

