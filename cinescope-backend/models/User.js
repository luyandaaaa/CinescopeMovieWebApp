import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
    }],
    currentlyWatching: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
    }],
    recentlyWatched: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
    }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;