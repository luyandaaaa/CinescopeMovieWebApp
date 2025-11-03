import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowLeft, faStar } from '@fortawesome/free-solid-svg-icons';
import MovieDetails from './MovieDetails.jsx';
import { useNavigate } from 'react-router-dom';

const MovieList = ({ category, apiEndpoint, isUserLoggedIn }) => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [trailerUrl, setTrailerUrl] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showTrailerPage, setShowTrailerPage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Add a resize listener to detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleBackNavigation = () => {
        // Navigate to userHome if user is logged in, otherwise to home page
        if (isUserLoggedIn) {
            navigate('/userHome');
        } else {
            navigate('/');
        }
    };

    const fetchMovieVideos = useCallback(async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=02d2d30e38f07e116dd9f4ec122a4a27`
            );
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Error fetching videos:", error);
            return [];
        }
    }, []);

    const fetchMovies = useCallback(async () => {
        try {
            setLoading(true);
            const url = `https://api.themoviedb.org/3/${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}api_key=02d2d30e38f07e116dd9f4ec122a4a27&language=en-US&page=${page}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            
            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                throw new Error("No movies found in API response");
            }
            
            setTotalPages(data.total_pages);
            const filteredResults = data.results.filter(movie => 
                !movie.title.toLowerCase().includes('minecraft')
            );

            setMovies(prev => page === 1 ? filteredResults : [...prev, ...filteredResults]);
            setFilteredMovies(prev => page === 1 ? filteredResults : [...prev, ...filteredResults]);
            
        } catch (error) {
            console.error("Error fetching movies:", error);
            setMovies([]);
            setFilteredMovies([]);
        } finally {
            setLoading(false);
        }
    }, [page, apiEndpoint]);

    const playTrailer = async (movie) => {
        const videos = await fetchMovieVideos(movie.id);
        const trailer = videos.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
        if (trailer) {
            setTrailerUrl(trailer.key);
            setSelectedMovie(movie);
            setShowTrailerPage(true);
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

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    if (showTrailerPage && selectedMovie && trailerUrl) {
        return <MovieDetails 
            movie={selectedMovie} 
            onBack={closeTrailerPage} 
            trailerKey={trailerUrl} 
        />;
    }

    // Responsive styles for navbar based on screen size
    const navbarStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '12px 15px' : '15px 30px',
        backgroundColor: '#1a1a2e',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    };

    // Responsive styles for the brand and back button section
    const navLeftStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'space-between' : 'flex-start'
    };

    // Responsive styles for the search bar container
    const searchContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        width: isMobile ? '100%' : 'auto',
        flex: isMobile ? '0 0 100%' : 1,
        marginTop: isMobile ? '8px' : '0'
    };

    // Responsive grid for movie items
    const movieGridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: isMobile ? '15px' : '25px',
        padding: '10px 0'
    };

    // Responsive styles for movie card
    const movieCardStyle = (movie) => ({
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
    });

    // Responsive poster image size
    const posterImageStyle = {
        width: '100%',
        height: isMobile ? '210px' : '270px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid #333'
    };

    // Responsive section title and load more button
    const sectionHeaderStyle = {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        margin: '20px 0 15px 0',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '0'
    };

    const sectionTitleStyle = {
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        marginBottom: isMobile ? '5px' : '0'
    };

    return (
        <div className="categoryPage" style={{ backgroundColor: '#0f0f1a', minHeight: '100vh', color: 'white' }}>
            {/* Top Navigation Bar */}
            <div style={navbarStyle}>
                <div style={navLeftStyle}>
                    <button 
                        onClick={handleBackNavigation}
                        aria-label="Go back to home page"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        {!isMobile && <span>Back</span>}
                    </button>
                    
                    <div style={{ 
                        fontSize: isMobile ? '1.5rem' : '1.8rem', 
                        fontWeight: 'bold', 
                        color: '#e50914',
                    }}>
                        <span>CineScope</span>
                    </div>
                </div>
                
                <div style={searchContainerStyle}>
                    <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        maxWidth: isMobile ? '100%' : '500px' 
                    }}>
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
                                outline: 'none',
                                fontSize: isMobile ? '14px' : '16px'
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
            </div>

            {/* Main Content */}
            <div style={{ padding: isMobile ? '15px' : '20px 30px' }}>
                <section>
                    <div style={sectionHeaderStyle}>
                        <h3 style={sectionTitleStyle}>
                            {searchQuery ? `Search Results for "${searchQuery}"` : `${category} Movies`}
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
                                    fontSize: isMobile ? '14px' : '16px',
                                    opacity: page >= totalPages ? 0.7 : 1,
                                    alignSelf: isMobile ? 'flex-end' : 'auto'
                                }}
                            >
                                {loading ? 'Loading...' : 'See more'} <span style={{ fontSize: '1.2rem' }}>→</span>
                            </button>
                        )}
                    </div>
                    
                    <div style={movieGridStyle}>
                        {filteredMovies.length > 0 ? (
                            filteredMovies.map((movie) => (
                                <div 
                                    key={movie.id}
                                    style={movieCardStyle(movie)}
                                    onClick={() => playTrailer(movie)}
                                >
                                    <img 
                                        src={movie.poster_path 
                                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                            : 'https://via.placeholder.com/180x270?text=No+Poster'}
                                        alt={movie.title}
                                        style={posterImageStyle}
                                        loading="lazy"
                                    />
                                    <div style={{ padding: isMobile ? '8px 3px' : '12px 5px' }}>
                                        <h4 style={{ 
                                            margin: '0 0 5px 0', 
                                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {movie.title}
                                        </h4>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                                        }}>
                                            <span style={{ color: '#aaa' }}>
                                                {movie.release_date?.split('-')[0] || 'N/A'}
                                            </span>
                                            <span style={{ 
                                                color: '#FFD700',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                <FontAwesomeIcon icon={faStar} style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }} />
                                                {movie.vote_average?.toFixed(1) || '0.0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ 
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: isMobile ? '20px' : '40px',
                                color: '#aaa'
                            }}>
                                {searchQuery ? 
                                    `No movies found matching "${searchQuery}"` : 
                                    `No ${category.toLowerCase()} movies available. Try again later.`
                                }
                            </div>
                        )}
                    </div>

                    {loading && !searchQuery && (
                        <div style={{ 
                            color: 'white', 
                            textAlign: 'center', 
                            padding: isMobile ? '15px' : '20px',
                            fontStyle: 'italic'
                        }}>
                            Loading more movies...
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MovieList;