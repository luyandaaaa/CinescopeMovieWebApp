import React, { useState, useEffect, useCallback } from 'react';
import '../styles/userHome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faAngleUp, 
    faAngleDown, 
    faSearch, 
    faUserCircle, 
    faEdit, 
    faSignOutAlt,
    faHeart,
    faPlayCircle,
    faHeart as faSolidHeart
} from '@fortawesome/free-solid-svg-icons';
import MovieDetails from '../components/movies/MovieDetails.jsx';
import { useNavigate } from 'react-router-dom';

function UserHome() {
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [trailerUrl, setTrailerUrl] = useState(null);
    const [featuredMovie, setFeaturedMovie] = useState(null);
    const [featuredMovieVideos, setFeaturedMovieVideos] = useState([]);
    const [featuredTrailerKey, setFeaturedTrailerKey] = useState(null);
    const [showVideoGallery, setShowVideoGallery] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [showTrailerPage, setShowTrailerPage] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [currentlyWatching, setCurrentlyWatching] = useState([]);
    const [recentlyWatched, setRecentlyWatched] = useState([]);
    const [popularInCountry, setPopularInCountry] = useState([]);
    const [activeSection, setActiveSection] = useState('Featured Movies');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState({});
    const [isWatchingLoading, setIsWatchingLoading] = useState({});
    const categories = ["Action", "Comedy", "Animation", "Horror", "Romantic"];
    const navigate = useNavigate();

    // Profile dropdown states
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        country: ''
    });

    // Load user data from localStorage on mount
    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            try {
                const parsedData = JSON.parse(userDataString);
                setUserData(parsedData);
                setUpdateFormData({
                    firstName: parsedData.firstName || '',
                    lastName: parsedData.lastName || '',
                    email: parsedData.email || '',
                    country: parsedData.country || ''
                });
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
                setUserData(null);
            }
        }
    }, []);

    // Fetch all user-specific data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch user profile
                const profileResponse = await fetch('https://cinescopemoviewebapp.onrender.com/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Fetch favorites
                const favoritesResponse = await fetch('https://cinescopemoviewebapp.onrender.com/api/users/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Fetch currently watching
                const currentlyWatchingResponse = await fetch('https://cinescopemoviewebapp.onrender.com/api/users/currently-watching', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Fetch watch history
                const watchHistoryResponse = await fetch('https://cinescopemoviewebapp.onrender.com/api/users/watch-history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (profileResponse.ok && favoritesResponse.ok && 
                    currentlyWatchingResponse.ok && watchHistoryResponse.ok) {
                    const profileData = await profileResponse.json();
                    const favoritesData = await favoritesResponse.json();
                    const currentlyWatchingData = await currentlyWatchingResponse.json();
                    const watchHistoryData = await watchHistoryResponse.json();
                    
                    setUserData(profileData);
                    setFavorites(favoritesData.favorites || []);
                    setCurrentlyWatching(currentlyWatchingData.currentlyWatching || []);
                    setRecentlyWatched(watchHistoryData || []);
                    
                    // Update localStorage
                    localStorage.setItem('user', JSON.stringify({
                        ...profileData,
                        favorites: favoritesData.favorites || [],
                        currentlyWatching: currentlyWatchingData.currentlyWatching || [],
                        recentlyWatched: watchHistoryData || []
                    }));
                } else {
                    throw new Error('Failed to fetch user data');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError(error.message);
            }
        };

        fetchUserData();
    }, []);

    // Fetch popular movies for user's country
    useEffect(() => {
        if (userData?.country) {
            const fetchPopularForCountry = async () => {
                try {
                    const regionMap = {
                        'United States': 'US',
                        'India': 'IN',
                        'United Kingdom': 'GB',
                        'South Africa': 'ZA'
                    };

                    const region = regionMap[userData.country] || '';
                    const response = await fetch(
                        `https://api.themoviedb.org/3/movie/popular?api_key=02d2d30e38f07e116dd9f4ec122a4a27&language=en-US&page=1&region=${region}`
                    );

                    const data = await response.json();
                    setPopularInCountry(data.results.slice(0, 12));
                } catch (error) {
                    console.error("Error fetching popular movies for country:", error);
                    setError('Failed to load popular movies for your country');
                }
            };

            fetchPopularForCountry();
        }
    }, [userData]);

    const fetchMovieVideos = useCallback(async (movieId, isFeatured = false) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=02d2d30e38f07e116dd9f4ec122a4a27`
            );
            const data = await response.json();
            const videos = data.results;
            
            if (isFeatured) {
                setFeaturedMovieVideos(videos);
                const trailer = videos.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
                if (trailer) {
                    setFeaturedTrailerKey(trailer.key);
                }
            }
            
            return videos;
        } catch (error) {
            console.error("Error fetching videos:", error);
            return [];
        }
    }, []);

    const fetchMovies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/popular?api_key=02d2d30e38f07e116dd9f4ec122a4a27&language=en-US&page=${page}`
            );
            const data = await response.json();
            setTotalPages(data.total_pages);
            
            if (page === 1) {
                const moviesToShow = data.results.slice(0, 12);
                setMovies(moviesToShow);
                setFilteredMovies(moviesToShow);
                
                if (moviesToShow.length > 0) {
                    const firstMovie = moviesToShow[0];
                    setFeaturedMovie(firstMovie);
                    fetchMovieVideos(firstMovie.id, true);
                }
            } else {
                setMovies(prev => [...prev, ...data.results.slice(0, 12)]);
                setFilteredMovies(prev => [...prev, ...data.results.slice(0, 12)]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setError('Failed to load movies');
            setLoading(false);
        }
    }, [page, fetchMovieVideos]);

    const toggleFavorite = async (movie) => {
        try {
            setIsFavoriteLoading(prev => ({ ...prev, [movie.id]: true }));
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
    
            const isCurrentlyFavorite = favorites.some(fav => fav.tmdbId === movie.id);
            const endpoint = `https://cinescopemoviewebapp.onrender.com/api/users/favorites/${movie.id}`;
            const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
    
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Failed to ${isCurrentlyFavorite ? 'remove from' : 'add to'} favorites`);
            }
    
            const data = await response.json();
    
            // Update favorites in state
            setFavorites(data.favorites || []);
    
            // Update localStorage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (currentUser) {
                localStorage.setItem('user', JSON.stringify({
                    ...currentUser,
                    favorites: data.favorites || []
                }));
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
            setError(error.message);
        } finally {
            setIsFavoriteLoading(prev => ({ ...prev, [movie.id]: false }));
        }
    };

    const toggleCurrentlyWatching = async (movie) => {
        try {
            setIsWatchingLoading(prev => ({ ...prev, [movie.id]: true }));
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
    
            const isCurrentlyWatching = currentlyWatching.some(m => m.tmdbId === movie.id);
            const endpoint = `https://cinescopemoviewebapp.onrender.com/api/users/currently-watching/${movie.id}`;
            const method = 'POST'; // Always POST to toggle
    
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Failed to ${isCurrentlyWatching ? 'remove from' : 'add to'} currently watching`);
            }
    
            const data = await response.json();
    
            // Update currently watching in state
            setCurrentlyWatching(data.currentlyWatching || []);
    
            // Update localStorage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (currentUser) {
                localStorage.setItem('user', JSON.stringify({
                    ...currentUser,
                    currentlyWatching: data.currentlyWatching || []
                }));
            }
        } catch (error) {
            console.error("Error updating currently watching:", error);
            setError(error.message);
        } finally {
            setIsWatchingLoading(prev => ({ ...prev, [movie.id]: false }));
        }
    };
    
    const isFavorite = (movieId) => {
        return favorites.some(movie => movie.tmdbId === movieId);
    };

    const isCurrentlyWatching = (movieId) => {
        return currentlyWatching.some(movie => movie.tmdbId === movieId);
    };

    const playTrailer = async (movie) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Add to recently watched
                const response = await fetch(`https://cinescopemoviewebapp.onrender.com/api/users/recently-watched/${movie.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setRecentlyWatched(data.recentlyWatched || []);
                    
                    // Update localStorage
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    if (currentUser) {
                        localStorage.setItem('user', JSON.stringify({
                            ...currentUser,
                            recentlyWatched: data.recentlyWatched || []
                        }));
                    }
                }
            }
            
            const videos = await fetchMovieVideos(movie.id);
            const trailer = videos.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
            if (trailer) {
                setTrailerUrl(trailer.key);
                setSelectedMovie(movie);
                setShowTrailerPage(true);
            }
        } catch (error) {
            console.error("Error tracking watched movie:", error);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://cinescopemoviewebapp.onrender.com/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateFormData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }

            if (!data.user) {
                throw new Error('User data not returned from server');
            }

            // Update localStorage and state
            localStorage.setItem('user', JSON.stringify(data.user));
            setUserData(data.user);
            setUpdateFormData({
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
                email: data.user.email || '',
                country: data.user.country || ''
            });
            setShowUpdateForm(false);
            setError(null);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Update error:', err);
            setError(`Failed to update profile: ${err.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUserData(null);
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredMovies(movies);
        } else {
            const filtered = movies.filter(movie =>
                movie.title.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredMovies(filtered);
        }
    };

    const closeTrailerPage = () => {
        setShowTrailerPage(false);
        setTrailerUrl(null);
    };

    const loadMoreMovies = () => {
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const toggleVideoGallery = () => {
        setShowVideoGallery(!showVideoGallery);
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const updateFeaturedMovie = (movie) => {
        if (movie && movie.title) {
            setFeaturedMovie(movie);
            fetchMovieVideos(movie.id, true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    // Update filtered movies when movies or search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMovies(movies);
        } else {
            const filtered = movies.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMovies(filtered);
        }
    }, [searchQuery, movies]);

    if (showTrailerPage && selectedMovie && trailerUrl) {
        return <MovieDetails 
            movie={selectedMovie} 
            onBack={closeTrailerPage} 
            trailerKey={trailerUrl} 
        />;
    }

    const renderMovieGrid = (movies, sectionName) => {
        if (movies.length === 0) {
            let message = '';
            switch(sectionName) {
                case 'Your Favorites':
                    message = 'You currently have no favorite movies.';
                    break;
                case 'Recently Watched':
                    message = 'You have not watched any movies recently.';
                    break;
                case 'Currently Watching':
                    message = 'You are not currently watching any movies.';
                    break;
                default:
                    message = 'No movies available.';
            }
            
            return (
                <div style={{ 
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#aaa'
                }}>
                    {message}
                </div>
            );
        }

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '20px',
                padding: '10px 0',
                '@media (max-width: 768px)': {
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '15px'
                },
                '@media (max-width: 480px)': {
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '10px'
                }
            }}>
                {movies.map((movie) => (
                    <div 
                        key={movie.id}
                        style={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            transform: isFavoriteLoading[movie.id] || isWatchingLoading[movie.id] ? 'scale(0.98)' : 'scale(1)',
                            opacity: isFavoriteLoading[movie.id] || isWatchingLoading[movie.id] ? 0.8 : 1
                        }}
                    >
                        <div 
                            onClick={() => updateFeaturedMovie(movie)}
                            style={{ position: 'relative' }}
                        >
                            <img 
                                src={movie.poster_path 
                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                    : 'https://via.placeholder.com/180x270?text=No+Poster'}
                                alt={movie.title}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    aspectRatio: '2/3',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #333'
                                }}
                            />
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    '@media (max-width: 480px)': {
                                        width: '25px',
                                        height: '25px'
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(movie);
                                }}
                            >
                                {isFavoriteLoading[movie.id] ? (
                                    <div style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid #fff',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                ) : (
                                    <FontAwesomeIcon 
                                        icon={isFavorite(movie.id) ? faSolidHeart : faHeart} 
                                        color={isFavorite(movie.id) ? '#e50914' : 'white'}
                                        style={{ 
                                            transition: 'color 0.2s ease',
                                            fontSize: '14px'
                                        }}
                                    />
                                )}
                            </div>
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: '10px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    '@media (max-width: 480px)': {
                                        width: '25px',
                                        height: '25px',
                                        top: '45px'
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCurrentlyWatching(movie);
                                }}
                            >
                                {isWatchingLoading[movie.id] ? (
                                    <div style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid #fff',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                ) : (
                                    <FontAwesomeIcon 
                                        icon={faPlayCircle} 
                                        color={isCurrentlyWatching(movie.id) ? '#e50914' : 'white'}
                                        style={{ 
                                            transition: 'color 0.2s ease',
                                            fontSize: '14px'
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '10px 5px' }}>
                            <h4 style={{ 
                                margin: '0 0 5px 0', 
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                '@media (max-width: 480px)': {
                                    fontSize: '0.8rem'
                                }
                            }}>
                                {movie.title}
                            </h4>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                fontSize: '0.8rem',
                                '@media (max-width: 480px)': {
                                    fontSize: '0.7rem'
                                }
                            }}>
                                <span style={{ color: '#aaa' }}>
                                    {movie.release_date?.split('-')[0] || 'N/A'}
                                </span>
                                <span style={{ 
                                    color: '#FFD700',
                                    fontWeight: 'bold'
                                }}>
                                    ★ {movie.vote_average?.toFixed(1) || '0.0'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSectionNav = () => {
        return (
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid #333',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                '@media (max-width: 768px)': {
                    gap: '10px'
                }
            }}>
                {['Featured Movies', 'Popular in Your Country', 'Recently Watched', 'Currently Watching', 'Your Favorites'].map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeSection === section ? '#e50914' : 'white',
                            fontSize: '1rem',
                            fontWeight: activeSection === section ? 'bold' : 'normal',
                            padding: '8px 0',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            position: 'relative',
                            transition: 'color 0.3s ease',
                            flexShrink: 0,
                            '@media (max-width: 768px)': {
                                fontSize: '0.9rem',
                                padding: '8px 5px'
                            }
                        }}
                    >
                        {section}
                        {activeSection === section && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-11px',
                                left: 0,
                                right: 0,
                                height: '3px',
                                backgroundColor: '#e50914',
                                borderRadius: '3px 3px 0 0'
                            }} />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="userHome" style={{ backgroundColor: '#0f0f1a', minHeight: '100vh', color: 'white' }}>
            {error && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#e50914',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '4px',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    maxWidth: '90%',
                    '@media (max-width: 768px)': {
                        top: '10px',
                        right: '10px',
                        left: '10px',
                        maxWidth: 'calc(100% - 20px)'
                    }
                }}>
                    <span style={{ flex: 1 }}>{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            flexShrink: 0
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {trailerUrl && !showTrailerPage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <button 
                        onClick={() => setTrailerUrl(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: '#e50914',
                            color: 'white',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            zIndex: 2001,
                            '@media (max-width: 768px)': {
                                top: '10px',
                                right: '10px'
                            }
                        }}
                    >
                        ×
                    </button>
                    <iframe
                        title="Movie Trailer"
                        width="90%"
                        height="90%"
                        style={{ 
                            zIndex: 2000,
                            '@media (max-width: 768px)': {
                                width: '100%',
                                height: '60%'
                            }
                        }}
                        src={`https://www.youtube.com/embed/${trailerUrl}?autoplay=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                backgroundColor: '#1a1a2e',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                '@media (max-width: 768px)': {
                    flexDirection: 'column',
                    padding: '10px',
                    gap: '10px'
                }
            }}>
                <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#e50914',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: 1,
                    '@media (max-width: 768px)': {
                        fontSize: '1.3rem',
                        justifyContent: 'center',
                        flex: 'none',
                        width: '100%'
                    }
                }}>
                    <span>CineScope</span>
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    flex: 1,
                    '@media (max-width: 768px)': {
                        width: '100%',
                        flex: 'none'
                    }
                }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <input 
                            type="text" 
                            placeholder="Search movies..." 
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                                padding: '8px 35px 8px 15px',
                                borderRadius: '20px',
                                border: 'none',
                                width: '100%',
                                backgroundColor: '#2c2c44',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#aaa',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>

                <div className="header-right">
                    <div style={{ position: 'relative' }}>
                        <div className="profile-button" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                            <FontAwesomeIcon icon={faUserCircle} />
                            <span className="responsive-text">
                                Welcome, {userData?.firstName || 'User'}
                            </span>
                        </div>
                        
                        {showProfileDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: '#2c2c44',
                                borderRadius: '4px',
                                width: '200px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                zIndex: 1000,
                                marginTop: '10px',
                                padding: '10px'
                            }}>
                                {!showUpdateForm ? (
                                    <>
                                        <div style={{ padding: '8px', borderBottom: '1px solid #3e3e5e' }}>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>
                                                {userData?.firstName || ''} {userData?.lastName || ''}
                                            </p>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#aaa' }}>
                                                {userData?.email || ''}
                                            </p>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#aaa' }}>
                                                {userData?.country || ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowUpdateForm(true)}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '10px',
                                                backgroundColor: '#e50914',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                            Update Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '10px',
                                                backgroundColor: 'transparent',
                                                color: '#e50914',
                                                border: '1px solid #e50914',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ padding: '8px' }}>
                                        <h4 style={{ margin: '0 0 10px', textAlign: 'center', fontSize: '1rem' }}>Update Profile</h4>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>First Name</label>
                                            <input
                                                type="text"
                                                value={updateFormData.firstName}
                                                onChange={(e) => setUpdateFormData({...updateFormData, firstName: e.target.value})}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #333',
                                                    backgroundColor: '#2c2c44',
                                                    color: '#fff',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Last Name</label>
                                            <input
                                                type="text"
                                                value={updateFormData.lastName}
                                                onChange={(e) => setUpdateFormData({...updateFormData, lastName: e.target.value})}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #333',
                                                    backgroundColor: '#2c2c44',
                                                    color: '#fff',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Country</label>
                                            <select
                                                value={updateFormData.country}
                                                onChange={(e) => setUpdateFormData({...updateFormData, country: e.target.value})}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #333',
                                                    backgroundColor: '#2c2c44',
                                                    color: '#fff',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <option value="">Select Country</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="United States">United States</option>
                                                <option value="India">India</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <button
                                                onClick={handleProfileUpdate}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    backgroundColor: '#e50914',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setShowUpdateForm(false)}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    backgroundColor: 'transparent',
                                                    color: '#e50914',
                                                    border: '1px solid #e50914',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                            style={{
                                background: 'red',
                                border: 'none',
                                color: 'white',
                                padding: '8px 15px',
                                cursor: 'pointer',
                                display: 'flex',
                                fontWeight: 'bold',
                                gap: '10px',
                                alignItems: 'center',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                '@media (max-width: 480px)': {
                                    padding: '8px 10px',
                                    fontSize: '0.8rem'
                                }
                            }}
                        >
                            Categories {isOpen ? <FontAwesomeIcon icon={faAngleUp} /> : <FontAwesomeIcon icon={faAngleDown} />}
                        </button>
                        {isOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: '#2c2c44',
                                borderRadius: '4px',
                                width: '150px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                zIndex: 1000,
                                marginTop: '10px',
                                '@media (max-width: 480px)': {
                                    width: '130px'
                                }
                            }}>
                                {categories.map((category) => (
                                    <div 
                                        key={category}
                                        style={{
                                            padding: '10px 15px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #3e3e5e',
                                            transition: 'background-color 0.2s',
                                            fontSize: '0.9rem',
                                            '@media (max-width: 480px)': {
                                                padding: '8px 10px',
                                                fontSize: '0.8rem'
                                            }
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3e3e5e'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        onClick={() => {
                                            const categoryMap = {
                                                'Action': 'action',
                                                'Comedy': 'comedy',
                                                'Animation': 'animation',
                                                'Horror': 'horror',
                                                'Romantic': 'romance'
                                            };
                                            const path = categoryMap[category] || category.toLowerCase();
                                            navigate(`/user/categories/${path}`);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {category}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="user-home-container">
                {activeSection === 'Featured Movies' && featuredMovie && (
                    <div>
                        <section 
                            style={{
                                position: 'relative',
                                borderRadius: '8px',
                                margin: '20px 0',
                                minHeight: '60vh',
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                                '@media (max-width: 768px)': {
                                    minHeight: '50vh'
                                },
                                '@media (max-width: 480px)': {
                                    minHeight: '40vh'
                                }
                            }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isHovering && featuredTrailerKey ? (
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: 0,
                                    left: 0,
                                    zIndex: 1
                                }}>
                                    <iframe
                                        title="Background Trailer"
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${featuredTrailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=${featuredTrailerKey}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        style={{
                                            position: 'absolute',
                                            top: '-60px',
                                            left: 0,
                                            width: '100%',
                                            height: 'calc(100% + 120px)',
                                            objectFit: 'cover',
                                            pointerEvents: 'none'
                                        }}
                                    ></iframe>
                                </div>
                            ) : (
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: 0,
                                    left: 0,
                                    backgroundImage: featuredMovie?.backdrop_path 
                                        ? `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`
                                        : 'url(https://image.tmdb.org/t/p/original/ziEuG1essDuWuC5lp3UxW6l7Rpw.jpg)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    zIndex: 1
                                }}></div>
                            )}
                            
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                zIndex: 2
                            }}></div>
                            
                            <div style={{
                                maxWidth: '600px',
                                padding: '30px',
                                position: 'relative',
                                zIndex: 3,
                                '@media (max-width: 768px)': {
                                    padding: '20px',
                                    maxWidth: '100%'
                                }
                            }}>
                                <h2 style={{ 
                                    fontSize: '2rem', 
                                    marginBottom: '10px',
                                    '@media (max-width: 768px)': {
                                        fontSize: '1.5rem'
                                    }
                                }}>
                                    {featuredMovie?.title || 'Featured Movie'}
                                </h2>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    '@media (max-width: 480px)': {
                                        flexDirection: 'column',
                                        gap: '5px'
                                    }
                                }}>
                                    <span>Rating: {featuredMovie?.vote_average?.toFixed(1) || 'N/A'}/10</span>
                                    <span>Released: {featuredMovie?.release_date?.split('-')[0] || 'N/A'}</span>
                                </div>
                                <p style={{ 
                                    lineHeight: '1.6', 
                                    marginBottom: '20px',
                                    fontSize: '1rem',
                                    '@media (max-width: 768px)': {
                                        fontSize: '0.9rem'
                                    }
                                }}>
                                    {featuredMovie?.overview || 'Movie description will appear here.'}
                                </p>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '10px', 
                                    flexWrap: 'wrap',
                                    '@media (max-width: 480px)': {
                                        justifyContent: 'center'
                                    }
                                }}>
                                    <button 
                                        onClick={() => {
                                            if (featuredMovie) {
                                                playTrailer(featuredMovie);
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#e50914',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            fontSize: '0.9rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            fontWeight: 'bold',
                                            '@media (max-width: 480px)': {
                                                padding: '8px 15px',
                                                fontSize: '0.8rem'
                                            }
                                        }}
                                    >
                                        VIEW
                                    </button>
                                    <button 
                                        onClick={() => toggleFavorite(featuredMovie)}
                                        disabled={isFavoriteLoading[featuredMovie.id]}
                                        style={{
                                            backgroundColor: isFavorite(featuredMovie.id) ? '#e50914' : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: `2px solid ${isFavorite(featuredMovie.id) ? '#e50914' : '#e50914'}`,
                                            padding: '10px 20px',
                                            fontSize: '0.9rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            opacity: isFavoriteLoading[featuredMovie.id] ? 0.7 : 1,
                                            '@media (max-width: 480px)': {
                                                padding: '8px 15px',
                                                fontSize: '0.8rem'
                                            }
                                        }}
                                    >
                                        {isFavoriteLoading[featuredMovie.id] ? (
                                            <div style={{
                                                width: '14px',
                                                height: '14px',
                                                border: '2px solid #fff',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite'
                                            }} />
                                        ) : (
                                            <>
                                                <FontAwesomeIcon 
                                                    icon={isFavorite(featuredMovie.id) ? faSolidHeart : faHeart} 
                                                    color={isFavorite(featuredMovie.id) ? 'white' : '#e50914'}
                                                    style={{ fontSize: '14px' }}
                                                />
                                                {isFavorite(featuredMovie.id) ? 'FAVORITED' : 'ADD TO FAVORITES'}
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => toggleCurrentlyWatching(featuredMovie)}
                                        disabled={isWatchingLoading[featuredMovie.id]}
                                        style={{
                                            backgroundColor: isCurrentlyWatching(featuredMovie.id) ? '#e50914' : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: `2px solid ${isCurrentlyWatching(featuredMovie.id) ? '#e50914' : '#e50914'}`,
                                            padding: '10px 20px',
                                            fontSize: '0.9rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            opacity: isWatchingLoading[featuredMovie.id] ? 0.7 : 1,
                                            '@media (max-width: 480px)': {
                                                padding: '8px 15px',
                                                fontSize: '0.8rem'
                                            }
                                        }}
                                    >
                                        {isWatchingLoading[featuredMovie.id] ? (
                                            <div style={{
                                                width: '14px',
                                                height: '14px',
                                                border: '2px solid #fff',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite'
                                            }} />
                                        ) : (
                                            <>
                                                <FontAwesomeIcon 
                                                    icon={faPlayCircle} 
                                                    color={isCurrentlyWatching(featuredMovie.id) ? 'white' : '#e50914'}
                                                    style={{ fontSize: '14px' }}
                                                />
                                                {isCurrentlyWatching(featuredMovie.id) ? 'WATCHING' : 'CURRENTLY WATCHING'}
                                            </>
                                        )}
                                    </button>
                                    {featuredMovieVideos.length > 0 && (
                                        <button 
                                            onClick={toggleVideoGallery}
                                            style={{
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: '2px solid #e50914',
                                                padding: '10px 20px',
                                                fontSize: '0.9rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s',
                                                fontWeight: 'bold',
                                                '@media (max-width: 480px)': {
                                                    padding: '8px 15px',
                                                    fontSize: '0.8rem'
                                                }
                                            }}
                                        >
                                            {showVideoGallery ? 'HIDE VIDEOS' : 'SHOW ALL VIDEOS'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                        
                        {showVideoGallery && featuredMovieVideos.length > 0 && (
                            <section style={{
                                padding: '15px',
                                backgroundColor: 'rgba(26, 26, 46, 0.8)',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                '@media (min-width: 768px)': {
                                    padding: '20px'
                                }
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.2rem', 
                                    marginBottom: '15px',
                                    borderBottom: '1px solid #333',
                                    paddingBottom: '8px',
                                    '@media (min-width: 768px)': {
                                        fontSize: '1.3rem'
                                    }
                                }}>
                                    Videos for {featuredMovie?.title}
                                </h3>
                                
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '15px',
                                    '@media (max-width: 768px)': {
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                        gap: '10px'
                                    }
                                }}>
                                    {featuredMovieVideos.map(video => (
                                        <div 
                                            key={video.key}
                                            style={{
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}
                                            onClick={() => setTrailerUrl(video.key)}
                                        >
                                            <div style={{
                                                position: 'relative',
                                                paddingBottom: '56.25%',
                                                height: 0
                                            }}>
                                                <img 
                                                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                                    alt={video.name}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    backgroundColor: 'rgba(229, 9, 20, 0.8)',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    fontSize: '1.2rem',
                                                    '@media (max-width: 768px)': {
                                                        width: '30px',
                                                        height: '30px',
                                                        fontSize: '1rem'
                                                    }
                                                }}>
                                                    ▶
                                                </div>
                                            </div>
                                            <div style={{ padding: '8px 5px' }}>
                                                <p style={{ 
                                                    margin: '0', 
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    fontSize: '0.9rem',
                                                    '@media (max-width: 768px)': {
                                                        fontSize: '0.8rem'
                                                    }
                                                }}>
                                                    {video.name}
                                                </p>
                                                <p style={{
                                                    margin: '5px 0 0',
                                                    fontSize: '0.7rem',
                                                    color: '#aaa'
                                                }}>
                                                    {video.type}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                <section className="section-margin">
                    {renderSectionNav()}
                    {activeSection === 'Your Favorites' && renderMovieGrid(favorites, 'Your Favorites')}
                    {activeSection === 'Currently Watching' && renderMovieGrid(currentlyWatching, 'Currently Watching')}
                    {activeSection === 'Recently Watched' && renderMovieGrid(recentlyWatched, 'Recently Watched')}
                    {activeSection === 'Popular in Your Country' && renderMovieGrid(popularInCountry, 'Popular in Your Country')}
                </section>
                
                <section>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        margin: '20px 0 15px 0',
                        '@media (max-width: 768px)': {
                            margin: '15px 0 10px 0'
                        }
                    }}>
                        <h3 style={{ 
                            fontSize: '1.3rem',
                            '@media (max-width: 768px)': {
                                fontSize: '1.1rem'
                            }
                        }}>
                            {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Movies'}
                        </h3>
                        {!searchQuery && (
                            <button 
                                onClick={loadMoreMovies}
                                disabled={loading || page >= totalPages}
                                style={{ 
                                    background: 'none',
                                    border: 'none',
                                    color: page >= totalPages ? '#666' : '#e50914',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    cursor: page >= totalPages ? 'default' : 'pointer',
                                    padding: 0,
                                    fontSize: '0.9rem',
                                    opacity: page >= totalPages ? 0.7 : 1,
                                    '@media (max-width: 768px)': {
                                        fontSize: '0.8rem'
                                    }
                                }}
                            >
                                {loading ? 'Loading...' : 'See more'} <span style={{ fontSize: '1rem' }}>→</span>
                            </button>
                        )}
                    </div>
                    
                    {renderMovieGrid(filteredMovies, 'Featured Movies')}
                    
                    {filteredMovies.length === 0 && (
                        <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '30px',
                            color: '#aaa',
                            '@media (max-width: 768px)': {
                                padding: '20px'
                            }
                        }}>
                            {searchQuery ? 
                                `No movies found matching "${searchQuery}"` : 
                                'No movies available'
                            }
                        </div>
                    )}

                    {loading && !searchQuery && (
                        <div style={{ 
                            color: 'white', 
                            textAlign: 'center', 
                            padding: '15px',
                            fontStyle: 'italic',
                            '@media (max-width: 768px)': {
                                padding: '10px'
                            }
                        }}>
                            Loading more movies...
                        </div>
                    )}
                </section>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default UserHome;