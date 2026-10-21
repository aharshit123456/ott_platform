import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GIGS, PEOPLE, firstName } from './data';

// Client-side state for shortlists, pings, threads and gigs. Replies are
// simulated until a backend for the freelance network exists.
const WhamContext = createContext();

export const WhamProvider = ({ children }) => {
    const navigate = useNavigate();
    const [lists, setLists] = useState([{ id: 1, name: 'Perfume ad', people: ['sana'] }]);
    const [nid, setNid] = useState(2);
    const [pings, setPings] = useState({});
    const [threads, setThreads] = useState({});
    const [unread, setUnread] = useState({});
    const [myGigs, setMyGigs] = useState([]);
    const [sheet, setSheet] = useState(null);
    const [toast, setToast] = useState('');
    const toastTimer = useRef();
    const replyTimers = useRef([]);

    useEffect(() => () => {
        clearTimeout(toastTimer.current);
        replyTimers.current.forEach(clearTimeout);
    }, []);

    const flash = useCallback(m => {
        setToast(m);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 2200);
    }, []);

    const markRead = useCallback(pid => setUnread(u => ({ ...u, [pid]: false })), []);
    const openThread = pid => {
        markRead(pid);
        navigate(`/inbox/${pid}`);
    };

    const ping = (pid, ctx) => {
        if (pings[pid]) return openThread(pid);
        const p = PEOPLE[pid];
        setPings(s => ({ ...s, [pid]: { st: 'pinged', ctx } }));
        setThreads(s => ({ ...s, [pid]: [{ f: 'me', t: `Hi ${firstName(pid)}, interested in a quick chat about ${ctx}?` }] }));
        flash(`Pinged ${firstName(pid)}`);
        replyTimers.current.push(setTimeout(() => {
            setPings(s => ({ ...s, [pid]: { ...s[pid], st: p.open ? 'interested' : 'later' } }));
            setUnread(s => ({ ...s, [pid]: true }));
            setThreads(s => ({
                ...s,
                [pid]: [...s[pid], { f: 'them', t: p.open ? 'Yes, interested. Send me the details.' : `Booked at the moment. ${p.until}. Ping me after.` }],
            }));
        }, 2400));
    };

    const listContext = pid => (lists.find(l => l.people.includes(pid)) || {}).name || 'a project';

    // Button labels and colours shared by every place a person appears.
    const personState = pid => {
        const st = pings[pid] && pings[pid].st;
        const inList = lists.some(l => l.people.includes(pid));
        return {
            pingLabel: { pinged: 'Pinged', interested: 'Interested', later: 'Later' }[st] || 'Interested?',
            pingBg: st === 'interested' ? '#ffd23f' : st ? '#fff' : '#e8281c',
            pingFg: st ? '#14110f' : '#fff',
            onPing: () => ping(pid, listContext(pid)),
            listLabel: inList ? 'Listed' : '+ List',
            listBg: inList ? '#ffd23f' : '#fff',
            onList: () => setSheet({ type: 'add', pid }),
        };
    };

    const toggleInList = (listId, pid) => setLists(ls => ls.map(l => l.id !== listId ? l
        : { ...l, people: l.people.includes(pid) ? l.people.filter(p => p !== pid) : [...l.people, pid] }));

    const createList = (name, pid) => {
        const n = name.trim();
        if (!n) return false;
        setLists(ls => [...ls, { id: nid, name: n, people: pid ? [pid] : [] }]);
        setNid(nid + 1);
        flash(pid ? 'Created and added' : 'List created');
        return true;
    };

    const postGig = ({ title, disc, when }) => {
        setMyGigs(g => [{ id: `m${Date.now()}`, title, brief: `Posted by you. Matching ${disc.toLowerCase()} freelancers will see it.`, disc, when, by: 'me', resp: 'No responses yet' }, ...g]);
        setSheet(null);
        flash('Gig posted');
        navigate('/discover?lens=gigs');
    };

    const sendDetails = (pid, text, when) => {
        setThreads(s => ({ ...s, [pid]: [...s[pid], { f: 'me', t: `Details\nJob: ${text.trim() || 'Details to follow'}\nWhen: ${when}` }] }));
        setSheet(null);
        flash('Details sent');
    };

    const value = {
        lists, pings, threads, unread, sheet, toast,
        gigs: [...myGigs, ...GIGS],
        unreadCount: Object.values(unread).filter(Boolean).length,
        flash, ping, openThread, markRead, personState, setSheet, toggleInList, createList, postGig, sendDetails,
        removeFromList: (listId, pid) => setLists(ls => ls.map(l => l.id === listId ? { ...l, people: l.people.filter(p => p !== pid) } : l)),
    };

    return <WhamContext.Provider value={value}>{children}</WhamContext.Provider>;
};

export const useWham = () => useContext(WhamContext);
