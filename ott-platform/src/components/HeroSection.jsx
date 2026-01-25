import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotation logic
    useEffect(() => {
        if (!movies || movies.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, [movies]);

    if (!movies || movies.length === 0) return null;

    const movie = movies[currentIndex];

    const nextSlide = () => setCurrentIndex((currentIndex + 1) % movies.length);
    const prevSlide = () => setCurrentIndex((currentIndex - 1 + movies.length) % movies.length);

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
            {/* Background Image - with Transition Effect Hack */}
            {movies.map((m, i) => (
                <div key={m.id} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: i === currentIndex ? 0.8 : 0,
                    transition: 'opacity 1s ease-in-out',
                    zIndex: 0
                }}>
                    <img
                        src={m.thumbnail}
                        alt={m.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        fetchPriority={i === currentIndex ? "high" : "low"}
                        loading={i === currentIndex ? "eager" : "lazy"}
                    />
                </div>
            ))}

            {/* Comic Panel Overlay (Gradient) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, var(--comic-bg) 20%, transparent 80%)',
                zIndex: 1
            }}></div>

            {/* "Page 1 Panel X" Tag */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'var(--comic-secondary)',
                color: 'var(--comic-text)',
                fontWeight: 'bold',
                padding: '5px 10px',
                border: 'var(--comic-border)',
                transform: 'rotate(-2deg)',
                boxShadow: 'var(--comic-shadow)',
                zIndex: 2
            }}>
                PAGE 1 | PANEL {currentIndex + 1}
            </div>

            {/* Navigation Buttons */}
            <button onClick={prevSlide} style={{
                position: 'absolute', top: '50%', left: '10px', zIndex: 10, borderRadius: '50%', width: '40px', height: '40px', padding: 0, transform: 'translateY(-50%)'
            }}>&lt;</button>
            <button onClick={nextSlide} style={{
                position: 'absolute', top: '50%', right: '10px', zIndex: 10, borderRadius: '50%', width: '40px', height: '40px', padding: 0, transform: 'translateY(-50%)'
            }}>&gt;</button>

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
                    boxShadow: 'var(--comic-shadow)',
                    marginBottom: '20px',
                    transition: 'all 0.5s'
                }}>
                    <h2 style={{
                        fontSize: '3rem',
                        marginBottom: '10px'
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
                            color: 'var(--comic-bg)',
                            border: 'var(--comic-border)'
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
