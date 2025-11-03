import React from 'react';
import MovieList from '../movies/MovieList';

const HorrorMovies = () => {
    return <MovieList category="Horror" apiEndpoint="discover/movie?with_genres=27" />;
};

export default HorrorMovies;