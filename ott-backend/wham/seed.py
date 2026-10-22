"""Load the WHAM! sample creators, work and gigs (all invented).

    python -m wham.seed

Safe to run twice: it does nothing if the sample data is already there.
Sample profiles use ids starting with "seed-" and have no login.
"""
from datetime import date, timedelta

from database import SessionLocal
from .models import Credit, Gig, Profile, Work
from . import router  # noqa: F401  (creates the tables)

# av: next six weeks from this week. o = open, p = partly, b = booked.
PEOPLE = {
    'ria': dict(name='Ria Kapoor', headline='Video editor', disciplines=['Editing', 'Reels'], city='Mumbai', av='oopbbb', reply_time='2h', turnaround='Rough cut in 3 days', gear=['Premiere Pro', 'DaVinci Resolve', 'After Effects'], reel_length='1:10'),
    'dev': dict(name='Dev Malhotra', headline='Videographer · DOP', disciplines=['Videography'], city='Delhi', av='ppoobo', reply_time='4h', turnaround='Footage in 24h', gear=['Sony FX3', 'DJI RS3', 'Aputure 300d', 'Mavic 3'], reel_length='0:58'),
    'sana': dict(name='Sana Qureshi', headline='Sound designer', disciplines=['Sound'], city='Hyderabad', av='oooppb', reply_time='1h', turnaround='First mix in 4 days', gear=['Pro Tools', 'Zoom F6', 'Sennheiser MKH 416'], reel_length='1:20'),
    'jai': dict(name='Jai Menon', headline='Motion designer · VFX', disciplines=['Motion/VFX'], city='Bengaluru', av='bpooop', reply_time='6h', turnaround='Style frames in 2 days', gear=['After Effects', 'Cinema 4D', 'Houdini'], reel_length='1:02'),
    'nikhil': dict(name='Nikhil Rao', headline='Director', disciplines=['Directing'], city='Chennai', av='bbbbpo', reply_time='1d', turnaround='Treatment in 5 days', gear=['Frame.io', 'ARRI Mini LF (rental)'], reel_length='1:30', booked_weeks=4),
    'tara': dict(name='Tara Bhatt', headline='Scriptwriter', disciplines=['Writing'], city='Pune', av='ooooop', reply_time='3h', turnaround='First draft in 5 days', gear=['Final Draft', 'Notion'], reel_length='0:40'),
    'omar': dict(name='Omar Sheikh', headline='Photographer', disciplines=['Photography'], city='Mumbai', av='bbppoo', reply_time='5h', turnaround='Selects in 48h', gear=['Canon R5', 'Profoto B10', 'Lightroom'], reel_length='0:35', booked_weeks=2),
    'priya': dict(name='Priya Nair', headline='Producer', disciplines=['Producing'], city='Kochi', av='pppooo', reply_time='2h', turnaround='Schedule in 2 days', gear=['StudioBinder', 'Movie Magic'], reel_length='0:50'),
    'leo': dict(name="Leo D'Souza", headline='Reels creator', disciplines=['Reels', 'Videography'], city='Goa', av='oooooo', reply_time='1h', turnaround='Reel in 24h', gear=['iPhone 16 Pro', 'CapCut', 'Gimbal'], reel_length='0:30'),
}

WORKS = [
    dict(title='Chai Masala: 30s TVC', kind='Ad', length='0:30', year=2026, disciplines=['Directing', 'Videography', 'Editing', 'Sound'], description='A 30 second spot shot in one day in Chennai for a tea brand.', c=[('nikhil', 'Director'), ('dev', 'DOP'), ('ria', 'Editor'), ('sana', 'Sound design')]),
    dict(title='Monsoon Mood: reel pack', kind='Reel', length='0:28', year=2026, disciplines=['Reels', 'Editing'], description='Six vertical cutdowns for a cafe chain.', c=[('leo', 'Creator'), ('ria', 'Editor')]),
    dict(title='Glass City: brand film', kind='Brand film', length='2:40', year=2026, disciplines=['Videography', 'Motion/VFX'], description='Architecture film with animated overlays.', c=[('dev', 'DOP'), ('jai', 'Motion graphics'), ('priya', 'Producer')]),
    dict(title='Hush: sound-only short', kind='Audio', length='3:12', year=2025, disciplines=['Sound'], description='A short film told through sound design alone.', c=[('sana', 'Sound design'), ('tara', 'Writer')]),
    dict(title='Kaleidoscope: title sequence', kind='Motion', length='0:45', year=2026, disciplines=['Motion/VFX'], description='Title sequence for a web series.', c=[('jai', 'Motion designer')]),
    dict(title='Colaba Portraits', kind='Photo series', length='12 stills', year=2025, disciplines=['Photography'], description='Street portraits shot over three mornings.', c=[('omar', 'Photographer')]),
    dict(title='Founder Story: Bloom Foods', kind='Doc', length='4:20', year=2026, disciplines=['Producing', 'Writing', 'Videography', 'Editing'], description='A founder profile made in five shooting days.', c=[('priya', 'Producer'), ('tara', 'Writer'), ('dev', 'DOP'), ('ria', 'Editor')]),
    dict(title='Teaser: The Last Tape', kind='Teaser', length='1:05', year=2025, disciplines=['Writing', 'Directing'], description='Teaser cut from a short script.', c=[('tara', 'Writer'), ('nikhil', 'Director')]),
    dict(title='Beach Cafe: day in the life', kind='Reel', length='0:35', year=2026, disciplines=['Reels', 'Videography'], description='Handheld vertical, shot on phone.', c=[('leo', 'Creator')]),
]

GIGS = [
    dict(title='Editor for 6 reels a week', brief='Cafe chain, vertical cutdowns, brand kit provided. Two month run.', discipline='Editing', when='Starts next week', by='priya'),
    dict(title='Sound design for a 45s perfume ad', brief='Foley, texture and a short sonic logo. Picture locked.', discipline='Sound', when='This month', by='nikhil'),
    dict(title='DOP for a one-day product shoot', brief='Pune studio, 12 products, lighting plan ready.', discipline='Videography', when='Flexible', by='priya'),
    dict(title='Motion titles for a docu-series', brief='Six episodes, shared style frames. Ten second titles.', discipline='Motion/VFX', when='Next month', by='nikhil'),
    dict(title='Photographer for founder portraits', brief='Eight founders over two days in Mumbai.', discipline='Photography', when='This month', by='priya'),
]

STATUS = {'o': 'open', 'p': 'partly', 'b': 'booked'}

def sid(key: str) -> str:
    return f"seed-{key}"

def seed(db) -> bool:
    if db.get(Profile, sid('ria')):
        return False
    week0 = date.today() - timedelta(days=date.today().weekday())
    for key, p in PEOPLE.items():
        p = dict(p)
        av = p.pop('av')
        booked_weeks = p.pop('booked_weeks', 0)
        db.add(Profile(
            id=sid(key), **p, open_to_work=True,
            booked_until=week0 + timedelta(weeks=booked_weeks, days=-1) if booked_weeks else None,
            availability={(week0 + timedelta(weeks=i)).isoformat(): STATUS[ch] for i, ch in enumerate(av)},
        ))
    db.flush()
    # Oldest first, so the newest sample work lists first like in the design.
    for w in reversed(WORKS):
        w = dict(w)
        crew = w.pop('c')
        work = Work(**w, created_by=sid(crew[0][0]))
        db.add(work)
        db.flush()
        for i, (key, role) in enumerate(crew):
            verifier = crew[(i + 1) % len(crew)][0]
            db.add(Credit(work_id=work.id, person_id=sid(key), role=role, verified_by=sid(verifier) if verifier != key else None))
    for g in reversed(GIGS):
        g = dict(g)
        by = g.pop('by')
        db.add(Gig(**g, posted_by=sid(by)))
    db.commit()
    return True

if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Seeded WHAM! sample data" if seed(db) else "Sample data already present")
    finally:
        db.close()
