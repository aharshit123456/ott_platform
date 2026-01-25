import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ComicShelf = ({ title, items }) => {
    const scrollRef = useRef(null);
    const [displayItems, setDisplayItems] = useState([]);

    useEffect(() => {
        if (items && items.length > 0) {
            setDisplayItems([...items, ...items, ...items]);
        }
    }, [items]);

    useEffect(() => {
        if (scrollRef.current && items && items.length > 0) {
            setTimeout(() => {
                if (scrollRef.current) {
                    const singleSetWidth = items.length * 240;
                    scrollRef.current.scrollLeft = singleSetWidth;
                }
            }, 100);
        }
    }, [items]);

    const handleScroll = () => {
        if (!scrollRef.current || !items || items.length === 0) return;
        const { scrollLeft } = scrollRef.current;
        const singleSetWidth = items.length * 240;
        if (singleSetWidth === 0) return;

        if (scrollLeft < 50) {
            scrollRef.current.scrollLeft = singleSetWidth + scrollLeft;
        } else if (scrollLeft >= singleSetWidth * 2) {
            scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="comic-shelf" style={{ marginBottom: '40px', position: 'relative' }}>
            <div style={{
                backgroundColor: 'var(--comic-secondary)',
                color: 'var(--comic-text)',
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

            <div style={{ position: 'absolute', right: '20px', top: '0', zIndex: 5 }}>
                <button onClick={() => scroll('left')} style={{ marginRight: '5px', padding: '5px 10px' }}>&lt;</button>
                <button onClick={() => scroll('right')} style={{ padding: '5px 10px' }}>&gt;</button>
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '20px',
                    padding: '20px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {displayItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} style={{ minWidth: '220px', maxWidth: '220px', flex: '0 0 auto' }}>
                        <Link to={`/watch/${item.id}`} style={{ textDecoration: 'none' }}>
                            <div className="comic-card" style={{
                                backgroundColor: 'var(--comic-surface)',
                                border: 'var(--comic-border)',
                                padding: '10px',
                                color: 'var(--comic-text)',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div className="thumbnail" style={{
                                    height: '280px',
                                    backgroundColor: 'var(--comic-bg)',
                                    border: '2px solid var(--comic-text)',
                                    marginBottom: '10px',
                                    backgroundImage: `url(${item.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: 5,
                                        backgroundColor: 'var(--comic-secondary)',
                                        border: '2px solid var(--comic-text)',
                                        padding: '2px 5px',
                                        fontSize: '0.8rem',
                                        color: 'var(--comic-text)',
                                        fontWeight: 'bold'
                                    }}>
                                        PLAY
                                    </div>
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{item.title}</h4>

                                <div className="speech-bubble" style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    left: '80%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'var(--comic-surface)',
                                    border: '2px solid var(--comic-text)',
                                    borderRadius: '50% 50% 50% 0',
                                    padding: '10px',
                                    fontSize: '0.8rem',
                                    zIndex: 10,
                                    width: '120px',
                                    textAlign: 'center',
                                    boxShadow: '3px 3px 0 var(--comic-text)',
                                    display: 'none',
                                    color: 'var(--comic-text)'
                                }}>
                                    <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                                        "{item.description ? (item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description) : "Must read!"}"
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div style={{
                height: '15px',
                backgroundColor: '#5D2906',
                borderTop: 'var(--comic-border)',
                borderBottom: 'var(--comic-border)',
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
