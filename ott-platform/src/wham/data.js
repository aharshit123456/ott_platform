// Seed content for WHAM!. All people, work and gigs are invented.

export const DISC = ['Editing', 'Videography', 'Sound', 'Motion/VFX', 'Directing', 'Writing', 'Photography', 'Producing', 'Reels'];
const COLS = ['#e8281c', '#ffd23f', '#2f6f6b', '#7a2f66', '#ff7a1a', '#2d5fb8', '#14110f', '#e8281c', '#2f6f6b'];

// av: availability for the next six weeks. o = open, p = partly, b = booked.
export const PEOPLE = {
  ria: { name: 'Ria Kapoor', ini: 'RK', d: 'Video editor', t: ['Editing', 'Reels'], city: 'Mumbai', av: 'oopbbb', resp: '2h', turn: 'Rough cut in 3 days', gear: ['Premiere Pro', 'DaVinci Resolve', 'After Effects'], open: true, until: '', cw: ['dev', 'sana', 'leo'], reel: '1:10' },
  dev: { name: 'Dev Malhotra', ini: 'DM', d: 'Videographer · DOP', t: ['Videography'], city: 'Delhi', av: 'ppoobo', resp: '4h', turn: 'Footage in 24h', gear: ['Sony FX3', 'DJI RS3', 'Aputure 300d', 'Mavic 3'], open: true, until: '', cw: ['nikhil', 'ria', 'jai'], reel: '0:58' },
  sana: { name: 'Sana Qureshi', ini: 'SQ', d: 'Sound designer', t: ['Sound'], city: 'Hyderabad', av: 'oooppb', resp: '1h', turn: 'First mix in 4 days', gear: ['Pro Tools', 'Zoom F6', 'Sennheiser MKH 416'], open: true, until: '', cw: ['nikhil', 'ria', 'tara'], reel: '1:20' },
  jai: { name: 'Jai Menon', ini: 'JM', d: 'Motion designer · VFX', t: ['Motion/VFX'], city: 'Bengaluru', av: 'bpooop', resp: '6h', turn: 'Style frames in 2 days', gear: ['After Effects', 'Cinema 4D', 'Houdini'], open: true, until: '', cw: ['dev', 'priya'], reel: '1:02' },
  nikhil: { name: 'Nikhil Rao', ini: 'NR', d: 'Director', t: ['Directing'], city: 'Chennai', av: 'bbbbpo', resp: '1d', turn: 'Treatment in 5 days', gear: ['Frame.io', 'ARRI Mini LF (rental)'], open: false, until: 'Booked until 23 Nov', cw: ['dev', 'sana', 'ria'], reel: '1:30' },
  tara: { name: 'Tara Bhatt', ini: 'TB', d: 'Scriptwriter', t: ['Writing'], city: 'Pune', av: 'ooooop', resp: '3h', turn: 'First draft in 5 days', gear: ['Final Draft', 'Notion'], open: true, until: '', cw: ['priya', 'sana'], reel: '0:40' },
  omar: { name: 'Omar Sheikh', ini: 'OS', d: 'Photographer', t: ['Photography'], city: 'Mumbai', av: 'bbppoo', resp: '5h', turn: 'Selects in 48h', gear: ['Canon R5', 'Profoto B10', 'Lightroom'], open: false, until: 'Booked until 9 Nov', cw: ['priya', 'leo'], reel: '0:35' },
  priya: { name: 'Priya Nair', ini: 'PN', d: 'Producer', t: ['Producing'], city: 'Kochi', av: 'pppooo', resp: '2h', turn: 'Schedule in 2 days', gear: ['StudioBinder', 'Movie Magic'], open: true, until: '', cw: ['tara', 'dev', 'jai'], reel: '0:50' },
  leo: { name: "Leo D'Souza", ini: 'LD', d: 'Reels creator', t: ['Reels', 'Videography'], city: 'Goa', av: 'oooooo', resp: '1h', turn: 'Reel in 24h', gear: ['iPhone 16 Pro', 'CapCut', 'Gimbal'], open: true, until: '', cw: ['ria', 'omar'], reel: '0:30' },
};
export const PEOPLE_IDS = Object.keys(PEOPLE);

// c: credits as [personId, role]
export const WORKS = [
  { id: 'w1', title: 'Chai Masala: 30s TVC', kind: 'Ad', len: '0:30', year: '2026', t: ['Directing', 'Videography', 'Editing', 'Sound'], desc: 'A 30 second spot shot in one day in Chennai for a tea brand.', c: [['nikhil', 'Director'], ['dev', 'DOP'], ['ria', 'Editor'], ['sana', 'Sound design']] },
  { id: 'w2', title: 'Monsoon Mood: reel pack', kind: 'Reel', len: '0:28', year: '2026', t: ['Reels', 'Editing'], desc: 'Six vertical cutdowns for a cafe chain.', c: [['leo', 'Creator'], ['ria', 'Editor']] },
  { id: 'w3', title: 'Glass City: brand film', kind: 'Brand film', len: '2:40', year: '2026', t: ['Videography', 'Motion/VFX'], desc: 'Architecture film with animated overlays.', c: [['dev', 'DOP'], ['jai', 'Motion graphics'], ['priya', 'Producer']] },
  { id: 'w4', title: 'Hush: sound-only short', kind: 'Audio', len: '3:12', year: '2025', t: ['Sound'], desc: 'A short film told through sound design alone.', c: [['sana', 'Sound design'], ['tara', 'Writer']] },
  { id: 'w5', title: 'Kaleidoscope: title sequence', kind: 'Motion', len: '0:45', year: '2026', t: ['Motion/VFX'], desc: 'Title sequence for a web series.', c: [['jai', 'Motion designer']] },
  { id: 'w6', title: 'Colaba Portraits', kind: 'Photo series', len: '12 stills', year: '2025', t: ['Photography'], desc: 'Street portraits shot over three mornings.', c: [['omar', 'Photographer']] },
  { id: 'w7', title: 'Founder Story: Bloom Foods', kind: 'Doc', len: '4:20', year: '2026', t: ['Producing', 'Writing', 'Videography', 'Editing'], desc: 'A founder profile made in five shooting days.', c: [['priya', 'Producer'], ['tara', 'Writer'], ['dev', 'DOP'], ['ria', 'Editor']] },
  { id: 'w8', title: 'Teaser: The Last Tape', kind: 'Teaser', len: '1:05', year: '2025', t: ['Writing', 'Directing'], desc: 'Teaser cut from a short script.', c: [['tara', 'Writer'], ['nikhil', 'Director']] },
  { id: 'w9', title: 'Beach Cafe: day in the life', kind: 'Reel', len: '0:35', year: '2026', t: ['Reels', 'Videography'], desc: 'Handheld vertical, shot on phone.', c: [['leo', 'Creator']] },
];

export const GIGS = [
  { id: 'g1', title: 'Editor for 6 reels a week', brief: 'Cafe chain, vertical cutdowns, brand kit provided. Two month run.', disc: 'Editing', when: 'Starts next week', by: 'priya', resp: '3 responses' },
  { id: 'g2', title: 'Sound design for a 45s perfume ad', brief: 'Foley, texture and a short sonic logo. Picture locked.', disc: 'Sound', when: 'This month', by: 'nikhil', resp: '1 response' },
  { id: 'g3', title: 'DOP for a one-day product shoot', brief: 'Pune studio, 12 products, lighting plan ready.', disc: 'Videography', when: 'Flexible', by: 'priya', resp: '5 responses' },
  { id: 'g4', title: 'Motion titles for a docu-series', brief: 'Six episodes, shared style frames. Ten second titles.', disc: 'Motion/VFX', when: 'Next month', by: 'nikhil', resp: 'No responses yet' },
  { id: 'g5', title: 'Photographer for founder portraits', brief: 'Eight founders over two days in Mumbai.', disc: 'Photography', when: 'This month', by: 'priya', resp: '2 responses' },
];

const hash = s => Math.abs([...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));

// Placeholder colours for reels and avatars. Sample content keeps the colours from the design.
export const personColor = id => {
    if (id === 'me') return '#14110f';
    const i = PEOPLE_IDS.indexOf(String(id).replace(/^seed-/, ''));
    return COLS[(i >= 0 ? i : hash(id)) % COLS.length];
};
export const workColor = w => {
    const i = WORKS.findIndex(x => x.title === w.title);
    return COLS[(i >= 0 ? i : hash(w.id)) % COLS.length];
};
export const responsesText = n => n === 0 ? 'No responses yet' : n === 1 ? '1 response' : `${n} responses`;
export const firstName = name => name.split(' ')[0];
export const subline = p => [p.headline, p.city].filter(Boolean).join(' · ');
