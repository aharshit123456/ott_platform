import React, { useEffect, useRef } from 'react';
import '@fastpix/fp-player';

const FastPixPlayer = ({ playbackId }) => {
    const playerRef = useRef(null);

    return (
        <div className="player-container" style={{
            border: 'var(--comic-border)',
            boxShadow: 'var(--comic-shadow)',
            backgroundColor: 'black',
            padding: '5px',
            margin: '20px 0'
        }}>
            {/* 
        FastPix Player Custom Element
        Note: stream-type="on-demand" is default but good to be explicit 
      */}
            <fastpix-player
                ref={playerRef}
                playback-id={playbackId}
                stream-type="on-demand"
                style={{ width: '100%', height: 'auto', aspectRatio: '16/9', display: 'block' }}
            ></fastpix-player>
        </div>
    );
};

export default FastPixPlayer;
