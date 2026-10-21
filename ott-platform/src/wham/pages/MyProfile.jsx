import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoad, useWham } from '../hooks';
import { DISC } from '../data';
import { Chip, Note } from '../components/ui';

const label = { fontSize: 12, fontWeight: 800 };
const row = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const half = { flex: '1 1 200px', minWidth: 0 };

const toForm = me => ({
    name: me?.name || '', headline: me?.headline || '', city: me?.city || '', disciplines: me?.disciplines || [],
    open_to_work: me ? me.open_to_work : true, booked_until: me?.booked_until || '', reply_time: me?.reply_time || '',
    turnaround: me?.turnaround || '', gear: (me?.gear || []).join(', '), reel_url: me?.reel_url || '', reel_length: me?.reel_length || '',
});

const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

const ProfileForm = ({ me }) => {
    const { saveMe, flash } = useWham();
    const [f, setF] = useState(() => toForm(me));
    const set = k => e => setF({ ...f, [k]: e.target.value });
    const save = e => {
        e.preventDefault();
        if (!f.name.trim()) return flash('Add your name');
        const blank = v => v.trim() || null;
        saveMe({
            name: f.name.trim(), headline: blank(f.headline), city: blank(f.city), disciplines: f.disciplines, open_to_work: f.open_to_work,
            booked_until: f.booked_until || null, reply_time: blank(f.reply_time), turnaround: blank(f.turnaround),
            gear: f.gear.split(',').map(s => s.trim()).filter(Boolean), reel_url: blank(f.reel_url), reel_length: blank(f.reel_length),
        });
    };
    return (
        <form onSubmit={save} className="w-card w-shadow" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={row}>
                <input style={half} className="w-input" value={f.name} onChange={set('name')} placeholder="Your name" />
                <input style={half} className="w-input" value={f.headline} onChange={set('headline')} placeholder="What you do, e.g. Video editor" />
            </div>
            <input className="w-input" value={f.city} onChange={set('city')} placeholder="City" />
            <div style={label}>Disciplines</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DISC.map(d => <Chip key={d} active={f.disciplines.includes(d)} onClick={() => setF({ ...f, disciplines: toggle(f.disciplines, d) })}>{d}</Chip>)}
            </div>
            <div style={label}>Availability</div>
            <div style={{ ...row, alignItems: 'center' }}>
                <Chip active={f.open_to_work} onClick={() => setF({ ...f, open_to_work: true })}>Open to work</Chip>
                <Chip active={!f.open_to_work} onClick={() => setF({ ...f, open_to_work: false })}>Not taking work</Chip>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 700 }}>
                    Booked until <input type="date" className="w-input" style={{ padding: '6px 10px' }} value={f.booked_until} onChange={set('booked_until')} />
                </label>
            </div>
            <div style={row}>
                <input style={half} className="w-input" value={f.reply_time} onChange={set('reply_time')} placeholder="Replies in, e.g. 2h" />
                <input style={half} className="w-input" value={f.turnaround} onChange={set('turnaround')} placeholder="Typical turnaround, e.g. Rough cut in 3 days" />
            </div>
            <input className="w-input" value={f.gear} onChange={set('gear')} placeholder="Gear and software, comma separated" />
            <div style={row}>
                <input style={{ ...half, flex: '3 1 240px' }} className="w-input" value={f.reel_url} onChange={set('reel_url')} placeholder="Showreel video link" />
                <input style={half} className="w-input" value={f.reel_length} onChange={set('reel_length')} placeholder="Reel length, e.g. 1:10" />
            </div>
            <button type="submit" className="w-btn" style={{ alignSelf: 'flex-start', background: '#e8281c', color: '#fff', padding: '10px 24px', fontSize: 14, boxShadow: '2px 2px 0 #14110f' }}>
                {me ? 'Save profile' : 'Create profile'}
            </button>
        </form>
    );
};

const AddWork = ({ me }) => {
    const { source, run, flash } = useWham();
    const navigate = useNavigate();
    const { data: people } = useLoad(() => source.people(), []);
    const empty = { title: '', kind: '', length: '', year: '', my_role: '', media_url: '', disciplines: [], credits: [] };
    const [f, setF] = useState(empty);
    const [pick, setPick] = useState({ person_id: '', role: '' });
    const set = k => e => setF({ ...f, [k]: e.target.value });
    const others = (people || []).filter(p => p.id !== me.id && !f.credits.some(c => c.person_id === p.id));
    const nameOf = id => (people || []).find(p => p.id === id)?.name || id;
    const addCredit = () => {
        if (!pick.person_id || !pick.role.trim()) return flash('Pick a person and their role');
        setF({ ...f, credits: [...f.credits, { person_id: pick.person_id, role: pick.role.trim() }] });
        setPick({ person_id: '', role: '' });
    };
    const submit = e => {
        e.preventDefault();
        if (!f.title.trim() || !f.my_role.trim()) return flash('Add a title and your role');
        const blank = v => v.trim() || null;
        run(() => source.createWork({
            title: f.title.trim(), kind: blank(f.kind), length: blank(f.length), year: f.year ? Number(f.year) : null,
            my_role: f.my_role.trim(), media_url: blank(f.media_url), disciplines: f.disciplines, credits: f.credits,
        }), w => { flash('Work added'); setF(empty); navigate(`/work/${w.id}`); });
    };
    return (
        <form onSubmit={submit} className="w-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={row}>
                <input style={{ ...half, flex: '3 1 240px' }} className="w-input" value={f.title} onChange={set('title')} placeholder="Title, e.g. Chai Masala: 30s TVC" />
                <input style={half} className="w-input" value={f.my_role} onChange={set('my_role')} placeholder="Your role, e.g. Editor" />
            </div>
            <div style={row}>
                <input style={half} className="w-input" value={f.kind} onChange={set('kind')} placeholder="Kind, e.g. Ad, Reel" />
                <input style={half} className="w-input" value={f.length} onChange={set('length')} placeholder="Length, e.g. 0:30" />
                <input style={half} className="w-input" type="number" value={f.year} onChange={set('year')} placeholder="Year" />
            </div>
            <input className="w-input" value={f.media_url} onChange={set('media_url')} placeholder="Video link" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DISC.map(d => <Chip key={d} active={f.disciplines.includes(d)} onClick={() => setF({ ...f, disciplines: toggle(f.disciplines, d) })}>{d}</Chip>)}
            </div>
            <div style={label}>Credit your collaborators (you vouch for these credits)</div>
            {f.credits.map(c => (
                <div key={c.person_id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <b>{nameOf(c.person_id)}</b><span style={{ color: '#5b5348', flex: 1 }}>{c.role}</span>
                    <button type="button" className="w-link-btn" style={{ fontSize: 12 }} onClick={() => setF({ ...f, credits: f.credits.filter(x => x.person_id !== c.person_id) })}>Remove</button>
                </div>
            ))}
            <div style={row}>
                <select style={half} className="w-input" value={pick.person_id} onChange={e => setPick({ ...pick, person_id: e.target.value })}>
                    <option value="">Pick a person</option>
                    {others.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input style={half} className="w-input" value={pick.role} onChange={e => setPick({ ...pick, role: e.target.value })} placeholder="Their role, e.g. DOP" />
                <button type="button" onClick={addCredit} className="w-btn" style={{ padding: '8px 16px', fontSize: 13 }}>Add credit</button>
            </div>
            <button type="submit" className="w-btn" style={{ alignSelf: 'flex-start', background: '#ffd23f', padding: '10px 24px', fontSize: 14, boxShadow: '2px 2px 0 #14110f' }}>Add work</button>
        </form>
    );
};

const MyProfile = () => {
    const { signedIn, me } = useWham();
    if (!signedIn) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820, margin: '0 auto' }}>
                <h1 className="w-h1" style={{ margin: 0, fontWeight: 400 }}>Your profile</h1>
                <Note dashed>Log in to create your profile and get found. <Link to="/?auth=login">Log in</Link> or <Link to="/?auth=signup">sign up</Link>.</Note>
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <h1 className="w-h1" style={{ margin: 0, fontWeight: 400, flex: 1 }}>Your profile</h1>
                {me && <Link to={`/people/${me.id}`} style={{ fontWeight: 800 }}>See how others see it</Link>}
            </div>
            {!me && <div style={{ fontSize: 13, color: '#3d372f' }}>Create a profile so people can find you, ping you and credit you on their work.</div>}
            <ProfileForm key={me?.id || 'new'} me={me} />
            {me && (
                <>
                    <div className="w-h2">Add work</div>
                    <AddWork me={me} />
                </>
            )}
        </div>
    );
};

export default MyProfile;
