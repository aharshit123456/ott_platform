import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import HeroSection from '../components/HeroSection';
import ComicShelf from '../components/ComicShelf';
import ClickEffects from '../components/ClickEffects';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/movies/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }
                const data = await response.json();

                // Map backend keys to frontend expected keys
                const formattedVideos = data.map(movie => ({
                    id: movie.fastpix_playback_id || movie.id, // Use playback ID if available, else DB ID (fallback)
                    title: movie.title,
                    description: movie.description,
                    thumbnail: movie.thumbnail_url || 'https://picsum.photos/400/225' // Fallback thumbnail
                }));

                setVideos(formattedVideos);
            } catch (err) {
                console.error("Error fetching movies:", err);
                setError(`Failed to fetch from ${import.meta.env.VITE_API_URL}: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <Layout>
            <ClickEffects />
            {loading && (
                <div style={{ opacity: 0.5 }}>
                    <div style={{
                        height: '400px',
                        backgroundColor: '#222',
                        border: 'var(--comic-border)',
                        marginBottom: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <h2 style={{ color: 'white' }}>DRAWING THE COVERS...</h2>
                    </div>
                    {[1, 2].map(i => (
                        <div key={i} style={{ marginBottom: '40px' }}>
                            <div style={{ height: '30px', width: '200px', backgroundColor: '#ddd', marginBottom: '20px', border: '2px solid black' }}></div>
                            <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} style={{ width: '200px', height: '300px', backgroundColor: '#eee', border: '3px solid black' }}></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p style={{ color: 'red', padding: '20px', border: '2px solid black', background: 'white' }}>Error: {error}</p>}

            {!loading && !error && videos.length > 0 && (
                <>
                    <HeroSection movies={videos} />
                    <ComicShelf title="Fresh from the Ink!" items={videos} />
                    <ComicShelf title="Trending Issues" items={[...videos].reverse()} />
                </>
            )}

            {!loading && !error && videos.length === 0 && (
                <p>No comics found in the archives!</p>
            )}
        </Layout>
    );
};

export default Home;
