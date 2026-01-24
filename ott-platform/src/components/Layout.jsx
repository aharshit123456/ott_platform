import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    const { user, loading, signOut } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        if (!loading) {
            // Keep splash screen for a bit to show off logic/branding
            const timer = setTimeout(() => setShowSplash(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

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
                    color: 'black',
                    textShadow: '4px 4px white',
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
                <div className="desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/pull-list" style={{
                                marginRight: '15px',
                                textDecoration: 'none',
                                color: 'black',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                fontFamily: 'var(--font-heading)',
                                borderBottom: '2px solid transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.borderBottom = '2px solid black'}
                                onMouseLeave={(e) => e.target.style.borderBottom = '2px solid transparent'}
                            >
                                MY PULL LIST
                            </Link>
                            <div className="user-badge" style={{
                                backgroundColor: 'white',
                                border: 'var(--comic-border)',
                                padding: '5px 10px',
                                fontWeight: 'bold',
                                transform: 'rotate(-2deg)'
                            }}>
                                {user.user_metadata?.username || user.email.split('@')[0].toUpperCase()}
                            </div>
                            <button onClick={signOut} style={{
                                background: 'black',
                                color: 'white',
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
                                color: 'black',
                                fontWeight: 'bold',
                                backgroundColor: 'white',
                                padding: '5px 10px',
                                border: '2px solid black'
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
                <p>&copy; 2026 CosQ Entertainments Pvt. Ltd.</p>
            </footer>
        </div>
    );
};

export default Layout;
