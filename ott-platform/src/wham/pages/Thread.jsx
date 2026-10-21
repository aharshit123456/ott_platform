import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useWham } from '../WhamContext';
import { PEOPLE, personColor } from '../data';
import { Avatar } from '../components/ui';

const Thread = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { threads, pings, unread, markRead, setSheet } = useWham();
    const msgs = threads[id];

    // A reply that lands while the thread is open is read straight away.
    useEffect(() => { if (unread[id]) markRead(id); }, [id, unread, markRead]);

    if (!PEOPLE[id] || !msgs) return <Navigate to="/inbox" replace />;

    const p = PEOPLE[id], st = pings[id]?.st;
    const sent = msgs.some(m => m.t.startsWith('Details'));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, margin: '0 auto' }}>
            <div className="w-card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
                <Avatar ini={p.ini} col={personColor(id)} size={42} fontSize={13} onClick={() => navigate(`/people/${id}`)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{p.name}</div>
                    <div className="w-sub">{p.d} · {p.open ? 'Open to work' : p.until}</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.f === 'me' ? 'flex-end' : 'flex-start', maxWidth: '82%', background: m.f === 'me' ? '#ffd23f' : '#fff', color: '#14110f', border: '2px solid #14110f', padding: '8px 12px', borderRadius: 14, whiteSpace: 'pre-line' }}>
                        {m.t}
                    </div>
                ))}
                {st === 'pinged' && <div style={{ alignSelf: 'flex-start', fontSize: 12, color: '#5b5348', fontWeight: 700 }}>Waiting for a reply</div>}
            </div>
            {st === 'interested' && !sent && (
                <div style={{ background: '#ffd23f', border: '2px solid #14110f', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', boxShadow: '3px 3px 0 #14110f' }}>
                    <div style={{ flex: '1 1 180px', fontWeight: 700, fontSize: 13 }}>They are interested. Share the details.</div>
                    <button onClick={() => setSheet({ type: 'details', pid: id })} className="w-btn" style={{ background: '#14110f', color: '#fff', padding: '7px 18px', fontSize: 13 }}>Share details</button>
                </div>
            )}
        </div>
    );
};

export default Thread;
