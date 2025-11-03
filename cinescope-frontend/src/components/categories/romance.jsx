import React from 'react';
import MovieList from '../movies/MovieList';

const RomanceMovies = () => {
    return <MovieList category="Romance" apiEndpoint="discover/movie?with_genres=10749" />;
};

export default RomanceMovies;