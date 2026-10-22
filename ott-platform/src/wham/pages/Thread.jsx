import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoad, useWham } from '../hooks';
import { Loading, Note, PersonAvatar } from '../components/ui';

const THREAD_POLL_MS = 5000;

const Thread = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { source, run, refresh, setSheet, apiMode } = useWham();
    const { data: c, error, loading } = useLoad(() => source.conversation(id), [id]);
    const [text, setText] = useState('');

    // Opening the thread marks it read, so refresh the inbox badge; then poll while it's open.
    const loadedId = c?.id;
    useEffect(() => {
        if (loadedId) refresh();
    }, [loadedId, refresh]);
    useEffect(() => {
        if (!apiMode) return;
        const t = setInterval(() => document.visibilityState === 'visible' && refresh(), THREAD_POLL_MS);
        return () => clearInterval(t);
    }, [apiMode, refresh]);

    if (loading) return <Loading />;
    if (error || !c) return <Note>This conversation isn&apos;t available.</Note>;

    const p = c.other;
    const sent = c.messages.some(m => m.kind === 'details');
    const send = () => {
        const body = text.trim();
        if (body) run(() => source.sendMessage(c.id, body), () => setText(''));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, margin: '0 auto' }}>
            <div className="w-card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
                <PersonAvatar person={p} size={42} fontSize={13} onClick={() => navigate(`/people/${p.id}`)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{p.name}</div>
                    <div className="w-sub">{[p.headline, p.availability_text].filter(Boolean).join(' · ')}</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}>
                {c.messages.map(m => (
                    <div key={m.id} style={{ alignSelf: m.from_me ? 'flex-end' : 'flex-start', maxWidth: '82%', background: m.from_me ? '#ffd23f' : '#fff', color: '#14110f', border: '2px solid #14110f', padding: '8px 12px', borderRadius: 14, whiteSpace: 'pre-line' }}>
                        {m.body}
                    </div>
                ))}
                {c.status === 'pinged' && c.role === 'sender' && <div style={{ alignSelf: 'flex-start', fontSize: 12, color: '#5b5348', fontWeight: 700 }}>Waiting for a reply</div>}
            </div>

            {c.status === 'pinged' && c.role === 'recipient' && (
                <div style={{ background: '#ffd23f', border: '2px solid #14110f', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', boxShadow: '3px 3px 0 #14110f' }}>
                    <div style={{ flex: '1 1 180px', fontWeight: 700, fontSize: 13 }}>Interested in {c.context}?</div>
                    <button onClick={() => run(() => source.reply(c.id, true))} className="w-btn" style={{ background: '#14110f', color: '#fff', padding: '7px 18px', fontSize: 13 }}>Yes, interested</button>
                    <button onClick={() => run(() => source.reply(c.id, false))} className="w-btn" style={{ padding: '7px 18px', fontSize: 13 }}>Booked, ping me later</button>
                </div>
            )}
            {c.status === 'interested' && c.role === 'sender' && !sent && (
                <div style={{ background: '#ffd23f', border: '2px solid #14110f', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', boxShadow: '3px 3px 0 #14110f' }}>
                    <div style={{ flex: '1 1 180px', fontWeight: 700, fontSize: 13 }}>They are interested. Share the details.</div>
                    <button onClick={() => setSheet({ type: 'details', conversation: c })} className="w-btn" style={{ background: '#14110f', color: '#fff', padding: '7px 18px', fontSize: 13 }}>Share details</button>
                </div>
            )}
            {c.status === 'interested' && (
                <div style={{ display: 'flex', gap: 8 }}>
                    <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={`Message ${p.name.split(' ')[0]}`}
                        className="w-input" style={{ flex: 1, minWidth: 0, borderRadius: 99, padding: '9px 14px' }} />
                    <button onClick={send} className="w-btn" style={{ background: '#e8281c', color: '#fff', padding: '8px 18px', fontSize: 13 }}>Send</button>
                </div>
            )}
        </div>
    );
};

export default Thread;
