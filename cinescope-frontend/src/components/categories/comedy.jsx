import React from 'react';
import MovieList from '../movies/MovieList';

const ComedyMovies = () => {
    return <MovieList category="Comedy" apiEndpoint="discover/movie?with_genres=35" />;
};

export default ComedyMovies;