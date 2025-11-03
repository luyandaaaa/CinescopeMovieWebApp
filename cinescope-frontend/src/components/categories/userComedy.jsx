import React from 'react';
import MovieList from '../movies/MovieList';

const UserComedyMovies = () => {
    return <MovieList category="Comedy" apiEndpoint="discover/movie?with_genres=35" isUserLoggedIn={true}/>;
};

export default UserComedyMovies;