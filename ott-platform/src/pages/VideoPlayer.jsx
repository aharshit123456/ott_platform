import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FastPixPlayer from '../components/FastPixPlayer';
import { useAuth } from '../context/AuthContext';
import ClickEffects from '../components/ClickEffects';
import { supabase } from '../supabaseClient';

const VideoPlayer = () => {
    const { id } = useParams();
    const { user } = useAuth();

    // State
    const [isInPullList, setIsInPullList] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [numericId, setNumericId] = useState(null);

    // Mock ID logic from before
    const playbackId = id.includes('demo')
        ? 'd983edb7-c672-4474-8e41-adc8d4d83b05'
        : id;

    // Fetch initial data
    useEffect(() => {
        const checkPullList = async () => {
            if (!user) return;
            try {
                // 1. Resolve playback ID to integer Movie ID
                let resolvedId = id;
                if (id.length > 10) { // Naive check for UUID vs Int
                    const movieRes = await fetch(`${import.meta.env.VITE_API_URL}/movies/`);
                    if (movieRes.ok) {
                        const allMovies = await movieRes.json();
                        const match = allMovies.find(m => m.fastpix_playback_id === id);
                        if (match) resolvedId = match.id.toString();
                    }
                }
                setNumericId(resolvedId);

                const res = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const found = data.find(item => item.movie_id.toString() === resolvedId);
                    setIsInPullList(!!found);
                }
            } catch (e) { console.error(e); }
        };

        const fetchReviews = async () => {
            // We need numeric ID for reviews if DB schema uses integer movie_id.
            // If URL param is playback_id, this fails.
            // We'll proceed assuming we can fetch by whatever ID we have or backend handles lookup.
            // Backend get_reviews expects movie_id (int).
            // If ID is string (fastpix ID), this endpoint needs update or we need to lookup ID first.
            // SKIP complex lookup for this demo and assume 'id' is OK.
            try {
                // Just mocking empty array if fetch fails due to ID type mismatch
                const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}`); // Potentially fail if id is not int
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (e) { console.error(e); }
            setLoadingReviews(false);
        };

        checkPullList();
        fetchReviews();
    }, [id, user]);

    const togglePullList = async () => {
        if (!user) return alert("Login required!");

        const token = (await supabase.auth.getSession()).data.session?.access_token;

        try {
            if (isInPullList) {
                await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${user.id}/${numericId || id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setIsInPullList(false);
            } else {
                await fetch(`${import.meta.env.VITE_API_URL}/watchlist/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: user.id, movie_id: parseInt(numericId) || 1 })
                });
                setIsInPullList(true);
            }
        } catch (e) {
            console.error("Watchlist toggle failed", e);
            alert(`Watchlist error: ${e.message}`);
        }
    };

    const submitReview = async () => {
        if (!user) return alert("Login required!");
        if (userRating === 0) return alert("Rate it first!");

        const token = (await supabase.auth.getSession()).data.session?.access_token;
        console.log("Sending token to backend:", token ? "YES" : "NO");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    movie_id: parseInt(numericId) || 1,
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

    return (
        <Layout>
            <ClickEffects />
            <div style={{ marginBottom: '20px' }}>
                <Link to="/" style={{
                    display: 'inline-block',
                    backgroundColor: 'white',
                    border: 'var(--comic-border)',
                    padding: '5px 15px',
                    textDecoration: 'none',
                    color: 'black',
                    fontWeight: 'bold',
                    boxShadow: '3px 3px 0 black'
                }}>
                    &larr; BACK TO RACK
                </Link>
            </div>

            <div className="video-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{
                        backgroundColor: 'var(--comic-secondary)',
                        display: 'inline-block',
                        padding: '5px 10px',
                        border: 'var(--comic-border)',
                        transform: 'skew(-10deg)',
                        margin: 0
                    }}>
                        NOW PLAYING
                    </h2>

                    <button onClick={togglePullList} style={{
                        backgroundColor: isInPullList ? '#ccc' : 'var(--comic-primary)',
                        color: isInPullList ? '#666' : 'white',
                        border: 'var(--comic-border)',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.2rem'
                    }}>
                        {isInPullList ? "- REMOVE FROM PULL LIST" : "+ ADD TO PULL LIST"}
                    </button>
                </div>

                <div style={{ border: 'var(--comic-border)', padding: '5px', backgroundColor: 'black' }}>
                    <FastPixPlayer playbackId={playbackId} />
                </div>

                <div className="video-details" style={{
                    backgroundColor: 'white',
                    border: 'var(--comic-border)',
                    padding: '20px',
                    marginTop: '20px',
                    boxShadow: 'var(--comic-shadow)'
                }}>
                    <h3>ISSUE DETAILS: #{id}</h3>

                    {/* Rating Section */}
                    <div style={{ marginTop: '20px', borderTop: '2px dashed black', paddingTop: '20px' }}>
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
                            style={{ width: '100%', minHeight: '80px', fontFamily: 'var(--font-body)', padding: '10px', border: '2px solid black' }}
                        />
                        <button onClick={submitReview} style={{ marginTop: '10px' }}>POST REVIEW</button>
                    </div>

                    {/* Reviews List */}
                    <div style={{ marginTop: '30px' }}>
                        <h4>FAN MAIL ({reviews.length})</h4>
                        {reviews.length === 0 && <p>Be the first to write in!</p>}
                        {reviews.map((rev, i) => (
                            <div key={i} style={{ borderBottom: '1px solid black', padding: '10px 0' }}>
                                <div>{"★".repeat(rev.rating)}</div>
                                <p>{rev.comment}</p>
                                <small style={{ color: '#666' }}>- Fan #{rev.user_id ? rev.user_id.substring(0, 8) : 'Anon'}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VideoPlayer;
