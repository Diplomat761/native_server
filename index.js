import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: 'rootroot',
    host: "localhost",
    port: "5432",
    database: "test"
})

const app = express();

app.use(express.json())





//-----Фильмы-----
app.post('/movie', async (req, res) => {
    const {id, title, release_year} = req.body
    const newMovie = await pool.query('INSERT INTO movies (id, title, release_year) values ($1, $2, $3) RETURNING *',
    [id, title, release_year])
    res.json(newMovie.rows[0])
})
app.get('/movie', async (req, res) => {
    const movies = await pool.query('SELECT * FROM movies')
    res.json(movies.rows)
})
app.get('/movie/:id', async (req, res) => {
    const id = req.params.id
    const movie = await pool.query('SELECT * FROM movies where id = $1', [id])
    res.json(movie.rows[0])
})
app.put('/movie', async (req, res) => {
    const {id, title, release_year} = req.body
    const movie = await pool.query(`UPDATE movies set release_year = $3, title = $2 where id = $1 RETURNING *`,
    [id, title, release_year])
    res.json(movie.rows[0])
})
app.delete('/movie/:id', async (req, res) => {
    const id = req.params.id
    const movie = await pool.query('DELETE FROM movies where id = $1', [id])
    res.json(movie.rows[0])
})



app.listen(5555, (err) => {
    if (err) {
        return console.log('ERRORRRRRRRR');
    }

    console.log('Server OK');
});

