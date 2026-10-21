import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
    const { user } = useAuth();

    const navStyle = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'var(--comic-primary)',
        borderTop: 'var(--comic-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '60px',
        zIndex: 1000,
        boxShadow: '0px -4px 0px 0px rgba(0,0,0,0.2)'
    };

    const linkStyle = ({ isActive }) => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textDecoration: 'none',
        color: isActive ? 'white' : 'black',
        backgroundColor: isActive ? 'black' : 'transparent',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-heading)',
        fontSize: '0.8rem'
    });

    return (
        <nav className="bottom-nav" style={navStyle}>
            <NavLink to="/legacy" style={linkStyle}>
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>🏠</span>
                <span>HOME</span>
            </NavLink>

            <NavLink to={user ? "/legacy/pull-list" : "/legacy/login"} style={linkStyle}>
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>📚</span>
                <span>MY LIST</span>
            </NavLink>

            <NavLink to="/legacy/profile" style={linkStyle}>
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>👤</span>
                <span>{user ? 'PROFILE' : 'LOGIN'}</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
