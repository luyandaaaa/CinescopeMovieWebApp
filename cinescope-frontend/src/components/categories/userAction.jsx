import React from 'react';
import MovieList from '../movies/MovieList';

const UserActionMovies = () => {
    return <MovieList 
        category="Action" 
        apiEndpoint="discover/movie?with_genres=28" 
        isUserLoggedIn={true}
    />;
};

export default UserActionMovies;