import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>Identify Yourself!</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                    <Link to="/login" style={{
                        textDecoration: 'none',
                        color: 'black',
                        fontWeight: 'bold',
                        backgroundColor: 'white',
                        padding: '15px',
                        border: '2px solid black',
                        boxShadow: '4px 4px 0px 0px #000000',
                        fontSize: '1.2rem'
                    }}>
                        LOGIN
                    </Link>
                    <Link to="/signup" style={{
                        textDecoration: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        backgroundColor: 'black',
                        padding: '15px',
                        border: '2px solid black',
                        boxShadow: '4px 4px 0px 0px #000000',
                        fontSize: '1.2rem'
                    }}>
                        JOIN THE SQUAD (SIGN UP)
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Citizen Profile</h2>

            <div className="comic-card" style={{
                background: 'white',
                border: '3px solid black',
                padding: '2rem',
                maxWidth: '400px',
                margin: '0 auto',
                boxShadow: '8px 8px 0px 0px #000000'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#eee',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid black'
                }}>
                    <span style={{ fontSize: '3rem' }}>👤</span>
                </div>

                <h3>{user.user_metadata?.username || 'Hero'}</h3>
                <p>{user.email}</p>

                <hr style={{ border: '2px solid black', margin: '1.5rem 0' }} />

                <button onClick={handleLogout} style={{ width: '100%' }}>
                    LOGOUT
                </button>
            </div>
        </div>
    );
};

export default Profile;
