import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ movie }) => {
    if (!movie) return null;

    return (
        <section className="hero-section" style={{
            marginBottom: '40px',
            border: 'var(--comic-border)',
            boxShadow: 'var(--comic-shadow)',
            position: 'relative',
            backgroundColor: '#000',
            color: 'white',
            overflow: 'hidden',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'flex-end'
        }}>
            {/* Background Image */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${movie.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.8
            }}></div>

            {/* Comic Panel Overlay (Gradient) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, black 20%, transparent 80%)'
            }}></div>

            {/* "Page 1 Panel 1" Tag */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'var(--comic-secondary)',
                color: 'black',
                fontWeight: 'bold',
                padding: '5px 10px',
                border: '2px solid black',
                transform: 'rotate(-2deg)',
                boxShadow: '3px 3px 0 black'
            }}>
                PAGE 1 | PANEL 1
            </div>

            {/* Content Box */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                padding: '30px',
                width: '100%'
            }}>
                <div style={{
                    backgroundColor: 'var(--comic-bg)',
                    color: 'var(--comic-text)',
                    padding: '20px',
                    border: 'var(--comic-border)',
                    maxWidth: '600px',
                    boxShadow: '5px 5px 0 black',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        fontSize: '3rem',
                        marginBottom: '10px',
                        textShadow: '2px 2px 0 var(--comic-secondary)'
                    }}>
                        {movie.title}
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '1.2rem',
                        marginBottom: '20px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>NARRATOR:</span> {movie.description}
                    </p>
                    <Link to={`/watch/${movie.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                            fontSize: '1.5rem',
                            backgroundColor: 'var(--comic-primary)',
                            color: 'white'
                        }}>
                            WATCH NOW!
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
