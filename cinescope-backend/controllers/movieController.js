import Movie from '../models/Movie.js';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY; // Ensure you have this in your .env file

export const fetchPopularMovies = async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`);
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching popular movies', error: error.message });
    }
};

export const getMovieDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movie details', error: error.message });
    }
};

export const searchMovies = async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`);
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for movies', error: error.message });
    }
};