import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    overview: String,
    poster_path: String,
    backdrop_path: String,
    releaseDate: Date,
    vote_average: Number
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;