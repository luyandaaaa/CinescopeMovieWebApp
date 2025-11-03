import React from 'react';
import MovieList from '../movies/MovieList';

const AnimationMovies = () => {
    return <MovieList category="Animation" apiEndpoint="discover/movie?with_genres=16" />;
};

export default AnimationMovies;