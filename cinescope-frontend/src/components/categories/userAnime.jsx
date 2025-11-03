import React from 'react';
import MovieList from '../movies/MovieList';

const UserAnimationMovies = () => {
    return <MovieList category="Animation" apiEndpoint="discover/movie?with_genres=16" isUserLoggedIn={true}/>;
};

export default UserAnimationMovies;