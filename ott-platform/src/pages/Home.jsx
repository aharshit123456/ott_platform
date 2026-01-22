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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <Layout>
            <ClickEffects />
            {loading && <p>Loading comics...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {!loading && !error && videos.length > 0 && (
                <>
                    {/* Pass all videos for carousel */}
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
