import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

const Profile = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user) return;
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/user/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (e) {
                console.error("Failed to fetch user reviews", e);
            }
        };
        fetchReviews();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (!user) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h2>Identify Yourself!</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                        <Link to="/login" style={{
                            textDecoration: 'none',
                            color: 'black',
                            fontWeight: 'bold',
                            backgroundColor: 'white',
                            padding: '15px',
                            border: '2px solid black',
                            boxShadow: '4px 4px 0px 0px #000000',
                            fontSize: '1.2rem'
                        }}>
                            LOGIN
                        </Link>
                        <Link to="/signup" style={{
                            textDecoration: 'none',
                            color: 'white',
                            fontWeight: 'bold',
                            backgroundColor: 'black',
                            padding: '15px',
                            border: '2px solid black',
                            boxShadow: '4px 4px 0px 0px #000000',
                            fontSize: '1.2rem'
                        }}>
                            JOIN THE SQUAD (SIGN UP)
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Citizen Profile</h2>

                <div className="comic-card" style={{
                    background: 'white',
                    border: '3px solid black',
                    padding: '2rem',
                    maxWidth: '400px',
                    margin: '0 auto',
                    boxShadow: '8px 8px 0px 0px #000000'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: '#eee',
                        margin: '0 auto 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid black'
                    }}>
                        <span style={{ fontSize: '3rem' }}>👤</span>
                    </div>

                    <h3>{user.user_metadata?.username || 'Hero'}</h3>
                    <p>{user.email}</p>

                    <hr style={{ border: '2px solid black', margin: '1.5rem 0' }} />

                    <button onClick={handleLogout} style={{ width: '100%' }}>
                        LOGOUT
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'left', maxWidth: '800px', margin: '3rem auto' }}>
                <h3 style={{ borderBottom: '3px solid black', paddingBottom: '10px', textTransform: 'uppercase' }}>My Reviews / Rants</h3>

                {reviews.length === 0 ? (
                    <p style={{ fontStyle: 'italic', marginTop: '1rem' }}>No reviews yet. Go watch something!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        {reviews.map((review) => (
                            <div key={review.id} style={{
                                border: '2px solid black',
                                padding: '1rem',
                                display: 'flex',
                                gap: '1rem',
                                background: '#fff',
                                boxShadow: '4px 4px 0px 0px #000'
                            }}>
                                {/* Movie Thumbnail if available */}
                                {review.movies && (
                                    <div style={{ width: '80px', height: '120px', flexShrink: 0, background: '#eee', border: '2px solid black' }}>
                                        <img
                                            src={review.movies.thumbnail_url}
                                            alt={review.movies.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                                        {review.movies?.title || 'Unknown Movie'}
                                    </h4>
                                    <div style={{ color: '#e63946', fontWeight: 'bold', marginBottom: '5px' }}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>"{review.comment}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Profile;
