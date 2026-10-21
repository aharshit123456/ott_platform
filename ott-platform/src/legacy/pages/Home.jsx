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

                // 2. Fetch Trending from TMDB (proxied through backend to avoid
                // slow/blocked direct browser->TMDB requests in some regions)
                const tmdbEnabled = localStorage.getItem('tmdb-enabled') !== 'false';
                if (tmdbEnabled) {
                    try {
                        const tmdbRes = await fetch(`${import.meta.env.VITE_API_URL}/tmdb/trending`);
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
                <div style={{ opacity: 0.5, width: '100%' }}>
                    <div style={{
                        height: 'clamp(200px, 40vh, 400px)', // Responsive height
                        backgroundColor: 'var(--comic-surface)',
                        border: 'var(--comic-border)',
                        marginBottom: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        overflow: 'hidden'
                    }}>
                        <h2 style={{
                            color: 'var(--comic-text)',
                            fontSize: 'clamp(1.2rem, 4vw, 2rem)', // Responsive font
                            textAlign: 'center',
                            margin: 0,
                            padding: '10px'
                        }}>
                            DRAWING THE COVERS...
                        </h2>
                    </div>
                    {[1, 2].map(i => (
                        <div key={i} style={{ marginBottom: '40px' }}>
                            <div style={{ height: '30px', width: '200px', maxWidth: '50%', backgroundColor: 'var(--comic-surface)', marginBottom: '20px', border: 'var(--comic-border)' }}></div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', // Auto-responsive grid
                                gap: '20px',
                                width: '100%'
                            }}>
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} style={{
                                        aspectRatio: '2/3',
                                        backgroundColor: 'var(--comic-surface)',
                                        border: 'var(--comic-border)',
                                        opacity: 0.3,
                                        width: '100%' // Fill the grid cell
                                    }}></div>
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

                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontFamily: "'Bangers', cursive", color: 'var(--comic-primary)', fontSize: '2rem' }}>FROM THE EDITOR'S DESK</h2>
                        <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                            Welcome to <strong>Wham! OTT</strong>, the premier destination for graphic novel enthusiasts and cinema lovers alike.
                            We bridge the gap between static ink and moving pictures, delivering a unique <em>Noir-style</em> streaming experience.
                            Powered by cutting-edge technology from <a href="https://fastpix.io" target="_blank" rel="noreferrer" style={{ color: 'var(--comic-accent)' }}>FastPix</a> and
                            curated data from <a href="https://themoviedb.org" target="_blank" rel="noreferrer" style={{ color: 'var(--comic-accent)' }}>TMDB</a>,
                            we bring you the latest blockbusters, indie gems, and fan-favorite series. Dive into our collection, manage your "Pull List",
                            and join a community of heroes.
                        </p>
                    </div>

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
