import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWham } from '../WhamContext';
import { PEOPLE, personColor } from '../data';
import { Avatar } from '../components/ui';

const Lists = () => {
    const navigate = useNavigate();
    const { lists, createList, removeFromList, personState, ping } = useWham();
    const [name, setName] = useState('');
    const create = () => { if (createList(name)) setName(''); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820, margin: '0 auto' }}>
            <h1 className="w-h1" style={{ margin: 0, fontWeight: 400 }}>Shortlists</h1>
            <div style={{ display: 'flex', gap: 8 }}>
                <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="Name an idea, e.g. Podcast promo"
                    className="w-input" style={{ flex: 1, minWidth: 0, borderRadius: 99, padding: '9px 14px' }} />
                <button onClick={create} className="w-btn" style={{ background: '#ffd23f', padding: '8px 16px', fontSize: 13 }}>New list</button>
            </div>
            {lists.map(l => (
                <div key={l.id} className="w-card w-shadow" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, flex: 1 }}>{l.name}</div>
                        <span style={{ fontSize: 12, color: '#5b5348', fontWeight: 700 }}>{l.people.length} {l.people.length === 1 ? 'person' : 'people'}</span>
                    </div>
                    {!l.people.length && <div style={{ fontSize: 13, color: '#5b5348' }}>Nobody here yet. Add people from Work, People or a profile.</div>}
                    {l.people.map(pid => {
                        const p = PEOPLE[pid], s = personState(pid), open = () => navigate(`/people/${pid}`);
                        return (
                            <div key={pid} style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 10, borderTop: '2px dashed #d9d0bb', flexWrap: 'wrap' }}>
                                <Avatar ini={p.ini} col={personColor(pid)} onClick={open} />
                                <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                                    <div onClick={open} className="w-clickable" style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</div>
                                    <div className="w-sub">{p.d} · {p.open ? 'Open to work' : p.until}</div>
                                </div>
                                <button onClick={() => ping(pid, l.name)} className="w-btn" style={{ padding: '6px 14px', fontSize: 12, background: s.pingBg, color: s.pingFg }}>{s.pingLabel}</button>
                                <button onClick={() => removeFromList(l.id, pid)} className="w-link-btn" style={{ fontSize: 12, color: '#5b5348' }}>Remove</button>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Lists;
