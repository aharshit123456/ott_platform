import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const ComicShelf = ({ title, items }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="comic-shelf" style={{ marginBottom: '40px', position: 'relative' }}>
            {/* Shelf Header */}
            <div style={{
                backgroundColor: 'var(--comic-secondary)',
                color: 'black',
                display: 'inline-block',
                padding: '5px 20px',
                border: 'var(--comic-border)',
                transform: 'skew(-10deg)',
                marginBottom: '10px',
                marginLeft: '20px',
                boxShadow: 'var(--comic-shadow)'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>{title}</h3>
            </div>

            {/* Navigation Buttons */}
            <div style={{ position: 'absolute', right: '20px', top: '0', zIndex: 5 }}>
                <button onClick={() => scroll('left')} style={{ marginRight: '5px', padding: '5px 10px' }}>&lt;</button>
                <button onClick={() => scroll('right')} style={{ padding: '5px 10px' }}>&gt;</button>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '20px',
                    padding: '20px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {items.map((item) => (
                    <div key={item.id} style={{ minWidth: '220px', maxWidth: '220px', flex: '0 0 auto' }}>
                        <Link to={`/watch/${item.id}`} style={{ textDecoration: 'none' }}>
                            <div className="comic-card" style={{
                                backgroundColor: 'white',
                                border: 'var(--comic-border)',
                                padding: '10px',
                                color: 'black',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div className="thumbnail" style={{
                                    height: '280px', // Portrait poster style
                                    backgroundColor: '#ccc',
                                    border: '2px solid black',
                                    marginBottom: '10px',
                                    backgroundImage: `url(${item.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}>
                                    {/* Play Icon/Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: 5,
                                        backgroundColor: 'var(--comic-secondary)',
                                        border: '2px solid black',
                                        padding: '2px 5px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        PLAY
                                    </div>
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{item.title}</h4>

                                {/* Speech Bubble - Hidden by default, shown on hover via CSS */}
                                <div className="speech-bubble" style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    left: '80%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'white',
                                    border: '2px solid black',
                                    borderRadius: '50% 50% 50% 0',
                                    padding: '10px',
                                    fontSize: '0.8rem',
                                    zIndex: 10,
                                    width: '120px',
                                    textAlign: 'center',
                                    boxShadow: '3px 3px 0 black',
                                    display: 'none', // Controlled by CSS
                                }}>
                                    <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                                        "{item.description ? (item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description) : "Must read!"}"
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}

                {/* Spacer for right padding */}
                <div style={{ minWidth: '20px' }}></div>
            </div>

            {/* Shelf Wood Look */}
            <div style={{
                height: '15px',
                backgroundColor: '#8B4513',
                borderTop: '3px solid black',
                borderBottom: '3px solid black',
                marginTop: '-10px',
                backgroundImage: 'linear-gradient(45deg, #A0522D 25%, transparent 25%, transparent 75%, #A0522D 75%, #A0522D), linear-gradient(45deg, #A0522D 25%, transparent 25%, transparent 75%, #A0522D 75%, #A0522D)',
                backgroundSize: '20px 20px',
                position: 'relative',
                zIndex: -1
            }}></div>
        </div>
    );
};

export default ComicShelf;
