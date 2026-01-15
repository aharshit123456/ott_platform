import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div className="comic-layout">
            <header style={{
                backgroundColor: 'var(--comic-primary)',
                borderBottom: 'var(--comic-border)',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '2px 2px white' }}>
                        WHAM! OTT
                    </h1>
                </Link>
                <div className="user-badge" style={{
                    backgroundColor: 'white',
                    border: 'var(--comic-border)',
                    padding: '5px 10px',
                    fontWeight: 'bold',
                    transform: 'rotate(-2deg)'
                }}>
                    AHARSHIT
                </div>
            </header>

            <main className="comic-container" style={{ minHeight: '80vh' }}>
                {children}
            </main>

            <footer style={{
                backgroundColor: 'black',
                color: 'white',
                padding: '20px',
                textAlign: 'center',
                marginTop: '2rem',
                fontFamily: 'var(--font-heading)'
            }}>
                <p>&copy; 2026 SUPER STREAMING SQUAD</p>
            </footer>
        </div>
    );
};

export default Layout;
