import React, { useEffect } from 'react';

const VidRockPlayer = ({ tmdbId, type = 'movie' }) => {
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== 'https://vidrock.net') return;

            if (event.data?.type === 'MEDIA_DATA') {
                const mediaData = event.data.data;
                console.log('VidRock Progress Update:', mediaData);
                localStorage.setItem('vidRockProgress', JSON.stringify(mediaData));
            }

            if (event.data?.type === 'PLAYER_EVENT') {
                const { event: eventType, currentTime, duration } = event.data.data;
                console.log(`VidRock Player ${eventType} at ${currentTime}s of ${duration}s`);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const embedUrl = `https://vidrock.net/${type}/${tmdbId}`;

    return (
        <div className="vidrock-player-container" style={{
            border: 'var(--comic-border)',
            boxShadow: 'var(--comic-shadow)',
            backgroundColor: 'black',
            padding: '5px',
            margin: '20px 0',
            position: 'relative',
            paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
            height: 0,
            overflow: 'hidden'
        }}>
            <iframe
                src={embedUrl}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                allowFullScreen
                title="VidRock Video Player"
            ></iframe>
        </div>
    );
};

export default VidRockPlayer;
