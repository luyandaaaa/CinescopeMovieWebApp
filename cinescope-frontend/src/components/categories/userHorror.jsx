import React from 'react';
import MovieList from '../movies/MovieList';

const UserHorrorMovies = () => {
    return <MovieList category="Horror" apiEndpoint="discover/movie?with_genres=27" isUserLoggedIn={true} />;
};

export default UserHorrorMovies;