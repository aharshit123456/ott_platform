import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FastPixPlayer from '../components/FastPixPlayer';
import VidRockPlayer from '../components/VidRockPlayer';
import { useAuth } from '../context/AuthContext';
import ClickEffects from '../components/ClickEffects';
import { supabase } from '../supabaseClient';
import SEO from '../components/SEO';

import GiscusComments from '../components/GiscusComments';

const VideoPlayer = () => {
    const { id } = useParams();
    const { user } = useAuth();

    // Theme detection for Giscus
    const [isDark, setIsDark] = useState(localStorage.getItem('noir-mode') === 'true');

    useEffect(() => {
        // Listen for theme changes if needed, but for now simple check is fine
        // since Giscus component also re-renders on prop change
        const checkTheme = () => {
            setIsDark(localStorage.getItem('noir-mode') === 'true');
        };
        window.addEventListener('storage', checkTheme);
        // Also poll slightly because localStorage events don't fire in the same tab
        const interval = setInterval(checkTheme, 1000);
        return () => {
            window.removeEventListener('storage', checkTheme);
            clearInterval(interval);
        };
    }, []);

    // State
    const [movie, setMovie] = useState(null);
    const [isInPullList, setIsInPullList] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [useVidRock, setUseVidRock] = useState(false);

    // Resolved playbackId for FastPix
    const playbackId = id.includes('demo')
        ? 'd983edb7-c672-4474-8e41-adc8d4d83b05'
        : id;

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Movie Details
                // We'll try to find the movie by playbackId OR numeric ID
                const movieRes = await fetch(`${import.meta.env.VITE_API_URL}/movies/`);
                if (movieRes.ok) {
                    const allMovies = await movieRes.json();
                    const foundMovie = allMovies.find(m =>
                        m.id.toString() === id ||
                        m.fastpix_playback_id === id ||
                        (id.includes('demo') && m.title?.toLowerCase().includes('demo'))
                    );

                    if (foundMovie) {
                        setMovie(foundMovie);
                        // If movie has tmdb_id, default to VidRock if requested or if no FastPix
                        const vidRockEnabled = localStorage.getItem('vidrock-enabled') !== 'false';
                        if (foundMovie.tmdb_id && vidRockEnabled) {
                            setUseVidRock(true);
                        }
                    } else {
                        // If not found in DB, check if the ID itself is a TMDB ID (all numeric)
                        const vidRockEnabled = localStorage.getItem('vidrock-enabled') !== 'false';
                        if (/^\d+$/.test(id) && vidRockEnabled) {
                            console.log("No DB entry found, but ID appears to be a TMDB ID. Fetching TMDB details...");
                            const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
                            let fetchedTitle = "External Title";
                            let fetchedDesc = "No description available.";
                            let fetchedThumbnail = null;

                            if (tmdbKey) {
                                try {
                                    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}`);
                                    if (tmdbRes.ok) {
                                        const tmdbData = await tmdbRes.json();
                                        fetchedTitle = tmdbData.title;
                                        fetchedDesc = tmdbData.overview;
                                        if (tmdbData.poster_path) {
                                            fetchedThumbnail = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
                                        }
                                    }
                                } catch (tmdbErr) {
                                    console.warn("Failed to fetch TMDB details:", tmdbErr);
                                }
                            }

                            setMovie({
                                title: fetchedTitle,
                                description: fetchedDesc,
                                tmdb_id: parseInt(id),
                                media_type: 'movie',
                                thumbnail_url: fetchedThumbnail
                            });
                            setUseVidRock(true);
                        }
                    }
                }

                // 2. Fetch Watchlist status
                if (user) {
                    const token = (await supabase.auth.getSession()).data.session?.access_token;
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${user.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        // Check if movie.id is in watchlist
                        // Note: we need movie.id which we just fetched
                    }
                }

                // 3. Fetch Reviews
                // We need the numeric ID for reviews
                const targetId = movie?.id || id;
                const reviewsRes = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${targetId}`);
                if (reviewsRes.ok) {
                    const data = await reviewsRes.json();
                    setReviews(data);
                }

            } catch (e) {
                console.error("Failed to fetch video data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, user]);

    // Update watchlist status once movie is loaded
    useEffect(() => {
        if (!movie || !user) return;
        const checkWatchlist = async () => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const found = data.find(item => item.movie_id === movie.id);
                setIsInPullList(!!found);
            }
        };
        checkWatchlist();
    }, [movie, user]);

    const togglePullList = async () => {
        if (!user || !movie) return alert("Login required!");

        const token = (await supabase.auth.getSession()).data.session?.access_token;

        try {
            if (isInPullList) {
                await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${user.id}/${movie.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsInPullList(false);
            } else {
                await fetch(`${import.meta.env.VITE_API_URL}/watchlist/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: user.id, movie_id: movie.id })
                });
                setIsInPullList(true);
            }
        } catch (e) {
            console.error("Watchlist toggle failed", e);
            alert(`Watchlist error: ${e.message}`);
        }
    };

    const submitReview = async () => {
        if (!user || !movie) return alert("Login required!");
        if (userRating === 0) return alert("Rate it first!");

        const token = (await supabase.auth.getSession()).data.session?.access_token;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    movie_id: movie.id,
                    rating: userRating,
                    comment: userComment
                })
            });

            if (res.ok) {
                const newReview = await res.json();
                setReviews([...reviews, newReview]);
                setUserComment("");
                setUserRating(0);
            } else {
                const errText = await res.text();
                alert(`Backend Error: ${errText}`);
            }
        } catch (e) {
            console.error("Review failed", e);
            alert(`Review error: ${e.message}`);
        }
    };

    if (loading) return <Layout><div className="comic-container"><h2>CHARGING CAPACITORS...</h2></div></Layout>;

    return (
        <Layout>
            {movie && (
                <SEO
                    title={movie.title}
                    description={movie.description || `Watch ${movie.title} on Wham! OTT.`}
                    image={movie.thumbnail_url}
                    url={`https://wham.cosq.in/watch/${id}`}
                />
            )}
            <ClickEffects />
            <div style={{ marginBottom: '20px' }}>
                <Link to="/" style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--comic-surface)',
                    border: 'var(--comic-border)',
                    padding: '5px 15px',
                    textDecoration: 'none',
                    color: 'var(--comic-text)',
                    fontWeight: 'bold',
                    boxShadow: 'var(--comic-shadow)'
                }}>
                    &larr; BACK TO RACK
                </Link>
            </div>

            <div className="video-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h1 style={{
                        backgroundColor: 'var(--comic-secondary)',
                        display: 'inline-block',
                        padding: '5px 10px',
                        border: 'var(--comic-border)',
                        transform: 'skew(-10deg)',
                        margin: 0,
                        fontSize: '2rem'
                    }}>
                        {movie ? movie.title : "NOW PLAYING"}
                    </h1>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {movie?.tmdb_id && movie?.fastpix_playback_id && (
                            <button
                                onClick={() => setUseVidRock(!useVidRock)}
                                style={{
                                    backgroundColor: 'var(--comic-text)',
                                    color: 'var(--comic-bg)',
                                    border: 'var(--comic-border)',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-heading)'
                                }}
                            >
                                SWITCH TO {useVidRock ? 'FASTPIX' : 'VIDROCK'}
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <a
                                href={`https://twitter.com/intent/tweet?text=Reading ${movie?.title || 'a comic'} on Wham! OTT&url=${window.location.href}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    backgroundColor: '#1DA1F2',
                                    color: 'white',
                                    border: 'var(--comic-border)',
                                    padding: '10px',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--font-heading)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                TWEET
                            </a>
                            <button onClick={togglePullList} style={{
                                backgroundColor: isInPullList ? '#ccc' : 'var(--comic-primary)',
                                color: isInPullList ? '#666' : 'white',
                                border: 'var(--comic-border)',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.2rem'
                            }}>
                                {isInPullList ? "- REMOVE" : "+ ADD"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="player-wrapper">
                    {useVidRock && movie?.tmdb_id ? (
                        <VidRockPlayer tmdbId={movie.tmdb_id} type={movie.media_type || 'movie'} />
                    ) : (
                        <FastPixPlayer playbackId={playbackId} />
                    )}
                </div>

                <div className="video-details" style={{
                    backgroundColor: 'var(--comic-surface)',
                    border: 'var(--comic-border)',
                    padding: '20px',
                    marginTop: '20px',
                    boxShadow: 'var(--comic-shadow)',
                    color: 'var(--comic-text)'
                }}>
                    <h3>ISSUE DETAILS: {movie ? movie.title : `#${id}`}</h3>
                    <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>
                        {movie?.description || "No description available for this issue."}
                    </p>

                    {movie?.tmdb_id && (
                        <p style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 'bold' }}>SOURCE DATA: </span>
                            <a
                                href={`https://www.themoviedb.org/movie/${movie.tmdb_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--comic-accent)', textDecoration: 'underline' }}
                            >
                                View on TheMovieDB ↗
                            </a>
                        </p>
                    )}

                    {/* Rating Section */}
                    <div style={{ marginTop: '20px', borderTop: '2px dashed var(--comic-text)', paddingTop: '20px' }}>
                        <h4>RATE THIS ISSUE:</h4>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    style={{
                                        fontSize: '2rem',
                                        cursor: 'pointer',
                                        color: star <= userRating ? 'var(--comic-primary)' : '#ccc'
                                    }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Write your review here, true believer..."
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                fontFamily: 'var(--font-body)',
                                padding: '10px',
                                border: '2px solid var(--comic-text)',
                                backgroundColor: 'var(--comic-bg)',
                                color: 'var(--comic-text)'
                            }}
                        />
                        <button onClick={submitReview} style={{ marginTop: '10px' }}>POST REVIEW</button>
                    </div>

                    {/* Reviews List */}
                    <div style={{ marginTop: '30px' }}>
                        <h4>FAN MAIL ({reviews.length})</h4>
                        {reviews.length === 0 && <p>Be the first to write in!</p>}
                        {reviews.map((rev, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--comic-text)', padding: '10px 0' }}>
                                <div>{"★".repeat(rev.rating)}</div>
                                <p>{rev.comment}</p>
                                <small style={{ color: '#666' }}>- Fan #{rev.user_id ? rev.user_id.substring(0, 8) : 'Anon'}</small>
                            </div>
                        ))}
                    </div>

                    {/* Giscus External Comments */}
                    <GiscusComments theme={isDark ? 'dark' : 'light'} />
                </div>
            </div>
        </Layout>
    );
};

export default VideoPlayer;

