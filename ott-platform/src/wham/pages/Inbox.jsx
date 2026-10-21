import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWham } from '../hooks';
import { Note, PersonAvatar } from '../components/ui';

const STATUS = { pinged: ['Waiting', '#fff'], reply: ['New ping', '#ffd23f'], interested: ['Interested', '#ffd23f'], later: ['Later', '#e6e0d0'] };

const Inbox = () => {
    const navigate = useNavigate();
    const { signedIn, inbox } = useWham();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820, margin: '0 auto' }}>
            <h1 className="w-h1" style={{ margin: 0, fontWeight: 400 }}>Inbox</h1>
            {!signedIn ? <Note dashed>Log in to see your pings.</Note>
                : !inbox.length && <Note dashed>No conversations yet. Tap Interested? on anyone to start one.</Note>}
            {inbox.map(c => {
                const [label, bg] = STATUS[c.status === 'pinged' && c.role === 'recipient' ? 'reply' : c.status];
                return (
                    <div key={c.id} onClick={() => navigate(`/inbox/${c.id}`)} className="w-card w-clickable" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <PersonAvatar person={c.other} size={42} fontSize={13} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800 }}>{c.other.name}</div>
                            <div className="w-sub w-truncate">{c.last_message?.body}</div>
                        </div>
                        <span style={{ background: bg, border: '2px solid #14110f', borderRadius: 99, padding: '1px 10px', fontSize: 11, fontWeight: 800, flex: 'none' }}>{label}</span>
                        {c.unread > 0 && <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8281c', flex: 'none' }} />}
                    </div>
                );
            })}
        </div>
    );
};

export default Inbox;
