import React from 'react';
import MovieList from '../movies/MovieList';

const ActionMovies = () => {
    return <MovieList 
        category="Action" 
        apiEndpoint="discover/movie?with_genres=28" 
    />;
};

export default ActionMovies;