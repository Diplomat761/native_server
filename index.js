import http from 'http';
import url from 'url'
import pkg from 'pg';
const { Pool } = pkg;

// Подключаемся к базе
const pool = new Pool({
    user: "postgres",
    password: 'rootroot',
    host: "localhost",
    port: "5432",
    database: "test"
})

// Создаем сервер
const server = http.createServer(async (req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    const movieId = pathname.split('/')[2];
    const genreId = pathname.split('/')[4];

    // Запрос на добавление жанра к фильму
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

    // Запрос на получение жанров к фильму
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

    // Запрос на удаление жанра у фильма
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

    // Запрос на получение всех фильмов
    } else if (req.method === 'GET' && pathname === '/movie') {
        try {
            const movies = await pool.query('SELECT * FROM movies');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(movies.rows));
            res.end();
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Ошибка при получении списка фильмов');
            res.end();
        }

    // Запрос на получение одного фильма
    } else if (req.method === 'GET' && pathname.startsWith('/movie/')) {
        const id = pathname.split('/')[2];
        try {
          const movie = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
          if (movie.rows.length === 1) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(movie.rows[0]));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('Movie not found');
          }
        } catch (err) {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write('Error retrieving movie');
        }
        res.end();

    // Запрос на добавление нового фильма
    } else if (req.method === 'POST' && pathname === '/movie') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const { id, title, release_year } = JSON.parse(body);
                const newMovie = await pool.query('INSERT INTO movies (id, title, release_year) VALUES ($1, $2, $3) RETURNING *', [id, title, release_year]);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newMovie.rows[0]));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
        });

    // Запрос на редактирование фильма
    } else if (req.method === 'PUT' && pathname === '/movie') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const { id, title, release_year } = JSON.parse(body);
                const updatedMovie = await pool.query('UPDATE movies SET title = $1, release_year = $2 WHERE id = $3 RETURNING *', [title, release_year, id]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedMovie.rows[0]));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
        });

    // Запрос на удаление фильма
    } else if (req.method === 'DELETE' && pathname.startsWith('/movie/')) {
        const id = pathname.split('/')[2];
        const deletedMovie = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
        if (deletedMovie.rows.length === 1) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deletedMovie.rows[0]));
        } 

    // Запрос на получение всех жанров
    } else if (req.method === 'GET' && pathname === '/genre') {
        try {
            const genres = await pool.query('SELECT * FROM genres');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(genres.rows));
            res.end();
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Ошибка при получении списка фильмов');
            res.end();
        }

    //Запрос на получение одного жанра
    } else if (req.method === 'GET' && pathname.startsWith('/genre/')) {
        const id = pathname.split('/')[2];
        try {
          const genre = await pool.query('SELECT * FROM genres WHERE id = $1', [id]);
          if (genre.rows.length === 1) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(genre.rows[0]));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('Movie not found');
          }
        } catch (err) {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write('Error retrieving movie');
        }
        res.end();

    // Запрос на добавление жанра
    } else if (req.method === 'POST' && pathname === '/genre') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const {id, name} = JSON.parse(body);
                const newGenre = await pool.query('INSERT INTO genres (id, name) VALUES ($1, $2) RETURNING *', [id, name]);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newGenre.rows[0]));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
        });

    // Запрос на редактирование жанра
    } else if (req.method === 'PUT' && pathname === '/genre') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const {id, name} = JSON.parse(body);
                const updatedGenre = await pool.query('UPDATE genres SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedGenre.rows[0]));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
        });

    // Запрос на удаление жанра
    } else if (req.method === 'DELETE' && pathname.startsWith('/genre/')) {
        const id = pathname.split('/')[2];
        const deletedMovie = await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
        if (deletedMovie.rows.length === 1) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deletedMovie.rows[0]));
        } 
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
    }
});

// Пдключаемся к порту 5555 и отображаем статус 
server.listen(5555, (err) => {
    if (err) {
        return console.log('ERRORRRRRRRR');
    }

    console.log('Server OK');
});
