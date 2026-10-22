import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from './api';
import { createApiSource, createDemoSource } from './source';
import { firstName } from './data';
import { WhamContext } from './hooks';

// Shared WHAM! state: the data source, the signed-in user's profile, shortlists
// and inbox, plus actions. Pages fetch their own lists through `source`.
const INBOX_POLL_MS = 15000;

export const WhamProvider = ({ children }) => {
    const navigate = useNavigate();
    const { user, session } = useAuth();
    const token = session?.access_token;
    const [version, setVersion] = useState(0);
    const refresh = useCallback(() => setVersion(v => v + 1), []);
    const [demo] = useState(() => API_URL ? null : createDemoSource(refresh));
    const source = useMemo(() => demo || createApiSource(token), [demo, token]);
    const signedIn = !API_URL || !!user;

    const [account, setAccount] = useState({ me: null, lists: [], inbox: [] });
    const setMe = me => setAccount(a => ({ ...a, me }));
    const setInbox = inbox => setAccount(a => ({ ...a, inbox }));
    // Nothing account-specific is shown once signed out.
    const { me, lists, inbox } = signedIn ? account : { me: null, lists: [], inbox: [] };
    const [sheet, setSheet] = useState(null);
    const [toast, setToast] = useState('');
    const toastTimer = useRef();

    const flash = useCallback(m => {
        setToast(m);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 2200);
    }, []);
    useEffect(() => () => clearTimeout(toastTimer.current), []);

    useEffect(() => {
        if (!signedIn) return;
        let live = true;
        Promise.all([source.me(), source.shortlists(), source.inbox()])
            .then(([m, l, i]) => { if (live) setAccount({ me: m, lists: l, inbox: i }); })
            .catch(e => live && flash(e.message));
        return () => { live = false; };
    }, [source, signedIn, user?.id, version, flash]);

    // Replies from other people arrive by polling the inbox.
    useEffect(() => {
        if (!API_URL || !signedIn) return;
        const t = setInterval(() => {
            if (document.visibilityState === 'visible') source.inbox().then(setInbox).catch(() => {});
        }, INBOX_POLL_MS);
        return () => clearInterval(t);
    }, [source, signedIn]);

    // Runs a write, refreshes shared state, and turns auth/profile errors into the right next step.
    const askLogin = useCallback(() => {
        flash('Log in to do that');
        navigate('/?auth=login');
    }, [flash, navigate]);

    const run = useCallback(async (fn, done) => {
        if (!signedIn) return askLogin();
        try {
            const res = await fn();
            if (done) done(res);
            refresh();
            return res;
        } catch (e) {
            if (e.status === 401) askLogin();
            else if (e.status === 403 && /profile/i.test(e.message)) { flash(e.message); navigate('/me'); }
            else flash(e.message);
            return null;
        }
    }, [signedIn, askLogin, flash, navigate, refresh]);

    const convWith = pid => inbox.find(c => c.other.id === pid);
    const listContext = pid => (lists.find(l => l.people.some(p => p.id === pid)) || {}).name || 'a project';

    const ping = (person, ctx) => {
        const c = convWith(person.id);
        if (c && c.status !== 'later') return navigate(`/inbox/${c.id}`);
        return run(() => source.ping(person.id, ctx), () => flash(`Pinged ${firstName(person.name)}${c ? ' again' : ''}`));
    };

    // Button labels and colours shared by every place a person appears.
    const personState = person => {
        const c = convWith(person.id);
        const st = c && (c.status === 'pinged' && c.role === 'recipient' ? 'reply' : c.status);
        const inList = lists.some(l => l.people.some(p => p.id === person.id));
        const isMe = me && me.id === person.id;
        return {
            isMe,
            pingLabel: isMe ? 'You' : { pinged: 'Pinged', interested: 'Interested', later: 'Later', reply: 'Reply' }[st] || 'Interested?',
            pingBg: st === 'interested' || st === 'reply' ? '#ffd23f' : st || isMe ? '#fff' : '#e8281c',
            pingFg: st || isMe ? '#14110f' : '#fff',
            onPing: () => isMe ? navigate('/me') : ping(person, listContext(person.id)),
            listLabel: inList ? 'Listed' : '+ List',
            listBg: inList ? '#ffd23f' : '#fff',
            onList: () => signedIn ? setSheet({ type: 'add', person }) : askLogin(),
        };
    };

    const value = {
        source, version, signedIn, me, lists, inbox, sheet, toast, apiMode: !!API_URL,
        unreadCount: inbox.reduce((n, c) => n + c.unread, 0),
        flash, run, refresh, setSheet, personState, convWith,
        ping: (person, ctx) => ping(person, ctx),
        respondGig: g => run(() => source.respondGig(g.id), () => flash('Responded')),
        toggleInList: (list, person) => list.people.some(p => p.id === person.id)
            ? run(() => source.removeFromShortlist(list.id, person.id))
            : run(() => source.addToShortlist(list.id, person.id)),
        removeFromList: (list, person) => run(() => source.removeFromShortlist(list.id, person.id)),
        createList: (name, person) => {
            const n = name.trim();
            if (!n) return Promise.resolve(null);
            return run(() => source.createShortlist(n, person?.id), () => flash(person ? 'Created and added' : 'List created'));
        },
        postGig: body => run(() => source.postGig(body), () => {
            setSheet(null);
            flash('Gig posted');
            navigate('/discover?lens=gigs');
        }),
        saveMe: body => run(() => source.saveMe(body), m => { setMe(m); flash('Profile saved'); }),
    };

    return <WhamContext.Provider value={value}>{children}</WhamContext.Provider>;
};
