import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWham } from '../WhamContext';
import useIsPhone from '../useIsPhone';
import { Play } from '../components/ui';
import '../wham.css';

const tagStyle = { border: '2px solid #14110f', borderRadius: 99, padding: '0 8px', fontSize: 11, fontWeight: 800 };
const STEPS = [
    ['1 Watch', 'Ads, reels, films, sound pieces and stills.'],
    ['2 Find', 'Tap any credit to see availability, turnaround and gear.'],
    ['3 Connect', 'Shortlist per idea, send a quick ping, share details.'],
];

const AuthModal = ({ mode, setMode, onClose }) => {
    const { signIn, signUp } = useAuth();
    const { flash } = useWham();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const su = mode === 'signup';

    const submit = async e => {
        e.preventDefault();
        setError(''); setNote(''); setBusy(true);
        try {
            const { data, error } = su
                ? await signUp({ email, password, options: { data: { username: name } } })
                : await signIn({ email, password });
            if (error) throw error;
            if (data?.session) {
                flash(su ? 'Welcome to WHAM!' : 'Logged in');
                navigate('/discover');
            } else {
                setNote('Check your email to confirm your account, then log in.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(20,17,15,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <form onClick={e => e.stopPropagation()} onSubmit={submit}
                style={{ background: '#fff6e3', border: '3px solid #14110f', borderRadius: 18, width: '100%', maxWidth: 400, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="w-bangers" style={{ fontSize: 30 }}>{su ? 'Join WHAM!' : 'Welcome back'}</div>
                {su && <input className="w-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />}
                <input className="w-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" />
                <input className="w-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete={su ? 'new-password' : 'current-password'} />
                {error && <div style={{ color: '#e8281c', fontWeight: 700, fontSize: 13 }}>{error}</div>}
                {note && <div style={{ fontWeight: 700, fontSize: 13 }}>{note}</div>}
                <button type="submit" disabled={busy} className="w-btn"
                    style={{ background: '#e8281c', color: '#fff', padding: 11, fontSize: 15, boxShadow: '2px 2px 0 #14110f', opacity: busy ? 0.7 : 1 }}>
                    {su ? 'Create account' : 'Log in'}
                </button>
                <button type="button" onClick={() => setMode(su ? 'login' : 'signup')} className="w-link-btn" style={{ fontWeight: 700, fontSize: 13 }}>
                    {su ? 'Have an account? Log in' : 'New here? Sign up'}
                </button>
            </form>
        </div>
    );
};

const Landing = () => {
    const { user, loading } = useAuth();
    const phone = useIsPhone();
    const [params, setParams] = useSearchParams();
    const auth = params.get('auth');
    const setAuth = mode => setParams(mode ? { auth: mode } : {}, { replace: true });

    if (loading) return null;
    if (user) return <Navigate to="/discover" replace />;
    // On phones the app opens straight into Discover; the hero is a desktop page.
    if (phone && !auth) return <Navigate to="/discover" replace />;

    return (
        <div className="wham w-page">
            <div className="w-frame">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderBottom: '2px solid #14110f' }}>
                    <div className="w-wordmark" style={{ fontSize: 32, flex: 1 }}>WHAM!</div>
                    <button onClick={() => setAuth('login')} className="w-btn" style={{ padding: '8px 20px', fontSize: 14 }}>Log in</button>
                    <button onClick={() => setAuth('signup')} className="w-btn" style={{ background: '#ffd23f', padding: '8px 20px', fontSize: 14, boxShadow: '2px 2px 0 #14110f' }}>Sign up</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', padding: '56px 40px 40px' }}>
                    <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
                        <h1 className="w-bangers" style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(44px, 7vw, 76px)', lineHeight: 0.98 }}>
                            Watch the work.<br />Find the people.<br /><span style={{ color: '#e8281c' }}>Make the next thing.</span>
                        </h1>
                        <div style={{ fontSize: 18, maxWidth: 480, color: '#3d372f' }}>
                            WHAM! is where freelance video, sound, motion and photo work is discovered. Every piece lists who made it, so one view leads you to the right person and a quick ping to start something new.
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button onClick={() => setAuth('signup')} className="w-btn" style={{ background: '#e8281c', color: '#fff', padding: '13px 28px', fontSize: 16, boxShadow: '3px 3px 0 #14110f' }}>Join WHAM!</button>
                            <button onClick={() => setAuth('login')} className="w-btn" style={{ padding: '13px 28px', fontSize: 16 }}>Log in</button>
                        </div>
                    </div>

                    <div aria-hidden="true" style={{ flex: '1 1 420px', minWidth: 0, maxWidth: 520, width: '100%', margin: '0 auto', position: 'relative', height: 400 }}>
                        <div style={{ position: 'absolute', left: 0, top: 10, width: '50%', transform: 'rotate(-3deg)', background: '#fff', border: '2px solid #14110f', borderRadius: 14, boxShadow: '4px 4px 0 #14110f', padding: 10 }}>
                            <div className="w-media" style={{ background: '#e8281c', borderRadius: 10 }}><Play size={44} tri={[14, 16]} /></div>
                            <div style={{ fontWeight: 800, marginTop: 8 }}>Chai Masala: 30s TVC</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                                <span style={{ ...tagStyle, background: '#ffd23f' }}>Director</span>
                                <span style={tagStyle}>DOP</span>
                                <span style={tagStyle}>Editor</span>
                                <span style={tagStyle}>Sound</span>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', right: 0, top: 255, width: '48%', transform: 'rotate(2.5deg)', background: '#fff', border: '2px solid #14110f', borderRadius: 14, boxShadow: '4px 4px 0 #14110f', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div className="w-avatar" style={{ width: 40, height: 40, background: '#2f6f6b', fontSize: 12 }}>SQ</div>
                                <div><div style={{ fontWeight: 800 }}>Sana Qureshi</div><div className="w-sub">Sound designer · Hyderabad</div></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                                <span className="w-dot" style={{ background: '#ffd23f' }} />Open to work · replies in 1h
                            </div>
                        </div>
                        <div className="w-bangers" style={{ position: 'absolute', left: '2%', bottom: 8, transform: 'rotate(-2deg)', background: '#ffd23f', border: '2px solid #14110f', borderRadius: 99, boxShadow: '3px 3px 0 #14110f', padding: '10px 22px', fontSize: 26 }}>Interested?</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', borderTop: '2px solid #14110f', background: '#fff' }}>
                    {STEPS.map(([h, d], i) => (
                        <div key={h} style={{ padding: '20px 28px', borderRight: i < STEPS.length - 1 ? '2px solid #14110f' : 0 }}>
                            <div className="w-bangers" style={{ fontSize: 26, color: '#e8281c' }}>{h}</div>
                            <div style={{ fontSize: 14, color: '#3d372f' }}>{d}</div>
                        </div>
                    ))}
                </div>

                {auth && <AuthModal mode={auth === 'signup' ? 'signup' : 'login'} setMode={setAuth} onClose={() => setAuth(null)} />}
            </div>
        </div>
    );
};

export default Landing;
