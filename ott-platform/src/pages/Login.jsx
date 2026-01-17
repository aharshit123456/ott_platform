import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Layout>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div style={{
                    background: '#1a1a1a',
                    padding: '40px',
                    borderRadius: '20px',
                    border: '4px solid #FFD700',
                    boxShadow: '10px 10px 0px 0px rgba(0,0,0,1)',
                    width: '100%',
                    maxWidth: '400px',
                    color: 'white'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px', fontFamily: "'Bangers', cursive", fontSize: '2.5rem', color: '#FFD700' }}>Login</h2>
                    {error && <p style={{ color: '#ff6b6b', marginBottom: '15px' }}>{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '2px solid #FFD700',
                                    background: 'white',
                                    color: 'black',
                                    fontWeight: 'bold'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '2px solid #FFD700',
                                    background: 'white',
                                    color: 'black',
                                    fontWeight: 'bold'
                                }}
                                required
                            />
                        </div>
                        <button type="submit" style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '50px',
                            border: 'none',
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: '#000',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            transition: 'transform 0.2s'
                        }}>
                            ENTER THE VERSE
                        </button>
                    </form>
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>
                        Don't have an account? <Link to="/signup" style={{ color: '#FFD700', textDecoration: 'none' }}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
