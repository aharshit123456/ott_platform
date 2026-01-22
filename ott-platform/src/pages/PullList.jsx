import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ComicShelf from '../components/ComicShelf';
import { useAuth } from '../context/AuthContext';

const PullList = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchPullList = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlist/${user.id}`);
                if (!response.ok) throw new Error("Failed to fetch pull list");

                const data = await response.json();
                // data is array of watchlist entries joined with movies
                // Assuming structure: [{ movie_id: 1, movies: { ... } }, ...]

                const formatted = data.map(item => item.movies).filter(Boolean).map(movie => ({
                    id: movie.fastpix_playback_id || movie.id,
                    title: movie.title,
                    description: movie.description,
                    thumbnail: movie.thumbnail_url || 'https://picsum.photos/400/225'
                }));

                setVideos(formatted);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPullList();
    }, [user]);

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <div style={{
                    backgroundColor: 'var(--comic-secondary)',
                    transform: 'skew(-5deg)',
                    display: 'inline-block',
                    padding: '10px 20px',
                    border: '3px solid black',
                    marginBottom: '20px',
                    boxShadow: '4px 4px 0 black'
                }}>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>
                        MY PULL LIST
                    </h2>
                </div>

                {!user && (
                    <div style={{ backgroundColor: 'white', padding: '20px', border: '3px solid black' }}>
                        <p>Please <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>login</a> to view your reserved issues.</p>
                    </div>
                )}

                {user && loading && <p>Checking the back room...</p>}

                {user && !loading && (
                    videos.length > 0 ?
                        <ComicShelf title="Reserved Issues" items={videos} /> :
                        <div style={{ backgroundColor: 'white', padding: '20px', border: '3px solid black' }}>
                            <p>Your pull list is empty! Go browse the racks and add some titles.</p>
                        </div>
                )}
            </div>
        </Layout>
    );
};

export default PullList;
