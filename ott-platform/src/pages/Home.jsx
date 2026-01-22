import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';

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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <Layout>
            <section style={{
                marginBottom: '30px',
                border: 'var(--comic-border)',
                padding: '20px',
                backgroundColor: '#fff',
                position: 'relative'
            }}>
                <h2 style={{ fontSize: '2.5rem', textDecoration: 'underline decoration-wavy' }}>New Releases!</h2>
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    backgroundColor: 'var(--comic-accent)',
                    padding: '10px',
                    border: 'var(--comic-border)',
                    transform: 'rotate(5deg)',
                    fontWeight: 'bold',
                    zIndex: 1
                }}>
                    POW!
                </div>
                <p>Fresh from the render farm to your screen.</p>
            </section>

            {loading && <p>Loading comics...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {!loading && !error && <ContentGrid items={videos} />}
        </Layout>
    );
};

export default Home;
