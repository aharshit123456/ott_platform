import React from 'react';
import { useWham } from '../WhamContext';
import { PEOPLE, personColor } from '../data';
import { Avatar } from '../components/ui';

const STATUS = { pinged: ['Waiting', '#fff'], interested: ['Interested', '#ffd23f'], later: ['Later', '#e6e0d0'] };

const Inbox = () => {
    const { threads, pings, unread, openThread } = useWham();
    const ids = Object.keys(threads);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820, margin: '0 auto' }}>
            <h1 className="w-h1" style={{ margin: 0, fontWeight: 400 }}>Inbox</h1>
            {!ids.length && (
                <div style={{ background: '#fff', border: '2px dashed #14110f', borderRadius: 14, padding: 22, textAlign: 'center', color: '#5b5348' }}>
                    No conversations yet. Tap Interested? on anyone to start one.
                </div>
            )}
            {ids.map(id => {
                const p = PEOPLE[id], m = threads[id], [label, bg] = STATUS[pings[id].st];
                return (
                    <div key={id} onClick={() => openThread(id)} className="w-card w-clickable" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Avatar ini={p.ini} col={personColor(id)} size={42} fontSize={13} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800 }}>{p.name}</div>
                            <div className="w-sub w-truncate">{m[m.length - 1].t}</div>
                        </div>
                        <span style={{ background: bg, border: '2px solid #14110f', borderRadius: 99, padding: '1px 10px', fontSize: 11, fontWeight: 800, flex: 'none' }}>{label}</span>
                        {unread[id] && <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8281c', flex: 'none' }} />}
                    </div>
                );
            })}
        </div>
    );
};

export default Inbox;
