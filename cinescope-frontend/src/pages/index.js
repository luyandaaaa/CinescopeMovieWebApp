import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown, faSearch } from '@fortawesome/free-solid-svg-icons'; 
import MovieDetails from '../components/movies/MovieDetails.jsx';
import { useNavigate } from 'react-router-dom';

function LandPage() {
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
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const categories = ["Action", "Comedy", "Animation", "Horror", "Romantic"];
    const logoCinescope = process.env.PUBLIC_URL + '/logo-cinescope.jpeg';
    const navigate = useNavigate();

    // Track window resize for responsive adjustments
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            
            const filteredResults = data.results.filter(movie => 
                !movie.title.toLowerCase().includes('minecraft')
            );
            
            if (page === 1) {
                const moviesToShow = filteredResults.slice(0, 12);
                setMovies(moviesToShow);
                setFilteredMovies(moviesToShow);
                
                if (moviesToShow.length > 0) {
                    const firstMovie = moviesToShow[0];
                    setFeaturedMovie(firstMovie);
                    fetchMovieVideos(firstMovie.id, true);
                }
            } else {
                setMovies(prev => [...prev, ...filteredResults.slice(0, 12)]);
                setFilteredMovies(prev => [...prev, ...filteredResults.slice(0, 12)]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setLoading(false);
        }
    }, [page, fetchMovieVideos]);

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
        if (!movie.title.toLowerCase().includes('minecraft')) {
            setFeaturedMovie(movie);
            fetchMovieVideos(movie.id, true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (isOpen) setIsOpen(false);
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    if (showTrailerPage && selectedMovie && trailerUrl) {
        return <MovieDetails 
            movie={selectedMovie} 
            onBack={closeTrailerPage} 
            trailerKey={trailerUrl} 
        />;
    }

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    return (
        <div className="landPage" style={{ backgroundColor: '#0f0f1a', minHeight: '100vh', color: 'white' }}>
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
                            zIndex: 2001
                        }}
                    >
                        ×
                    </button>
                    <iframe
                        title="Movie Trailer"
                        width={isMobile ? "95%" : "80%"}
                        height={isMobile ? "40%" : "80%"}
                        src={`https://www.youtube.com/embed/${trailerUrl}?autoplay=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ zIndex: 2000 }}
                    ></iframe>
                </div>
            )}

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                padding: isMobile ? '10px 15px' : '15px 30px',
                backgroundColor: '#1a1a2e',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <div style={{ 
                    fontSize: isMobile ? '1.4rem' : '1.8rem', 
                    fontWeight: 'bold', 
                    color: '#e50914',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: isMobile ? 'none' : 1,
                    marginBottom: isMobile ? '10px' : 0,
                    width: isMobile ? '100%' : 'auto',
                }}>
                    <img 
                        src={logoCinescope} 
                        alt="CineScope Logo" 
                        style={{
                            height: isMobile ? '30px' : '40px',
                            width: 'auto',
                            borderRadius: '4px'
                        }}
                    />
                    <span>CineScope</span>
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    flex: isMobile ? 'none' : 1,
                    width: isMobile ? '100%' : 'auto',
                    marginBottom: isMobile ? '10px' : 0
                }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : '500px' }}>
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

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    justifyContent: isMobile ? 'space-between' : 'flex-end',
                    flex: isMobile ? 'none' : 1,
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <button 
                        style={{
                            backgroundColor: '#e50914',
                            color: 'white',
                            border: 'none',
                            padding: isMobile ? '6px 15px' : '8px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            fontSize: isMobile ? '0.9rem' : 'inherit',
                            flex: isMobile ? '1' : 'none'
                        }}
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                    <div style={{ position: 'relative', flex: isMobile ? '1' : 'none' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                            style={{
                                background: 'red',
                                border: 'none',
                                color: 'white',
                                padding: isMobile ? '6px 15px' : '8px 20px',
                                cursor: 'pointer',
                                display: 'flex',
                                fontWeight: 'bold',
                                gap: isMobile ? '5px' : '15px',
                                alignItems: 'center',
                                borderRadius: '4px',
                                width: isMobile ? '100%' : 'auto',
                                fontSize: isMobile ? '0.9rem' : 'inherit',
                                justifyContent: 'center'
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
                                width: isMobile ? '100%' : '180px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                zIndex: 1000,
                                marginTop: '10px'
                            }}>
                                {categories.map((category) => (
                                    <div 
                                        key={category}
                                        style={{
                                            padding: '12px 20px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #3e3e5e',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3e3e5e'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const categoryMap = {
                                                'Action': 'action',
                                                'Comedy': 'comedy',
                                                'Animation': 'animation',
                                                'Horror': 'horror',
                                                'Romantic': 'romance'
                                            };
                                            const path = categoryMap[category] || category.toLowerCase();
                                            navigate(`/categories/${path}`);
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

            {featuredMovie && (
                <div style={{ padding: isMobile ? '10px 15px' : '20px 30px' }}>
                    <section 
                        style={{
                            position: 'relative',
                            borderRadius: '8px',
                            margin: '20px 0',
                            minHeight: isMobile ? '50vh' : '70vh',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {isHovering && featuredTrailerKey && !isMobile ? (
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
                            maxWidth: isMobile ? '100%' : '600px',
                            padding: isMobile ? '20px' : '40px',
                            position: 'relative',
                            zIndex: 3
                        }}>
                            <h2 style={{ 
                                fontSize: isMobile ? '1.8rem' : '2.5rem', 
                                marginBottom: '10px' 
                            }}>
                                {featuredMovie?.title || 'Featured Movie'}
                            </h2>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginBottom: '20px',
                                fontWeight: 'bold',
                                fontSize: isMobile ? '0.9rem' : 'inherit'
                            }}>
                                <span>Rating: {featuredMovie?.vote_average?.toFixed(1) || 'N/A'}/10</span>
                                <span>Released: {featuredMovie?.release_date?.split('-')[0] || 'N/A'}</span>
                            </div>
                            <p style={{ 
                                lineHeight: '1.6', 
                                marginBottom: '25px',
                                fontSize: isMobile ? '1rem' : '1.1rem',
                                display: '-webkit-box',
                                WebkitLineClamp: isMobile ? '3' : 'unset',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {featuredMovie?.overview || 'Movie description will appear here.'}
                            </p>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
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
                                        padding: isMobile ? '10px 20px' : '12px 30px',
                                        fontSize: isMobile ? '0.9rem' : '1rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    VIEW 
                                </button>
                                {featuredMovieVideos.length > 0 && (
                                    <button 
                                        onClick={toggleVideoGallery}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: '2px solid #e50914',
                                            padding: isMobile ? '10px 20px' : '12px 30px',
                                            fontSize: isMobile ? '0.9rem' : '1rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            fontWeight: 'bold'
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
                            padding: isMobile ? '15px' : '20px',
                            backgroundColor: 'rgba(26, 26, 46, 0.8)',
                            borderRadius: '8px',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{ 
                                fontSize: isMobile ? '1.1rem' : '1.3rem', 
                                marginBottom: '20px',
                                borderBottom: '1px solid #333',
                                paddingBottom: '10px'
                            }}>
                                Videos for {featuredMovie?.title}
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile 
                                    ? 'repeat(auto-fill, minmax(140px, 1fr))' 
                                    : isTablet
                                        ? 'repeat(auto-fill, minmax(200px, 1fr))'
                                        : 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: isMobile ? '10px' : '20px'
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
                                                width: isMobile ? '40px' : '50px',
                                                height: isMobile ? '40px' : '50px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontSize: isMobile ? '1.2rem' : '1.5rem'
                                            }}>
                                                ▶
                                            </div>
                                        </div>
                                        <div style={{ padding: '10px 5px' }}>
                                            <p style={{ 
                                                margin: '0', 
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontSize: isMobile ? '0.8rem' : 'inherit'
                                            }}>
                                                {video.name}
                                            </p>
                                            <p style={{
                                                margin: '5px 0 0',
                                                fontSize: isMobile ? '0.7rem' : '0.8rem',
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

            <div style={{ padding: isMobile ? '10px 15px' : '20px 30px' }}>
                <section>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        margin: '30px 0 20px 0',
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                    }}>
                        <h3 style={{ 
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            marginBottom: isMobile ? '10px' : 0,
                            width: isMobile ? '100%' : 'auto'  
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
                                    fontSize: isMobile ? '0.9rem' : 'inherit',
                                    opacity: page >= totalPages ? 0.7 : 1,
                                    marginLeft: isMobile ? 'auto' : 0
                                }}
                            >
                                {loading ? 'Loading...' : 'See more'} <span style={{ fontSize: '1.2rem' }}>→</span>
                            </button>
                        )}
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile 
                            ? 'repeat(auto-fill, minmax(120px, 1fr))' 
                            : isTablet
                                ? 'repeat(auto-fill, minmax(150px, 1fr))'
                                : 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: isMobile ? '15px' : '25px',
                        padding: '10px 0'
                    }}>
                        {filteredMovies.length > 0 ? (
                            filteredMovies.map((movie) => (
                                <div 
                                    key={movie.id}
                                    style={{
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.3s ease',
                                        cursor: 'pointer',
                                        ':hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                    onClick={() => updateFeaturedMovie(movie)}
                                >
                                    <img 
                                        src={movie.poster_path 
                                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                            : 'https://via.placeholder.com/180x270?text=No+Poster'}
                                        alt={movie.title}
                                        style={{
                                            width: '100%',
                                            height: isMobile ? '180px' : isTablet ? '225px' : '270px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '1px solid #333'
                                        }}
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
                                                fontWeight: 'bold'
                                            }}>
                                                ★ {movie.vote_average?.toFixed(1) || '0.0'}
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
                                {searchQuery ? `No movies found matching "${searchQuery}"` : 
                                    'No movies available'
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
}

export default LandPage;