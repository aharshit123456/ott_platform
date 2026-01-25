import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import HeroSection from '../components/HeroSection';
import ComicShelf from '../components/ComicShelf';
import ClickEffects from '../components/ClickEffects';
import SEO from '../components/SEO';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
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
                    id: movie.fastpix_playback_id || movie.id,
                    dbId: movie.id,
                    tmdbId: movie.tmdb_id,
                    title: movie.title,
                    description: movie.description,
                    thumbnail: movie.thumbnail_url || 'https://picsum.photos/400/225'
                }));

                setVideos(formattedVideos);

                // 2. Fetch Trending from TMDB if API key exists AND enabled in settings
                const tmdbEnabled = localStorage.getItem('tmdb-enabled') !== 'false';
                const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
                if (tmdbKey && tmdbEnabled) {
                    try {
                        const tmdbRes = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}`);
                        if (tmdbRes.ok) {
                            const tmdbData = await tmdbRes.json();
                            const formattedTrending = tmdbData.results.map(m => ({
                                id: m.id.toString(),
                                title: m.title,
                                description: m.overview,
                                thumbnail: `https://image.tmdb.org/t/p/w500${m.poster_path}`
                            }));
                            setTrendingMovies(formattedTrending);
                        }
                    } catch (tmdbError) {
                        console.warn("Failed to fetch trending movies from TMDB:", tmdbError);
                    }
                }

                // 3. Load Continue Watching from LocalStorage
                const progress = JSON.parse(localStorage.getItem('vidRockProgress') || '[]');
                if (progress.length > 0) {
                    const formattedProgress = progress.map(p => ({
                        id: p.id.toString(),
                        title: p.title,
                        thumbnail: p.poster_path.startsWith('http') ? p.poster_path : `https://image.tmdb.org/t/p/w500${p.poster_path}`,
                        description: `Watched: ${Math.round((p.progress.watched / p.progress.duration) * 100)}%`
                    }));
                    setContinueWatching(formattedProgress);
                }
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
            <SEO
                title="Home | Stream the Ink"
                description="The ultimate comic-themed streaming platform. Watch original movies, series, and global trending hits in Noir mode."
                url="https://wham.cosq.in/"
            />
            <ClickEffects />
            {loading && (
                <div style={{ opacity: 0.5 }}>
                    <div style={{
                        height: '400px',
                        backgroundColor: 'var(--comic-surface)',
                        border: 'var(--comic-border)',
                        marginBottom: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <h2 style={{ color: 'var(--comic-text)' }}>DRAWING THE COVERS...</h2>
                    </div>
                    {[1, 2].map(i => (
                        <div key={i} style={{ marginBottom: '40px' }}>
                            <div style={{ height: '30px', width: '200px', backgroundColor: 'var(--comic-surface)', marginBottom: '20px', border: 'var(--comic-border)' }}></div>
                            <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} style={{ width: '200px', height: '300px', backgroundColor: 'var(--comic-surface)', border: 'var(--comic-border)', opacity: 0.3 }}></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p style={{ color: 'var(--comic-primary)', padding: '20px', border: 'var(--comic-border)', background: 'var(--comic-surface)' }}>Error: {error}</p>}

            {!loading && !error && (
                <>
                    {videos.length > 0 && <HeroSection movies={videos} />}

                    {continueWatching.length > 0 && (
                        <ComicShelf title="Back into Action!" items={continueWatching} />
                    )}

                    {trendingMovies.length > 0 && (
                        <ComicShelf title="TMDB Trending Right Now" items={trendingMovies} />
                    )}

                    {videos.length > 0 && (
                        <>
                            <ComicShelf title="Fresh from the Ink!" items={videos} />
                            <ComicShelf title="Trending Issues" items={[...videos].reverse()} />
                        </>
                    )}
                </>
            )}

            {!loading && !error && videos.length === 0 && trendingMovies.length === 0 && (
                <p>No comics found in the archives!</p>
            )}
        </Layout>
    );
};

export default Home;
