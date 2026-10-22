import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoad, useWham } from '../hooks';
import useIsPhone from '../useIsPhone';
import { DISC, firstName, personColor, responsesText, workColor, subline } from '../data';
import { Avail, Chip, Loading, Note, PersonAvatar, Play } from '../components/ui';

const LENSES = [['work', 'Work'], ['people', 'People'], ['gigs', 'Gigs']];
const grid = min => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` });

const WorkTile = ({ w }) => {
    const navigate = useNavigate();
    const open = () => navigate(`/work/${w.id}`);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div onClick={open} className="w-media w-clickable w-shadow" style={{ background: w.thumbnail_url ? `center / cover url(${w.thumbnail_url})` : workColor(w), borderRadius: 12 }}>
                <Play />
                {w.kind && <span className="w-tag" style={{ position: 'absolute', left: 8, top: 8 }}>{w.kind}</span>}
                {w.length && <span className="w-len" style={{ right: 8, bottom: 8, padding: '1px 6px', fontSize: 11 }}>{w.length}</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div onClick={open} className="w-clickable" style={{ fontWeight: 800, fontSize: 15 }}>{w.title}</div>
                    <div className="w-sub">{w.credits.map(c => firstName(c.person.name)).join(', ')}</div>
                </div>
                <div className="w-tag" style={{ padding: '1px 8px', flex: 'none' }}>{w.credits.length} credited</div>
            </div>
        </div>
    );
};

const PersonCard = ({ p }) => {
    const navigate = useNavigate();
    const { personState } = useWham();
    const s = personState(p);
    const open = () => navigate(`/people/${p.id}`);
    return (
        <div className="w-card w-shadow" style={{ overflow: 'hidden' }}>
            <div onClick={open} className="w-clickable" style={{ position: 'relative', aspectRatio: '16/8', background: personColor(p.id), display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #14110f' }}>
                <Play size={40} tri={[13, 15]} nudge={3} />
                {p.reel_length && <span className="w-tag" style={{ position: 'absolute', left: 8, bottom: 8 }}>Reel {p.reel_length}</span>}
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <PersonAvatar person={p} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div onClick={open} className="w-clickable" style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                        <div className="w-sub">{subline(p)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                    <Avail person={p} />
                    {p.reply_time && <span style={{ color: '#5b5348' }}>Replies in {p.reply_time}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={s.onPing} className="w-btn" style={{ flex: 1, padding: '7px 10px', fontSize: 13, background: s.pingBg, color: s.pingFg }}>{s.pingLabel}</button>
                    {!s.isMe && <button onClick={s.onList} className="w-btn" style={{ padding: '7px 14px', fontSize: 13, background: s.listBg }}>{s.listLabel}</button>}
                </div>
            </div>
        </div>
    );
};

const GigCard = ({ g }) => {
    const navigate = useNavigate();
    const { respondGig, flash } = useWham();
    const by = g.mine ? { ...g.poster, name: 'You' } : g.poster;
    return (
        <div className="w-card w-shadow" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="w-tag" style={{ background: '#ffd23f', padding: '0 10px' }}>{g.discipline}</span>
                <span className="w-tag" style={{ padding: '0 10px' }}>{g.when}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>{g.title}</div>
            <div style={{ fontSize: 13, color: '#3d372f' }}>{g.brief}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <PersonAvatar person={by} size={32} fontSize={11} onClick={g.mine ? undefined : () => navigate(`/people/${g.poster.id}`)} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12 }}><b>{by.name}</b><div style={{ color: '#5b5348' }}>{responsesText(g.responses)}</div></div>
                <button onClick={() => g.mine ? flash('This is your gig') : g.responded ? flash('You already responded') : respondGig(g)} className="w-btn"
                    style={{ padding: '7px 16px', fontSize: 13, background: g.responded || g.mine ? '#fff' : '#e8281c', color: g.responded || g.mine ? '#14110f' : '#fff' }}>
                    {g.mine ? 'Yours' : g.responded ? 'Responded' : 'Respond'}
                </button>
            </div>
        </div>
    );
};

const Discover = () => {
    const { source } = useWham();
    const phone = useIsPhone();
    const [params, setParams] = useSearchParams();
    const lens = LENSES.some(([k]) => k === params.get('lens')) ? params.get('lens') : 'work';
    const disc = params.get('disc') || 'All';
    const discipline = disc === 'All' ? null : disc;
    const { data, loading } = useLoad(() => lens === 'work' ? source.works(discipline) : lens === 'people' ? source.people(discipline) : source.gigs(discipline), [lens, discipline]);
    const set = (k, v) => {
        const next = new URLSearchParams(params);
        next.set(k, v);
        if (k === 'disc' && v === 'All') next.delete('disc');
        setParams(next, { replace: true });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', border: '2px solid #14110f', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                {LENSES.map(([k, l], i) => (
                    <button key={k} onClick={() => set('lens', k)}
                        style={{ cursor: 'pointer', flex: 1, border: 0, borderRight: i < LENSES.length - 1 ? '2px solid #14110f' : 0, padding: '10px 6px', fontWeight: 800, fontSize: 14, background: lens === k ? '#e8281c' : '#fff', color: lens === k ? '#fff' : '#14110f' }}>
                        {l}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flexWrap: phone ? 'nowrap' : 'wrap', padding: '2px 2px 4px' }}>
                {['All', ...DISC].map(d => <Chip key={d} active={disc === d} onClick={() => set('disc', d)} style={{ flex: 'none', padding: '5px 13px' }}>{d}</Chip>)}
            </div>

            {loading ? <Loading /> : !data?.length ? <Note dashed>Nothing here yet.</Note> : (
                <>
                    {lens === 'work' && <div style={{ ...grid(270), gap: '18px 16px' }}>{data.map(w => <WorkTile key={w.id} w={w} />)}</div>}
                    {lens === 'people' && <div style={{ ...grid(300), gap: 16 }}>{data.map(p => <PersonCard key={p.id} p={p} />)}</div>}
                    {lens === 'gigs' && <div style={{ ...grid(320), gap: 16 }}>{data.map(g => <GigCard key={g.id} g={g} />)}</div>}
                </>
            )}
        </div>
    );
};

export default Discover;
