import React from 'react';
import { Link } from 'react-router-dom';

const ContentGrid = ({ items }) => {
    return (
        <div className="comic-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            marginTop: '20px'
        }}>
            {items.map((item) => (
                <Link to={`/legacy/watch/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
                    <div className="comic-card" style={{
                        backgroundColor: 'white',
                        border: 'var(--comic-border)',
                        padding: '10px',
                        color: 'black',
                        transition: 'transform 0.2s',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div className="thumbnail" style={{
                            backgroundColor: '#ccc',
                            height: '160px',
                            border: '2px solid black',
                            marginBottom: '10px',
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'var(--comic-secondary)',
                                borderTop: '2px solid black',
                                borderLeft: '2px solid black',
                                padding: '2px 8px',
                                fontWeight: 'bold'
                            }}>
                                PLAY!
                            </div>
                        </div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{item.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', flexGrow: 1 }}>{item.description}</p>
                    </div>
                </Link>
            ))
            }
        </div >
    );
};

export default ContentGrid;
