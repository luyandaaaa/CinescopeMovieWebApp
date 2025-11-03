import express from 'express';
import { fetchPopularMovies, getMovieDetails, searchMovies } from '../controllers/movieController.js';

const router = express.Router();

router.get('/popular', fetchPopularMovies);
router.get('/:id', getMovieDetails);
router.get('/search', searchMovies);

export default router;