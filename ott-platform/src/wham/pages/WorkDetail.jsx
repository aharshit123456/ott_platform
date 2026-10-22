import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoad, useWham } from '../hooks';
import { firstName, workColor } from '../data';
import { Avail, Loading, Note, PersonAvatar, Play } from '../components/ui';

const WorkDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { source, personState } = useWham();
    const { data: w, error, loading } = useLoad(() => source.work(id), [id]);
    if (loading) return <Loading />;
    if (error || !w) return <Note>This work isn&apos;t available.</Note>;

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ flex: '3 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {w.media_url ? (
                    <video src={w.media_url} poster={w.thumbnail_url || undefined} controls playsInline
                        style={{ width: '100%', aspectRatio: '16/9', background: '#14110f', border: '2px solid #14110f', borderRadius: 14, boxShadow: '4px 4px 0 #14110f' }} />
                ) : (
                    <div className="w-media" style={{ background: workColor(w), borderRadius: 14, boxShadow: '4px 4px 0 #14110f' }}>
                        <Play size={64} tri={[20, 23]} nudge={5} />
                        {w.length && <span className="w-len" style={{ right: 10, bottom: 10, padding: '1px 7px', fontSize: 12 }}>{w.length}</span>}
                    </div>
                )}
                <div>
                    <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>{w.title}</h1>
                    <div style={{ fontSize: 13, color: '#5b5348' }}>{[w.kind, w.year].filter(Boolean).join(' · ')}</div>
                </div>
                {w.description && <div style={{ fontSize: 13, color: '#3d372f' }}>{w.description}</div>}
            </div>
            <div style={{ flex: '2 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="w-h2">Who made this</div>
                {w.credits.map(({ person: p, role, verified_by: v }) => {
                    const s = personState(p), open = () => navigate(`/people/${p.id}`);
                    return (
                        <div key={p.id} className="w-card" style={{ borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <PersonAvatar person={p} size={40} onClick={open} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div onClick={open} className="w-clickable" style={{ fontWeight: 800 }}>{p.name}</div>
                                    <div className="w-sub">{role} · {v
                                        ? <span style={{ color: '#14110f', fontWeight: 800 }}>Verified by {firstName(v.name)}</span>
                                        : 'Not yet verified'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ flex: '1 1 120px', fontSize: 12, fontWeight: 700 }}><Avail person={p} /></span>
                                <button onClick={s.onPing} className="w-btn" style={{ padding: '5px 12px', fontSize: 12, background: s.pingBg, color: s.pingFg }}>{s.pingLabel}</button>
                                {!s.isMe && <button onClick={s.onList} className="w-btn" style={{ padding: '5px 12px', fontSize: 12, background: s.listBg }}>{s.listLabel}</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkDetail;
