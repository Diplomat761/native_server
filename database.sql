CREATE database test;

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  release_year INTEGER
);

CREATE TABLE movie_genres (
  movie_id INTEGER REFERENCES movies(id),
  genre_id INTEGER REFERENCES genres(id),
  PRIMARY KEY (movie_id, genre_id)
);
