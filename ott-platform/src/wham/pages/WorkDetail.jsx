import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useWham } from '../WhamContext';
import { PEOPLE, findWork, firstName, personColor, workColor } from '../data';
import { Avail, Avatar, Play } from '../components/ui';

const WorkDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { personState } = useWham();
    const w = findWork(id);
    if (!w) return <Navigate to="/discover" replace />;

    // Each credit is verified by the next collaborator on the piece.
    const verifier = i => {
        const other = w.c[(i + 1) % w.c.length][0];
        return other === w.c[i][0] ? 'a collaborator' : firstName(other);
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ flex: '3 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="w-media" style={{ background: workColor(w.id), borderRadius: 14, boxShadow: '4px 4px 0 #14110f' }}>
                    <Play size={64} tri={[20, 23]} nudge={5} />
                    <span className="w-len" style={{ right: 10, bottom: 10, padding: '1px 7px', fontSize: 12 }}>{w.len}</span>
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>{w.title}</div>
                    <div style={{ fontSize: 13, color: '#5b5348' }}>{w.kind} · {w.year}</div>
                </div>
                <div style={{ fontSize: 13, color: '#3d372f' }}>{w.desc}</div>
            </div>
            <div style={{ flex: '2 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="w-h2">Who made this</div>
                {w.c.map(([pid, role], i) => {
                    const p = PEOPLE[pid], s = personState(pid), open = () => navigate(`/people/${pid}`);
                    return (
                        <div key={pid} className="w-card" style={{ borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <Avatar ini={p.ini} col={personColor(pid)} size={40} onClick={open} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div onClick={open} className="w-clickable" style={{ fontWeight: 800 }}>{p.name}</div>
                                    <div className="w-sub">{role} · <span style={{ color: '#14110f', fontWeight: 800 }}>Verified by {verifier(i)}</span></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ flex: '1 1 120px', fontSize: 12, fontWeight: 700 }}><Avail open={p.open} until={p.until} /></span>
                                <button onClick={s.onPing} className="w-btn" style={{ padding: '5px 12px', fontSize: 12, background: s.pingBg, color: s.pingFg }}>{s.pingLabel}</button>
                                <button onClick={s.onList} className="w-btn" style={{ padding: '5px 12px', fontSize: 12, background: s.listBg }}>{s.listLabel}</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkDetail;
