import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWham } from '../hooks';
import useIsPhone from '../useIsPhone';
import Sheets from './Sheets';
import '../wham.css';

const NAV = [['/discover', 'Discover'], ['/lists', 'Lists'], ['/inbox', 'Inbox'], ['/me', 'Profile']];

const AppShell = () => {
    const { user, loading, signOut } = useAuth();
    const { unreadCount, setSheet, toast } = useWham();
    const phone = useIsPhone();
    const navigate = useNavigate();
    const { pathname, key } = useLocation();
    const scrollRef = useRef();

    useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, [pathname]);

    if (loading) return null;
    // Desktop visitors who are signed out see the hero page first.
    if (!phone && !user) return <Navigate to="/" replace />;

    const isActive = to => to === '/discover'
        ? ['/discover', '/work', '/people'].some(p => pathname.startsWith(p))
        : pathname.startsWith(to);
    const nav = NAV.map(([to, label]) => ({ to, label, act: isActive(to), n: to === '/inbox' ? unreadCount : 0 }));

    const showBack = ['/work/', '/people/', '/inbox/'].some(p => pathname.startsWith(p));
    const back = () => {
        if (pathname.startsWith('/inbox/')) navigate('/inbox');
        else if (key !== 'default') navigate(-1);
        else navigate('/discover');
    };
    const logout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="wham w-page is-app">
            <div className="w-frame">
                <header style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: phone ? 'calc(env(safe-area-inset-top) + 12px) 16px 10px' : '12px 20px', borderBottom: '2px solid #14110f', background: '#fff6e3' }}>
                    {showBack && <button onClick={back} aria-label="Back" className="w-btn" style={{ width: 34, height: 34, fontSize: 16, padding: 0 }}>&#8592;</button>}
                    <div onClick={() => navigate('/discover')} className="w-wordmark w-clickable" style={{ fontSize: 30 }}>WHAM!</div>
                    <div style={{ flex: 1 }} />
                    {!phone && (
                        <nav style={{ display: 'flex', gap: 6 }}>
                            {nav.map(n => (
                                <button key={n.to} onClick={() => navigate(n.to)} className="w-btn"
                                    style={{ padding: '6px 16px', fontSize: 13, background: n.act ? '#14110f' : '#fff', color: n.act ? '#fff' : '#14110f' }}>
                                    {n.label}
                                    {n.n > 0 && <span style={{ marginLeft: 6, background: '#e8281c', color: '#fff', borderRadius: 99, padding: '0 6px', fontSize: 11 }}>{n.n}</span>}
                                </button>
                            ))}
                        </nav>
                    )}
                    <button onClick={() => setSheet({ type: 'gig' })} className="w-btn" style={{ background: '#ffd23f', padding: '6px 14px', fontSize: 13, boxShadow: '2px 2px 0 #14110f' }}>Post a gig</button>
                    {!phone && <button onClick={logout} className="w-link-btn" style={{ fontSize: 13 }}>Log out</button>}
                </header>

                <main ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: phone ? '14px 14px 18px' : '20px 24px 28px' }}>
                    <Outlet />
                </main>

                {phone && (
                    <nav style={{ flex: 'none', display: 'flex', borderTop: '2px solid #14110f', background: '#fff', paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}>
                        {nav.map(n => (
                            <button key={n.to} onClick={() => navigate(n.to)}
                                style={{ position: 'relative', cursor: 'pointer', flex: 1, border: 0, background: 'none', padding: '10px 4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 12, color: '#14110f' }}>
                                <span style={{ display: 'block', width: 44, height: 6, borderRadius: 3, background: n.act ? '#e8281c' : 'transparent' }} />
                                {n.label}
                                {n.n > 0 && <span style={{ position: 'absolute', top: 8, left: 'calc(50% + 16px)', background: '#e8281c', color: '#fff', borderRadius: 99, padding: '0 6px', fontSize: 10 }}>{n.n}</span>}
                            </button>
                        ))}
                    </nav>
                )}

                <Sheets phone={phone} />

                {toast && (
                    <div style={{ position: 'absolute', left: '50%', bottom: phone ? 90 : 24, transform: 'translateX(-50%)', zIndex: 40, background: '#14110f', color: '#fff', padding: '9px 18px', borderRadius: 99, fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>{toast}</div>
                )}
            </div>
        </div>
    );
};

export default AppShell;
