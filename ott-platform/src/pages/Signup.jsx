import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error, data } = await signUp({
                email,
                password,
                options: {
                    data: { username: username }
                }
            });
            if (error) throw error;
            if (data?.session) {
                navigate('/');
            } else {
                setMsg('Registration successful! Please check your email for verification.');
            }
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
                    border: '4px solid #00d2ff',
                    boxShadow: '10px 10px 0px 0px rgba(0,0,0,1)',
                    width: '100%',
                    maxWidth: '400px',
                    color: 'white'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px', fontFamily: "'Bangers', cursive", fontSize: '2.5rem', color: '#00d2ff' }}>Join Us</h2>
                    {error && <p style={{ color: '#ff6b6b', marginBottom: '15px' }}>{error}</p>}
                    {msg && <p style={{ color: '#51cf66', marginBottom: '15px' }}>{msg}</p>}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '2px solid #00d2ff',
                                    background: 'white',
                                    color: 'black',
                                    fontWeight: 'bold'
                                }}
                                required
                            />
                        </div>
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
                                    border: '2px solid #00d2ff',
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
                                    border: '2px solid #00d2ff',
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
                            background: 'linear-gradient(45deg, #00d2ff, #3a7bd5)',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            transition: 'transform 0.2s'
                        }}>
                            SUIT UP!
                        </button>
                    </form>
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>
                        Already a hero? <Link to="/login" style={{ color: '#00d2ff', textDecoration: 'none' }}>Login</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Signup;
