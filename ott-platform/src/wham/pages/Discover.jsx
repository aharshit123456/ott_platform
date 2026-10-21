import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWham } from '../WhamContext';
import useIsPhone from '../useIsPhone';
import { DISC, PEOPLE, PEOPLE_IDS, WORKS, firstName, personColor, workColor } from '../data';
import { Avail, Avatar, Chip, Play } from '../components/ui';

const LENSES = [['work', 'Work'], ['people', 'People'], ['gigs', 'Gigs']];
const grid = min => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` });

const WorkTile = ({ w }) => {
    const navigate = useNavigate();
    const open = () => navigate(`/work/${w.id}`);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div onClick={open} className="w-media w-clickable w-shadow" style={{ background: workColor(w.id), borderRadius: 12 }}>
                <Play />
                <span className="w-tag" style={{ position: 'absolute', left: 8, top: 8 }}>{w.kind}</span>
                <span className="w-len" style={{ right: 8, bottom: 8, padding: '1px 6px', fontSize: 11 }}>{w.len}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div onClick={open} className="w-clickable" style={{ fontWeight: 800, fontSize: 15 }}>{w.title}</div>
                    <div className="w-sub">{w.c.map(c => firstName(c[0])).join(', ')}</div>
                </div>
                <div className="w-tag" style={{ padding: '1px 8px', flex: 'none' }}>{w.c.length} credited</div>
            </div>
        </div>
    );
};

const PersonCard = ({ id }) => {
    const navigate = useNavigate();
    const { personState } = useWham();
    const p = PEOPLE[id], s = personState(id), col = personColor(id);
    const open = () => navigate(`/people/${id}`);
    return (
        <div className="w-card w-shadow" style={{ overflow: 'hidden' }}>
            <div onClick={open} className="w-clickable" style={{ position: 'relative', aspectRatio: '16/8', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #14110f' }}>
                <Play size={40} tri={[13, 15]} nudge={3} />
                <span className="w-tag" style={{ position: 'absolute', left: 8, bottom: 8 }}>Reel {p.reel}</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Avatar ini={p.ini} col={col} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div onClick={open} className="w-clickable" style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                        <div className="w-sub">{p.d} · {p.city}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                    <Avail open={p.open} until={p.until} />
                    <span style={{ color: '#5b5348' }}>Replies in {p.resp}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={s.onPing} className="w-btn" style={{ flex: 1, padding: '7px 10px', fontSize: 13, background: s.pingBg, color: s.pingFg }}>{s.pingLabel}</button>
                    <button onClick={s.onList} className="w-btn" style={{ padding: '7px 14px', fontSize: 13, background: s.listBg }}>{s.listLabel}</button>
                </div>
            </div>
        </div>
    );
};

const GigCard = ({ g }) => {
    const navigate = useNavigate();
    const { pings, ping, flash } = useWham();
    const mine = g.by === 'me';
    const responded = !mine && pings[g.by]?.ctx === g.title;
    const by = mine ? { name: 'You', ini: 'ME', col: '#14110f' } : { name: PEOPLE[g.by].name, ini: PEOPLE[g.by].ini, col: personColor(g.by) };
    return (
        <div className="w-card w-shadow" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="w-tag" style={{ background: '#ffd23f', padding: '0 10px' }}>{g.disc}</span>
                <span className="w-tag" style={{ padding: '0 10px' }}>{g.when}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>{g.title}</div>
            <div style={{ fontSize: 13, color: '#3d372f' }}>{g.brief}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <Avatar ini={by.ini} col={by.col} size={32} fontSize={11} onClick={mine ? undefined : () => navigate(`/people/${g.by}`)} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12 }}><b>{by.name}</b><div style={{ color: '#5b5348' }}>{g.resp}</div></div>
                <button onClick={() => mine ? flash('This is your gig') : ping(g.by, g.title)} className="w-btn"
                    style={{ padding: '7px 16px', fontSize: 13, background: responded || mine ? '#fff' : '#e8281c', color: responded || mine ? '#14110f' : '#fff' }}>
                    {mine ? 'Yours' : responded ? 'Responded' : 'Respond'}
                </button>
            </div>
        </div>
    );
};

const Discover = () => {
    const { gigs } = useWham();
    const phone = useIsPhone();
    const [params, setParams] = useSearchParams();
    const lens = LENSES.some(([k]) => k === params.get('lens')) ? params.get('lens') : 'work';
    const disc = params.get('disc') || 'All';
    const set = (k, v) => {
        const next = new URLSearchParams(params);
        next.set(k, v);
        if (k === 'disc' && v === 'All') next.delete('disc');
        setParams(next, { replace: true });
    };
    const f = t => disc === 'All' || t.includes(disc);

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

            {lens === 'work' && (
                <div style={{ ...grid(270), gap: '18px 16px' }}>
                    {WORKS.filter(w => f(w.t)).map(w => <WorkTile key={w.id} w={w} />)}
                </div>
            )}
            {lens === 'people' && (
                <div style={{ ...grid(300), gap: 16 }}>
                    {PEOPLE_IDS.filter(id => f(PEOPLE[id].t)).map(id => <PersonCard key={id} id={id} />)}
                </div>
            )}
            {lens === 'gigs' && (
                <div style={{ ...grid(320), gap: 16 }}>
                    {gigs.filter(g => disc === 'All' || g.disc === disc).map(g => <GigCard key={g.id} g={g} />)}
                </div>
            )}
        </div>
    );
};

export default Discover;
