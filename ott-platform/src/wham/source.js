// Two interchangeable data sources with the same method names and result shapes:
// the WHAM! API (when VITE_API_URL is set) and an in-memory demo built from data.js.
import { ApiError, request } from './api';
import { GIGS, PEOPLE, PEOPLE_IDS, WORKS } from './data';

export function createApiSource(token) {
    const call = (path, opts = {}) => request(path, { ...opts, token });
    return {
        works: discipline => call('/works', { params: { discipline } }),
        work: id => call(`/works/${id}`),
        people: discipline => call('/people', { params: { discipline } }),
        person: id => call(`/people/${id}`),
        gigs: discipline => call('/gigs', { params: { discipline } }),
        postGig: body => call('/gigs', { method: 'POST', body }),
        createWork: body => call('/works', { method: 'POST', body }),
        respondGig: id => call(`/gigs/${id}/respond`, { method: 'POST' }),
        shortlists: () => call('/shortlists'),
        createShortlist: (name, personId) => call('/shortlists', { method: 'POST', body: { name, person_id: personId } }),
        addToShortlist: (listId, pid) => call(`/shortlists/${listId}/people/${pid}`, { method: 'PUT' }),
        removeFromShortlist: (listId, pid) => call(`/shortlists/${listId}/people/${pid}`, { method: 'DELETE' }),
        inbox: () => call('/inbox'),
        conversation: id => call(`/conversations/${id}`),
        ping: (to, context) => call('/pings', { method: 'POST', body: { to, context } }),
        reply: (id, interested) => call(`/conversations/${id}/reply`, { method: 'POST', body: { interested } }),
        sendMessage: (id, body) => call(`/conversations/${id}/messages`, { method: 'POST', body: { body } }),
        shareDetails: (id, job, when) => call(`/conversations/${id}/details`, { method: 'POST', body: { job, when } }),
        me: () => call('/me').catch(e => { if (e.status === 404) return null; throw e; }),
        saveMe: body => call('/me', { method: 'PUT', body }),
    };
}

const STATUS = { o: 'open', p: 'partly', b: 'booked' };
const first = name => name.split(' ')[0];
const initials = name => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const thisMonday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
const weekLabel = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export function createDemoSource(onChange) {
    const ME = 'me';
    const people = Object.fromEntries(PEOPLE_IDS.map(k => {
        const p = PEOPLE[k];
        return [`seed-${k}`, { id: `seed-${k}`, name: p.name, headline: p.d, disciplines: p.t, city: p.city, av: p.av, open: p.open, until: p.until, reply_time: p.resp, turnaround: p.turn, gear: p.gear, reel_length: p.reel }];
    }));
    const works = WORKS.map(w => ({ ...w, c: w.c.map(([k, role]) => [`seed-${k}`, role]) }));
    let gigs = GIGS.map(g => ({ ...g, by: `seed-${g.by}` }));
    let lists = [{ id: 1, name: 'Perfume ad', people: ['seed-sana'] }];
    let convs = [];
    let nextId = 100;

    const summary = id => {
        const p = people[id];
        if (!p) return { id, name: 'You', initials: 'ME', headline: null, city: null, disciplines: [], open: true, availability_text: 'Open to work', reply_time: null, reel_length: null };
        return {
            id, name: p.name, initials: initials(p.name), headline: p.headline, city: p.city, disciplines: p.disciplines,
            open: p.open, availability_text: p.open ? 'Open to work' : p.until, reply_time: p.reply_time, reel_length: p.reel_length,
        };
    };
    const workDict = w => ({
        id: w.id, title: w.title, kind: w.kind, length: w.len, year: w.year, description: w.desc, disciplines: w.t,
        credits: w.c.map(([pid, role], i) => {
            const v = w.c[(i + 1) % w.c.length][0];
            return { person: summary(pid), role, verified_by: v !== pid ? { id: v, name: people[v].name } : null };
        }),
    });
    const personDetail = id => {
        const p = people[id];
        const mine = works.filter(w => w.c.some(c => c[0] === id));
        const shared = {};
        mine.forEach(w => w.c.forEach(([pid]) => { if (pid !== id) shared[pid] = (shared[pid] || 0) + 1; }));
        const monday = thisMonday();
        const wks = [...(p.av || 'oooooo')].map((ch, i) => {
            const d = new Date(monday); d.setDate(d.getDate() + 7 * i);
            return { week_start: d.toISOString().slice(0, 10), label: weekLabel(d), status: STATUS[ch] };
        });
        return {
            ...summary(id), turnaround: p.turnaround, gear: p.gear || [], reel_url: null, weeks: wks,
            verified_credits: mine.map(workDict).flatMap(w => w.credits).filter(c => c.person.id === id && c.verified_by).length,
            works: mine.map(w => ({ ...workDict(w), my_role: w.c.find(c => c[0] === id)[1] })),
            collaborators: Object.entries(shared).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([pid, n]) => ({ ...summary(pid), shared: n })),
        };
    };
    const gigDict = g => {
        const cs = convs.filter(c => c.gig_id === g.id);
        return { id: g.id, title: g.title, brief: g.brief, discipline: g.disc, when: g.when, poster: summary(g.by), mine: g.by === ME, responses: cs.length + (parseInt(g.resp, 10) || 0), responded: cs.length > 0 };
    };
    const convDict = (c, withMessages) => {
        const last = c.msgs[c.msgs.length - 1];
        return {
            id: c.id, other: summary(c.with), role: 'sender', context: c.context, gig_id: c.gig_id, status: c.status,
            unread: c.msgs.filter(m => !m.mine && !m.read).length, last_message: last && { body: last.body, from_me: last.mine },
            ...(withMessages ? { messages: c.msgs.map((m, i) => ({ id: i, from_me: m.mine, kind: m.kind, body: m.body })) } : {}),
        };
    };
    const listDict = l => ({ id: l.id, name: l.name, people: l.people.map(summary) });
    const need = (cond, msg) => { if (!cond) throw new ApiError(409, msg); };
    const getConv = id => convs.find(c => String(c.id) === String(id));
    const hasDisc = d => x => !d || x.includes(d);

    const ping = (to, context, gig) => {
        let c = convs.find(x => x.with === to);
        const created = !c;
        const name = first(people[to].name);
        if (created) {
            c = { id: nextId++, with: to, context, gig_id: gig?.id ?? null, status: 'pinged', msgs: [{ mine: true, kind: 'text', body: `Hi ${name}, interested in a quick chat about ${context}?` }] };
            convs = [c, ...convs];
        } else if (gig && c.gig_id !== gig.id) {
            Object.assign(c, { gig_id: gig.id, context: gig.title });
            c.msgs.push({ mine: true, kind: 'text', body: `Responding to your gig: ${gig.title}` });
        } else if (c.status === 'later') {
            Object.assign(c, { status: 'pinged', context });
            c.msgs.push({ mine: true, kind: 'text', body: `Hi ${name}, checking in again about ${context}. Free now?` });
        }
        if (c.status === 'pinged') {
            // Simulated reply: open people say yes, booked people ask for a later ping.
            const p = people[to];
            setTimeout(() => {
                if (c.status !== 'pinged') return;
                c.status = p.open ? 'interested' : 'later';
                c.msgs.push({ mine: false, kind: 'text', body: p.open ? 'Yes, interested. Send me the details.' : `Booked at the moment. ${p.until}. Ping me after.` });
                onChange();
            }, 2400);
        }
        return { ...convDict(c), created };
    };

    return {
        works: async d => works.filter(w => hasDisc(d)(w.t)).map(workDict),
        work: async id => {
            const w = works.find(x => x.id === id);
            if (!w) throw new ApiError(404, 'Work not found');
            return workDict(w);
        },
        people: async d => Object.keys(people).filter(id => hasDisc(d)(people[id].disciplines)).map(summary),
        person: async id => {
            if (!people[id]) throw new ApiError(404, 'Person not found');
            return personDetail(id);
        },
        gigs: async d => gigs.filter(g => !d || g.disc === d).map(gigDict),
        postGig: async ({ title, brief, discipline, when }) => {
            const g = { id: `m${nextId++}`, title, brief: brief || `Posted by you. Matching ${discipline.toLowerCase()} freelancers will see it.`, disc: discipline, when, by: ME };
            gigs = [g, ...gigs];
            return gigDict(g);
        },
        respondGig: async id => {
            const g = gigs.find(x => x.id === id);
            need(g.by !== ME, 'This is your gig');
            return ping(g.by, g.title, g);
        },
        createWork: async body => {
            if (!people[ME]) throw new ApiError(403, 'Create your WHAM! profile first');
            const w = { id: `m${nextId++}`, title: body.title, kind: body.kind, len: body.length, year: body.year, desc: body.description, t: body.disciplines,
                c: [[ME, body.my_role], ...body.credits.map(c => [c.person_id, c.role])] };
            works.unshift(w);
            return workDict(w);
        },
        shortlists: async () => lists.map(listDict),
        createShortlist: async (name, pid) => {
            const l = { id: nextId++, name, people: pid ? [pid] : [] };
            lists = [...lists, l];
            return listDict(l);
        },
        addToShortlist: async (listId, pid) => {
            lists = lists.map(l => l.id === listId && !l.people.includes(pid) ? { ...l, people: [...l.people, pid] } : l);
            return listDict(lists.find(l => l.id === listId));
        },
        removeFromShortlist: async (listId, pid) => {
            lists = lists.map(l => l.id === listId ? { ...l, people: l.people.filter(p => p !== pid) } : l);
            return listDict(lists.find(l => l.id === listId));
        },
        inbox: async () => convs.map(c => convDict(c)),
        conversation: async id => {
            const c = getConv(id);
            if (!c) throw new ApiError(404, 'Conversation not found');
            c.msgs.forEach(m => { m.read = true; });
            return convDict(c, true);
        },
        ping: async (to, context) => ping(to, context),
        reply: async () => { throw new ApiError(403, 'Only the person who was pinged can reply'); },
        sendMessage: async (id, body) => {
            const c = getConv(id);
            need(c.status === 'interested', "Messages open once they reply that they're interested");
            c.msgs.push({ mine: true, kind: 'text', body });
            return convDict(c, true);
        },
        shareDetails: async (id, job, when) => {
            const c = getConv(id);
            need(c.status === 'interested', "Messages open once they reply that they're interested");
            c.msgs.push({ mine: true, kind: 'details', body: `Details\nJob: ${job.trim() || 'Details to follow'}\nWhen: ${when}` });
            return convDict(c, true);
        },
        me: async () => (people[ME] ? { ...personDetail(ME), open_to_work: people[ME].open, booked_until: null } : null),
        saveMe: async body => {
            people[ME] = { id: ME, name: body.name, headline: body.headline, disciplines: body.disciplines, city: body.city, open: body.open_to_work, until: 'Not taking work', reply_time: body.reply_time, turnaround: body.turnaround, gear: body.gear, reel_length: body.reel_length, av: 'oooooo' };
            return { ...personDetail(ME), open_to_work: body.open_to_work, booked_until: null };
        },
    };
}
