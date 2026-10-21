import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useWham } from '../WhamContext';
import { PEOPLE, WEEKS, personColor, workColor, worksBy } from '../data';
import { Avatar, Play } from '../components/ui';

const WEEK_STYLE = { o: { bg: '#ffd23f', op: 1 }, p: { bg: '#ffe9a0', op: 1 }, b: { bg: '#e6e0d0', op: 0.7 } };
const statBox = { border: '2px solid #14110f', borderRadius: 10, padding: '8px 10px' };
const statLabel = { fontSize: 11, fontWeight: 800, color: '#5b5348' };
const panel = { padding: 14, display: 'flex', flexDirection: 'column', gap: 10 };

const Person = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { personState } = useWham();
    const p = PEOPLE[id];
    if (!p) return <Navigate to="/discover" replace />;

    const s = personState(id), col = personColor(id), work = worksBy(id);
    const shared = other => work.filter(w => w.c.some(c => c[0] === other)).length || 1;

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
            <div style={{ flex: '3 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="w-card" style={{ boxShadow: '4px 4px 0 #14110f', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <Avatar ini={p.ini} col={col} size={64} fontSize={20} />
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>{p.name}</h1>
                            <div style={{ fontSize: 13, color: '#5b5348' }}>{p.d} · {p.city}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={s.onPing} className="w-btn" style={{ padding: '9px 22px', fontSize: 14, background: s.pingBg, color: s.pingFg, boxShadow: '2px 2px 0 #14110f' }}>{s.pingLabel}</button>
                        <button onClick={s.onList} className="w-btn" style={{ padding: '9px 18px', fontSize: 14, background: s.listBg }}>{s.listLabel}</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                        <div style={statBox}><div style={statLabel}>REPLIES IN</div><b>{p.resp}</b></div>
                        <div style={statBox}><div style={statLabel}>TYPICAL TURNAROUND</div><b>{p.turn}</b></div>
                        <div style={statBox}><div style={statLabel}>VERIFIED CREDITS</div><b>{work.length * 2 + 3}</b></div>
                    </div>
                </div>
                <div className="w-media" style={{ background: col, borderRadius: 14 }}>
                    <Play size={56} tri={[18, 20]} />
                    <span className="w-tag" style={{ position: 'absolute', left: 10, top: 10, padding: '0 10px' }}>Showreel {p.reel}</span>
                </div>
                <div className="w-h2">Work</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                    {work.map(w => (
                        <div key={w.id} onClick={() => navigate(`/work/${w.id}`)} className="w-clickable" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ aspectRatio: '16/9', background: workColor(w.id), border: '2px solid #14110f', borderRadius: 10, position: 'relative' }}>
                                <span className="w-len" style={{ right: 6, bottom: 6, padding: '0 5px', fontSize: 10 }}>{w.len}</span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>{w.title}</div>
                            <div className="w-sub">{w.c.find(c => c[0] === id)[1]}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: '2 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="w-card" style={panel}>
                    <div style={{ fontWeight: 800 }}>Availability</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                        {WEEKS.map((label, i) => {
                            const k = WEEK_STYLE[p.av[i]];
                            return (
                                <div key={label} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800 }}>
                                    <div style={{ height: 30, border: '2px solid #14110f', borderRadius: 6, background: k.bg, opacity: k.op }} />
                                    {label}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700, flexWrap: 'wrap' }}>
                        <span>Yellow: open</span><span>Pale: partly</span><span>Grey: booked</span>
                    </div>
                </div>
                <div className="w-card" style={panel}>
                    <div style={{ fontWeight: 800 }}>Gear and software</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {p.gear.map(g => <span key={g} style={{ background: '#fff6e3', border: '2px solid #14110f', borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{g}</span>)}
                    </div>
                </div>
                <div className="w-card" style={panel}>
                    <div style={{ fontWeight: 800 }}>Often works with</div>
                    {p.cw.map(cid => (
                        <div key={cid} onClick={() => navigate(`/people/${cid}`)} className="w-clickable" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Avatar ini={PEOPLE[cid].ini} col={personColor(cid)} size={36} fontSize={11} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 13 }}>{PEOPLE[cid].name}</div>
                                <div className="w-sub">{PEOPLE[cid].d} · {shared(cid)} shared</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Person;
