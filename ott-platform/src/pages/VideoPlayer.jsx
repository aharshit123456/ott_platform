import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FastPixPlayer from '../components/FastPixPlayer';

const VideoPlayer = () => {
    const { id } = useParams();

    // In a real app, you'd fetch metadata here based on ID.
    // For now, we just pass the ID to the player.
    // If it's a demo ID that isn't real, FastPix might show an error, but that's expected.

    const playbackId = id === 'demo-2' || id === 'demo-3' || id === 'demo-4'
        ? 'd983edb7-c672-4474-8e41-adc8d4d83b05' // Fallback to working demo ID for other items
        : id;

    return (
        <Layout>
            <div style={{ marginBottom: '20px' }}>
                <Link to="/" style={{
                    display: 'inline-block',
                    backgroundColor: 'white',
                    border: 'var(--comic-border)',
                    padding: '5px 15px',
                    textDecoration: 'none',
                    color: 'black',
                    fontWeight: 'bold',
                    marginBottom: '15px'
                }}>
                    &larr; BACK TO LIST
                </Link>
            </div>

            <div className="video-section">
                <h2 style={{
                    backgroundColor: 'var(--comic-secondary)',
                    display: 'inline-block',
                    padding: '5px 10px',
                    border: 'var(--comic-border)',
                    transform: 'skew(-10deg)'
                }}>
                    NOW PLAYING
                </h2>

                <FastPixPlayer playbackId={playbackId} />

                <div className="video-details" style={{
                    backgroundColor: 'white',
                    border: 'var(--comic-border)',
                    padding: '20px',
                    marginTop: '20px'
                }}>
                    <h3>Episode Details</h3>
                    <p>Viewing ID: {id}</p>
                    <p>Enjoy the show!</p>
                </div>
            </div>
        </Layout>
    );
};

export default VideoPlayer;
