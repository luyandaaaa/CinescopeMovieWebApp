import express from 'express';
import { getUserProfile, updateUserProfile, getUserWatchHistory, addToFavorites, removeFromFavorites, getFavorites, addToRecentlyWatched, addToCurrentlyWatching, getCurrentlyWatching } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Removed { authenticate }

const router = express.Router();

// Route to get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Route to update user profile
router.put('/profile', authMiddleware, updateUserProfile);

// Route to get user watch history
router.get('/watch-history', authMiddleware, getUserWatchHistory);

// Example route using authMiddleware
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'This is a protected route' });
});
router.put('/profile', authMiddleware, updateUserProfile);
router.post('/favorites/:movieId', authMiddleware, addToFavorites);
router.delete('/favorites/:movieId', authMiddleware, removeFromFavorites);
router.get('/favorites', authMiddleware, getFavorites);
router.post('/recently-watched/:movieId', authMiddleware, addToRecentlyWatched);
router.post('/currently-watching/:movieId', authMiddleware, addToCurrentlyWatching);
router.get('/currently-watching', authMiddleware, getCurrentlyWatching);

export default router;