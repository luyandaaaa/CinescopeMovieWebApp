import React from 'react';
import MovieList from '../movies/MovieList';

const UserRomanceMovies = () => {
    return <MovieList category="Romance" apiEndpoint="discover/movie?with_genres=10749" isUserLoggedIn={true}/>;
};

export default UserRomanceMovies;