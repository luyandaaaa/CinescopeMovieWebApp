import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faDownload, faArrowLeft, faStar, faTimes } from '@fortawesome/free-solid-svg-icons';

function MovieDetails({ movie, onBack, trailerKey }) {
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showTrailer, setShowTrailer] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    // Handle window resize events to update mobile state
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            // Close trailer automatically on small screens when resizing
            if (window.innerWidth <= 768 && showTrailer) {
                setShowTrailer(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showTrailer]);
    
    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                
                const detailsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}?api_key=02d2d30e38f07e116dd9f4ec122a4a27&language=en-US`
                );
                const detailsData = await detailsResponse.json();
                setMovieDetails(detailsData);
                
                const creditsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=02d2d30e38f07e116dd9f4ec122a4a27`
                );
                const creditsData = await creditsResponse.json();
                setCast(creditsData.cast);
                
                const similarResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=02d2d30e38f07e116dd9f4ec122a4a27&language=en-US&page=1`
                );
                const similarData = await similarResponse.json();
                setRelatedMovies(similarData.results.slice(0, 6));
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching movie details:", error);
                setLoading(false);
            }
        };

        if (movie) {
            fetchMovieDetails();
        }
    }, [movie]);
    
    const handleDownload = () => {
        if (trailerKey) {
            window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
            alert("For actual downloading, you would need a server-side solution to handle YouTube video downloads.");
        }
    };
    
    const toggleTrailer = () => {
        setShowTrailer(!showTrailer);
    };
    
    if (loading) {
        return (
            <div style={{ 
                backgroundColor: '#0f0f1a', 
                minHeight: '100vh', 
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.5rem',
                padding: '20px'
            }}>
                Loading movie details...
            </div>
        );
    }
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'overview':
                return (
                    <div style={{ padding: '25px 0' }}>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                            {movie.overview || 'No overview available for this movie.'}
                        </p>
                    </div>
                );
            case 'cast':
                return (
                    <div style={{ padding: '25px 0' }}>
                        {cast.length === 0 ? (
                            <p>No cast information available.</p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100px' : '150px'}, 1fr))`,
                                gap: isMobile ? '15px' : '20px'
                            }}>
                                {cast.map(person => (
                                    <div key={person.id} style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: isMobile ? '80px' : '120px',
                                            height: isMobile ? '80px' : '120px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            margin: '0 auto 10px auto',
                                            border: '2px solid #333'
                                        }}>
                                            <img 
                                                src={person.profile_path 
                                                    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                                    : 'https://via.placeholder.com/185x185?text=No+Image'}
                                                alt={person.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                        <h4 style={{ 
                                            margin: '0 0 5px 0', 
                                            fontSize: isMobile ? '0.85rem' : '1rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {person.name}
                                        </h4>
                                        <p style={{ 
                                            margin: 0, 
                                            fontSize: isMobile ? '0.75rem' : '0.9rem', 
                                            color: '#aaa',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {person.character}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'related':
                return (
                    <div style={{ padding: '25px 0' }}>
                        {relatedMovies.length === 0 ? (
                            <p>No related movies available.</p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '120px' : '180px'}, 1fr))`,
                                gap: isMobile ? '15px' : '25px'
                            }}>
                                {relatedMovies.map(relatedMovie => (
                                    <div 
                                        key={relatedMovie.id}
                                        style={{
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <img 
                                            src={relatedMovie.poster_path 
                                                ? `https://image.tmdb.org/t/p/w500${relatedMovie.poster_path}`
                                                : 'https://via.placeholder.com/180x270?text=No+Poster'}
                                            alt={relatedMovie.title}
                                            style={{
                                                width: '100%',
                                                height: isMobile ? '180px' : '270px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid #333'
                                            }}
                                        />
                                        <div style={{ padding: '12px 5px' }}>
                                            <h4 style={{ 
                                                margin: '0 0 5px 0', 
                                                fontSize: isMobile ? '0.85rem' : '0.95rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {relatedMovie.title}
                                            </h4>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                fontSize: isMobile ? '0.75rem' : '0.85rem'
                                            }}>
                                                <span style={{ color: '#aaa' }}>
                                                    {relatedMovie.release_date?.split('-')[0] || 'N/A'}
                                                </span>
                                                <span style={{ 
                                                    color: '#FFD700',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ★ {relatedMovie.vote_average?.toFixed(1) || '0.0'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return <div>Select a tab</div>;
        }
    };
    
    return (
        <div style={{ 
            backgroundColor: '#0f0f1a', 
            minHeight: '100vh', 
            color: 'white',
            position: 'relative' 
        }}>
            {/* Hero Section with Movie Background */}
            <div style={{
                position: 'relative',
                height: isMobile ? '50vh' : '70vh',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                {/* Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.4)'
                }}></div>
                
                {/* Back Button */}
                <button 
                    onClick={onBack}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                
                {/* Movie Info Section */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    width: isMobile || !showTrailer ? '100%' : '60%',
                    padding: isMobile ? '20px' : '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    transition: 'width 0.3s ease'
                }}>
                    <div style={{ maxWidth: '800px' }}>
                        <h1 style={{ 
                            fontSize: isMobile ? '1.8rem' : '3rem', 
                            marginBottom: '10px',
                            wordBreak: 'break-word'
                        }}>
                            {movie.title}
                        </h1>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: isMobile ? '10px' : '20px',
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ 
                                backgroundColor: '#e50914',
                                padding: '5px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: isMobile ? '0.85rem' : 'inherit'
                            }}>
                                <FontAwesomeIcon icon={faStar} style={{ marginRight: '5px', color: '#FFD700' }} />
                                {movie.vote_average?.toFixed(1) || 'N/A'}/10
                            </span>
                            
                            <span style={{ fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                {movie.release_date?.split('-')[0] || 'N/A'}
                            </span>
                            
                            {movieDetails && movieDetails.runtime && (
                                <span style={{ fontSize: isMobile ? '0.85rem' : 'inherit' }}>
                                    {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m
                                </span>
                            )}
                        </div>
                        
                        {/* Genres */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            marginBottom: '20px', 
                            flexWrap: 'wrap'
                        }}>
                            {movieDetails && movieDetails.genres && movieDetails.genres.map(genre => (
                                <span 
                                    key={genre.id}
                                    style={{
                                        border: '1px solid white',
                                        padding: isMobile ? '3px 8px' : '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                                    }}
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                        
                        {/* Watch & Download Buttons */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '15px',
                            flexWrap: isMobile ? 'wrap' : 'nowrap'
                        }}>
                            <button 
                                onClick={toggleTrailer}
                                style={{
                                    backgroundColor: '#e50914',
                                    color: 'white',
                                    border: 'none',
                                    padding: isMobile ? '10px 16px' : '12px 24px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '0.9rem' : 'inherit',
                                    width: isMobile ? '100%' : 'auto',
                                    justifyContent: isMobile ? 'center' : 'flex-start'
                                }}
                            >
                                <FontAwesomeIcon icon={faPlay} /> Watch Trailer
                            </button>
                            
                            <button 
                                onClick={handleDownload}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '2px solid white',
                                    padding: isMobile ? '10px 16px' : '12px 24px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '0.9rem' : 'inherit',
                                    width: isMobile ? '100%' : 'auto',
                                    justifyContent: isMobile ? 'center' : 'flex-start'
                                }}
                            >
                                <FontAwesomeIcon icon={faDownload} /> Download
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trailer Section - only shown on non-mobile or when explicitly toggled */}
                {showTrailer && (
                    <div style={{
                        width: isMobile ? '100%' : '40%',
                        position: isMobile ? 'fixed' : 'relative',
                        top: isMobile ? 0 : 'auto',
                        left: isMobile ? 0 : 'auto',
                        right: isMobile ? 0 : 'auto',
                        bottom: isMobile ? 0 : 'auto',
                        height: isMobile ? '100%' : 'auto',
                        zIndex: isMobile ? 1000 : 2,
                        padding: isMobile ? '20px' : '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.95)' : 'transparent'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            paddingBottom: '56.25%', /* 16:9 aspect ratio */
                            height: 0,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}>
                            <iframe 
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                                title="Movie Trailer"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <button
                            onClick={toggleTrailer}
                            style={{
                                alignSelf: isMobile ? 'center' : 'flex-end',
                                marginTop: '15px',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '0.9rem' : 'inherit'
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} /> Close Trailer
                        </button>
                    </div>
                )}
            </div>
            
            {/* Content Container */}
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto',
                padding: isMobile ? '0 20px' : '0 40px'
            }}>
                {/* Horizontal Navbar */}
                <div style={{ 
                    display: 'flex',
                    borderBottom: '1px solid #333',
                    margin: '20px 0 0 0',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap'
                }}>
                    <button 
                        onClick={() => setActiveTab('overview')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 30px',
                            fontSize: isMobile ? '1rem' : '1.2rem',
                            backgroundColor: 'transparent',
                            color: activeTab === 'overview' ? '#e50914' : 'white',
                            border: 'none',
                            borderBottom: activeTab === 'overview' ? '3px solid #e50914' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Overview
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('cast')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 30px',
                            fontSize: isMobile ? '1rem' : '1.2rem',
                            backgroundColor: 'transparent',
                            color: activeTab === 'cast' ? '#e50914' : 'white',
                            border: 'none',
                            borderBottom: activeTab === 'cast' ? '3px solid #e50914' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'cast' ? 'bold' : 'normal',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Cast
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('related')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 30px',
                            fontSize: isMobile ? '1rem' : '1.2rem',
                            backgroundColor: 'transparent',
                            color: activeTab === 'related' ? '#e50914' : 'white',
                            border: 'none',
                            borderBottom: activeTab === 'related' ? '3px solid #e50914' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'related' ? 'bold' : 'normal',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Related Movies
                    </button>
                </div>
                
                {/* Dynamic Content based on active tab */}
                {renderTabContent()}
            </div>
        </div>
    );
}

export default MovieDetails;