import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    const { user, loading, signOut } = useAuth();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [showSplash, setShowSplash] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('noir-mode');
        return saved === 'true';
    });

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setShowSplash(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('noir-mode');
        } else {
            document.body.classList.remove('noir-mode');
        }
        localStorage.setItem('noir-mode', isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    if (showSplash || loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--comic-primary)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}>
                <h1 style={{
                    fontSize: '4rem',
                    color: 'var(--comic-text)',
                    fontFamily: "'Bangers', cursive",
                    animation: 'bounce 1s infinite'
                }}>
                    WHAM! OTT
                </h1>
                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="comic-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--comic-text)' }}>
                    {isHome ? (
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>
                            WHAM! OTT
                        </h1>
                    ) : (
                        <div style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            WHAM! OTT
                        </div>
                    )}
                </Link>
                <div className="desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            padding: '5px 10px',
                            fontSize: '1rem',
                            marginRight: '10px',
                            backgroundColor: isDarkMode ? 'white' : 'black',
                            color: isDarkMode ? 'black' : 'white',
                            border: '2px solid black'
                        }}
                    >
                        {isDarkMode ? '☀️ LIGHT' : '🌙 NOIR'}
                    </button>
                    {user ? (
                        <>
                            <Link to="/pull-list" style={{
                                marginRight: '15px',
                                textDecoration: 'none',
                                color: 'var(--comic-text)',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                fontFamily: 'var(--font-heading)',
                                borderBottom: '2px solid transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.borderBottom = '2px solid var(--comic-text)'}
                                onMouseLeave={(e) => e.target.style.borderBottom = '2px solid transparent'}
                            >
                                MY PULL LIST
                            </Link>
                            <div className="user-badge" style={{
                                backgroundColor: 'var(--comic-surface)',
                                border: 'var(--comic-border)',
                                padding: '5px 10px',
                                fontWeight: 'bold',
                                transform: 'rotate(-2deg)',
                                color: 'var(--comic-text)'
                            }}>
                                {user.user_metadata?.username || user.email.split('@')[0].toUpperCase()}
                            </div>
                            <button onClick={signOut} style={{
                                background: 'var(--comic-text)',
                                color: 'var(--comic-bg)',
                                border: 'none',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link to="/login" style={{
                                textDecoration: 'none',
                                color: 'var(--comic-text)',
                                fontWeight: 'bold',
                                backgroundColor: 'var(--comic-surface)',
                                padding: '5px 10px',
                                border: '2px solid var(--comic-text)'
                            }}>
                                LOGIN
                            </Link>
                            <Link to="/signup" style={{
                                textDecoration: 'none',
                                color: 'white',
                                fontWeight: 'bold',
                                backgroundColor: 'black',
                                padding: '5px 10px',
                                border: '2px solid black'
                            }}>
                                JOIN
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <BottomNav />

            <main className="comic-container" style={{ flex: 1, position: 'relative' }}>
                {children}
            </main>

            <footer style={{
                backgroundColor: 'var(--comic-surface)',
                borderTop: '4px solid black',
                padding: '40px 20px',
                marginTop: '2rem',
                color: 'var(--comic-text)',
                boxShadow: '0 -4px 0 var(--comic-primary)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '40px',
                    textAlign: 'left'
                }}>
                    {/* Brand Column */}
                    <div>
                        <h3 style={{
                            fontFamily: "'Bangers', cursive",
                            fontSize: '2rem',
                            marginTop: 0,
                            marginBottom: '1rem',
                            color: 'var(--comic-primary)',
                            textShadow: '2px 2px 0 #000'
                        }}>WHAM! OTT</h3>
                        <p style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                            The ultimate destination for comic-styled entertainment. Streaming the ink directly to your screens in glorious Noir or Color.
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 style={{ borderBottom: '2px solid var(--comic-text)', paddingBottom: '10px', marginBottom: '15px' }}>NAVIGATION TOWER</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '10px' }}>
                                <Link to="/" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>&gt; HOME BASE</Link>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>&gt; CITIZEN PROFILE</Link>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <Link to="/pull-list" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>&gt; MY PULL LIST</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Access Column */}
                    <div>
                        <h4 style={{ borderBottom: '2px solid var(--comic-text)', paddingBottom: '10px', marginBottom: '15px' }}>ACCESS CONTROL</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '10px' }}>
                                <Link to="/login" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>&gt; LOGIN</Link>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <Link to="/signup" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>&gt; JOIN THE SQUAD</Link>
                            </li>
                        </ul>
                    </div>

                    {/* External Links / Socials */}
                    <div>
                        <h4 style={{ borderBottom: '2px solid var(--comic-text)', paddingBottom: '10px', marginBottom: '15px' }}>FOLLOW THE ACTION</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '10px' }}>
                                <a href="https://twitter.com/whamott" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>
                                    ↗ TWITTER (X)
                                </a>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <a href="https://instagram.com/whamott" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--comic-text)', fontWeight: 'bold' }}>
                                    ↗ INSTAGRAM
                                </a>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>
                                    ↗ POWERED BY TMDB
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    marginTop: '40px',
                    paddingTop: '20px',
                    borderTop: '2px dashed #666',
                    textAlign: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    opacity: 0.8
                }}>
                    <p>&copy; {new Date().getFullYear()} CosQ Entertainments Pvt. Ltd. // ALL RIGHTS RESERVED // "EXCELSIOR!"</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
