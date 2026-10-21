import React, { useState } from 'react';
import { useWham } from '../WhamContext';
import { DISC, firstName } from '../data';
import { Chip } from './ui';

const AddToList = ({ pid }) => {
    const { lists, toggleInList, createList, setSheet } = useWham();
    const [name, setName] = useState('');
    const create = () => { if (createList(name, pid)) setName(''); };
    return (
        <>
            <div className="w-h2">Add {firstName(pid)} to a shortlist</div>
            {lists.map(l => {
                const on = l.people.includes(pid);
                return (
                    <button key={l.id} onClick={() => toggleInList(l.id, pid)}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #14110f', borderRadius: 12, padding: '10px 14px', fontWeight: 800, fontSize: 14, background: on ? '#ffd23f' : '#fff', textAlign: 'left' }}>
                        <span>{l.name}</span><span>{on ? 'Added' : 'Add'}</span>
                    </button>
                );
            })}
            <div style={{ display: 'flex', gap: 8 }}>
                <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="New idea, e.g. Perfume ad"
                    className="w-input" style={{ flex: 1, minWidth: 0, borderRadius: 99, padding: '8px 14px' }} />
                <button onClick={create} className="w-btn" style={{ background: '#ffd23f', padding: '8px 14px', fontSize: 13 }}>Create</button>
            </div>
            <button onClick={() => setSheet(null)} className="w-btn" style={{ background: '#14110f', color: '#fff', padding: 9 }}>Done</button>
        </>
    );
};

const PostGig = () => {
    const { postGig, flash } = useWham();
    const [title, setTitle] = useState('');
    const [disc, setDisc] = useState('Editing');
    const [when, setWhen] = useState('This month');
    const post = () => {
        const t = title.trim();
        if (!t) return flash('Add a title');
        postGig({ title: t, disc, when });
    };
    return (
        <>
            <div className="w-h2">Post a gig</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you need? e.g. Editor for 3 reels" className="w-input" />
            <div style={{ fontSize: 12, fontWeight: 800 }}>Who you need</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DISC.map(d => <Chip key={d} active={disc === d} onClick={() => setDisc(d)}>{d}</Chip>)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800 }}>When</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['This week', 'This month', 'Flexible'].map(w => <Chip key={w} active={when === w} onClick={() => setWhen(w)}>{w}</Chip>)}
            </div>
            <button onClick={post} className="w-btn" style={{ background: '#e8281c', color: '#fff', padding: 10, fontSize: 14, boxShadow: '2px 2px 0 #14110f' }}>Post gig</button>
        </>
    );
};

const ShareDetails = ({ pid }) => {
    const { pings, sendDetails } = useWham();
    const ctx = pings[pid]?.ctx;
    const [text, setText] = useState(ctx && ctx !== 'a project' ? ctx : '');
    const [when, setWhen] = useState('This month');
    return (
        <>
            <div className="w-h2">Share details with {firstName(pid)}</div>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="One line on the job" className="w-input" />
            <div style={{ fontSize: 12, fontWeight: 800 }}>When</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['This month', 'Next month', 'Flexible'].map(w => <Chip key={w} active={when === w} onClick={() => setWhen(w)}>{w}</Chip>)}
            </div>
            <button onClick={() => sendDetails(pid, text, when)} className="w-btn" style={{ background: '#e8281c', color: '#fff', padding: 10, fontSize: 14, boxShadow: '2px 2px 0 #14110f' }}>Send details</button>
        </>
    );
};

const Sheets = ({ phone }) => {
    const { sheet, setSheet } = useWham();
    if (!sheet) return null;
    return (
        <div onClick={() => setSheet(null)} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(20,17,15,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: phone ? 0 : 20 }}>
            <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
                style={{ background: '#fff6e3', border: '3px solid #14110f', borderRadius: 18, width: '100%', maxWidth: 440, maxHeight: '100%', overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sheet.type === 'add' && <AddToList pid={sheet.pid} />}
                {sheet.type === 'gig' && <PostGig />}
                {sheet.type === 'details' && <ShareDetails pid={sheet.pid} />}
            </div>
        </div>
    );
};

export default Sheets;
