import User from '../models/User.js';
import Movie from '../models/Movie.js';
import axios from 'axios';

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user after authentication
        const user = await User.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
      const { firstName, lastName, country } = req.body;
      
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.country = country || user.country;
      
      const updatedUser = await user.save();
      
      res.status(200).json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
export const getUserWatchHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('recentlyWatched');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.recentlyWatched);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const addToFavorites = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user._id;

        // First check if movie exists in our database
        let movie = await Movie.findOne({ tmdbId: movieId });
        
        if (!movie) {
            // If not, fetch from TMDB and create in our database
            const tmdbResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
            );
            
            movie = new Movie({
                tmdbId: tmdbResponse.data.id,
                title: tmdbResponse.data.title,
                overview: tmdbResponse.data.overview,
                releaseDate: tmdbResponse.data.release_date,
                poster_path: tmdbResponse.data.poster_path,
                backdrop_path: tmdbResponse.data.backdrop_path,
                vote_average: tmdbResponse.data.vote_average
            });
            await movie.save();
        }

        // Update user's favorites
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favorites: movie._id } },
            { new: true }
        ).populate('favorites');

        res.status(200).json({
            success: true,
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ message: 'Error adding to favorites', error: error.message });
    }
};

export const removeFromFavorites = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user._id;

        // Update user's favorites
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { favorites: movieId } },
            { new: true }
        ).populate('favorites');

        res.status(200).json({
            success: true,
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from favorites', error: error.message });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('favorites');
        
        res.status(200).json({
            success: true,
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({ message: 'Error getting favorites', error: error.message });
    }
};

export const addToRecentlyWatched = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user._id;

        // First check if movie exists in our database
        let movie = await Movie.findOne({ tmdbId: movieId });
        
        if (!movie) {
            // If not, fetch from TMDB and create in our database
            const tmdbResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
            );
            
            movie = new Movie({
                tmdbId: tmdbResponse.data.id,
                title: tmdbResponse.data.title,
                overview: tmdbResponse.data.overview,
                releaseDate: tmdbResponse.data.release_date,
                poster_path: tmdbResponse.data.poster_path,
                backdrop_path: tmdbResponse.data.backdrop_path,
                vote_average: tmdbResponse.data.vote_average
            });
            await movie.save();
        }

        // Update user's recently watched
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $addToSet: { recentlyWatched: movie._id },
                $pull: { currentlyWatching: movie._id } // Remove from currently watching if it was there
            },
            { new: true }
        ).populate('recentlyWatched');

        res.status(200).json({
            success: true,
            recentlyWatched: user.recentlyWatched
        });
    } catch (error) {
        console.error('Error adding to recently watched:', error);
        res.status(500).json({ message: 'Error adding to recently watched', error: error.message });
    }
};

export const addToCurrentlyWatching = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user._id;

        // First check if movie exists in our database
        let movie = await Movie.findOne({ tmdbId: movieId });
        
        if (!movie) {
            // If not, fetch from TMDB and create in our database
            const tmdbResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
            );
            
            movie = new Movie({
                tmdbId: tmdbResponse.data.id,
                title: tmdbResponse.data.title,
                overview: tmdbResponse.data.overview,
                releaseDate: tmdbResponse.data.release_date,
                poster_path: tmdbResponse.data.poster_path,
                backdrop_path: tmdbResponse.data.backdrop_path,
                vote_average: tmdbResponse.data.vote_average
            });
            await movie.save();
        }

        // Update user's currently watching
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { currentlyWatching: movie._id } },
            { new: true }
        ).populate('currentlyWatching');

        res.status(200).json({
            success: true,
            currentlyWatching: user.currentlyWatching
        });
    } catch (error) {
        console.error('Error adding to currently watching:', error);
        res.status(500).json({ message: 'Error adding to currently watching', error: error.message });
    }
};

export const getCurrentlyWatching = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('currentlyWatching');
        
        res.status(200).json({
            success: true,
            currentlyWatching: user.currentlyWatching
        });
    } catch (error) {
        res.status(500).json({ message: 'Error getting currently watching', error: error.message });
    }
};

