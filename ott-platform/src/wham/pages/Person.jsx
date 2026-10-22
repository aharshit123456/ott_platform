import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoad, useWham } from '../hooks';
import { personColor, workColor, subline } from '../data';
import { Loading, Note, PersonAvatar, Play } from '../components/ui';

const WEEK_STYLE = { open: { bg: '#ffd23f', op: 1 }, partly: { bg: '#ffe9a0', op: 1 }, booked: { bg: '#e6e0d0', op: 0.7 } };
const statBox = { border: '2px solid #14110f', borderRadius: 10, padding: '8px 10px' };
const statLabel = { fontSize: 11, fontWeight: 800, color: '#5b5348' };
const panel = { padding: 14, display: 'flex', flexDirection: 'column', gap: 10 };

const Person = () => {
    const { id } = useParams();
    const { source } = useWham();
    const { data: p, error, loading } = useLoad(() => source.person(id), [id]);
    if (loading) return <Loading />;
    if (error || !p) return <Note>This profile isn&apos;t available.</Note>;
    return <Profile p={p} />;
};

// Also used for your own profile preview.
export const Profile = ({ p, actions = true }) => {
    const navigate = useNavigate();
    const { personState } = useWham();
    const s = personState(p);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
            <div style={{ flex: '3 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="w-card" style={{ boxShadow: '4px 4px 0 #14110f', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <PersonAvatar person={p} size={64} fontSize={20} />
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>{p.name}</h1>
                            <div style={{ fontSize: 13, color: '#5b5348' }}>{subline(p)}</div>
                        </div>
                    </div>
                    {actions && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={s.onPing} className="w-btn" style={{ padding: '9px 22px', fontSize: 14, background: s.pingBg, color: s.pingFg, boxShadow: '2px 2px 0 #14110f' }}>{s.isMe ? 'Edit profile' : s.pingLabel}</button>
                            {!s.isMe && <button onClick={s.onList} className="w-btn" style={{ padding: '9px 18px', fontSize: 14, background: s.listBg }}>{s.listLabel}</button>}
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                        <div style={statBox}><div style={statLabel}>REPLIES IN</div><b>{p.reply_time || '–'}</b></div>
                        <div style={statBox}><div style={statLabel}>TYPICAL TURNAROUND</div><b>{p.turnaround || '–'}</b></div>
                        <div style={statBox}><div style={statLabel}>VERIFIED CREDITS</div><b>{p.verified_credits}</b></div>
                    </div>
                </div>
                {p.reel_url ? (
                    <video src={p.reel_url} controls playsInline style={{ width: '100%', aspectRatio: '16/9', background: '#14110f', border: '2px solid #14110f', borderRadius: 14 }} />
                ) : (
                    <div className="w-media" style={{ background: personColor(p.id), borderRadius: 14 }}>
                        <Play size={56} tri={[18, 20]} />
                        {p.reel_length && <span className="w-tag" style={{ position: 'absolute', left: 10, top: 10, padding: '0 10px' }}>Showreel {p.reel_length}</span>}
                    </div>
                )}
                <div className="w-h2">Work</div>
                {!p.works.length && <div style={{ fontSize: 13, color: '#5b5348' }}>No credited work yet.</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                    {p.works.map(w => (
                        <div key={w.id} onClick={() => navigate(`/work/${w.id}`)} className="w-clickable" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ aspectRatio: '16/9', background: w.thumbnail_url ? `center / cover url(${w.thumbnail_url})` : workColor(w), border: '2px solid #14110f', borderRadius: 10, position: 'relative' }}>
                                {w.length && <span className="w-len" style={{ right: 6, bottom: 6, padding: '0 5px', fontSize: 10 }}>{w.length}</span>}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{w.title}</div>
                            <div className="w-sub">{w.my_role}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: '2 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="w-card" style={panel}>
                    <div style={{ fontWeight: 800 }}>Availability</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                        {p.weeks.map(k => (
                            <div key={k.label} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800 }}>
                                <div style={{ height: 30, border: '2px solid #14110f', borderRadius: 6, background: WEEK_STYLE[k.status].bg, opacity: WEEK_STYLE[k.status].op }} />
                                {k.label}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700, flexWrap: 'wrap' }}>
                        <span>Yellow: open</span><span>Pale: partly</span><span>Grey: booked</span>
                    </div>
                </div>
                {p.gear.length > 0 && (
                    <div className="w-card" style={panel}>
                        <div style={{ fontWeight: 800 }}>Gear and software</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {p.gear.map(g => <span key={g} style={{ background: '#fff6e3', border: '2px solid #14110f', borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{g}</span>)}
                        </div>
                    </div>
                )}
                {p.collaborators.length > 0 && (
                    <div className="w-card" style={panel}>
                        <div style={{ fontWeight: 800 }}>Often works with</div>
                        {p.collaborators.map(c => (
                            <div key={c.id} onClick={() => navigate(`/people/${c.id}`)} className="w-clickable" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <PersonAvatar person={c} size={36} fontSize={11} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: 13 }}>{c.name}</div>
                                    <div className="w-sub">{[c.headline, `${c.shared} shared`].filter(Boolean).join(' · ')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Person;
