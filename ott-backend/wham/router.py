from collections import Counter
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from . import schemas
from .deps import current_user, optional_user
from .models import TABLES, Conversation, Credit, Gig, Message, Profile, Shortlist, ShortlistMember, Work

Base.metadata.create_all(bind=engine, tables=TABLES)
if engine.dialect.name == "postgresql":
    # Supabase exposes public tables over its REST API; with RLS on and no
    # policies, these tables are only reachable through this backend.
    with engine.begin() as conn:
        for t in TABLES:
            conn.execute(text(f'ALTER TABLE "{t.name}" ENABLE ROW LEVEL SECURITY'))

router = APIRouter(prefix="/wham", tags=["wham"])

# ---------- serialisers ----------

def _initials(name: str) -> str:
    return "".join(w[0] for w in name.split()[:2]).upper()

def _first(name: str) -> str:
    return name.split()[0]

def _availability_text(p: Profile) -> str:
    if p.booked_until and p.booked_until >= date.today():
        return f"Booked until {p.booked_until.day} {p.booked_until:%b}"
    return "Open to work" if p.open_to_work else "Not taking work"

def _weeks(p: Profile, n: int = 6) -> list[dict]:
    start = date.today() - timedelta(days=date.today().weekday())
    out = []
    for i in range(n):
        ws = start + timedelta(weeks=i)
        st = (p.availability or {}).get(ws.isoformat())
        if not st:
            booked = (p.booked_until and ws <= p.booked_until) or not p.open_to_work
            st = "booked" if booked else "open"
        out.append({"week_start": ws.isoformat(), "label": f"{ws.day} {ws:%b}", "status": st})
    return out

def person_summary(p: Profile) -> dict:
    text_ = _availability_text(p)
    return {
        "id": p.id, "name": p.name, "initials": _initials(p.name), "headline": p.headline, "city": p.city,
        "disciplines": p.disciplines or [], "open": text_ == "Open to work", "availability_text": text_,
        "reply_time": p.reply_time, "reel_length": p.reel_length,
    }

def _profiles(db: Session, ids) -> dict:
    ids = set(i for i in ids if i)
    if not ids:
        return {}
    return {p.id: p for p in db.query(Profile).filter(Profile.id.in_(ids)).all()}

def _work_dicts(db: Session, works: list[Work]) -> list[dict]:
    credits = db.query(Credit).filter(Credit.work_id.in_([w.id for w in works])).order_by(Credit.id).all() if works else []
    people = _profiles(db, [c.person_id for c in credits] + [c.verified_by for c in credits])
    by_work = {}
    for c in credits:
        v = people.get(c.verified_by)
        by_work.setdefault(c.work_id, []).append({
            "person": person_summary(people[c.person_id]), "role": c.role,
            "verified_by": {"id": v.id, "name": v.name} if v else None,
        })
    return [{
        "id": w.id, "title": w.title, "kind": w.kind, "length": w.length, "year": w.year,
        "description": w.description, "disciplines": w.disciplines or [], "media_url": w.media_url,
        "thumbnail_url": w.thumbnail_url, "created_by": w.created_by, "credits": by_work.get(w.id, []),
    } for w in works]

def _conv_dict(db: Session, c: Conversation, me: str, messages: bool = False) -> dict:
    other_id = c.recipient_id if c.sender_id == me else c.sender_id
    other = db.get(Profile, other_id)
    msgs = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.id).all()
    last = msgs[-1] if msgs else None
    d = {
        "id": c.id, "other": person_summary(other), "role": "sender" if c.sender_id == me else "recipient",
        "context": c.context, "gig_id": c.gig_id, "status": c.status,
        "unread": sum(1 for m in msgs if m.sender_id != me and m.read_at is None),
        "last_message": {"body": last.body, "from_me": last.sender_id == me} if last else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }
    if messages:
        d["messages"] = [{"id": m.id, "from_me": m.sender_id == me, "kind": m.kind, "body": m.body,
                          "created_at": m.created_at.isoformat() if m.created_at else None} for m in msgs]
    return d

def _shortlist_dict(db: Session, s: Shortlist) -> dict:
    members = db.query(ShortlistMember).filter(ShortlistMember.shortlist_id == s.id).order_by(ShortlistMember.id).all()
    people = _profiles(db, [m.person_id for m in members])
    return {"id": s.id, "name": s.name, "people": [person_summary(people[m.person_id]) for m in members]}

# ---------- lookups ----------

def _require_profile(db: Session, user_id: str) -> Profile:
    p = db.get(Profile, user_id)
    if not p:
        raise HTTPException(status_code=403, detail="Create your WHAM! profile first")
    return p

def _get_or_404(db: Session, model, id_, what: str):
    obj = db.get(model, id_)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{what} not found")
    return obj

def _between(db: Session, a: str, b: str):
    return db.query(Conversation).filter(or_(
        and_(Conversation.sender_id == a, Conversation.recipient_id == b),
        and_(Conversation.sender_id == b, Conversation.recipient_id == a),
    )).first()

def _participant(db: Session, conv_id: int, me: str) -> Conversation:
    c = _get_or_404(db, Conversation, conv_id, "Conversation")
    if me not in (c.sender_id, c.recipient_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return c

def _add_message(db: Session, c: Conversation, sender: str, body: str, kind: str = "text"):
    db.add(Message(conversation_id=c.id, sender_id=sender, body=body, kind=kind))
    c.updated_at = datetime.now(timezone.utc)

def _paged(items, offset, limit):
    return items[offset:offset + limit]

# ---------- reference ----------

@router.get("/disciplines")
def disciplines():
    return schemas.DISCIPLINES

# ---------- profiles ----------

@router.get("/me")
def get_me(db: Session = Depends(get_db), me: str = Depends(current_user)):
    p = db.get(Profile, me)
    if not p:
        raise HTTPException(status_code=404, detail="No profile yet")
    return {**person_summary(p), **_profile_extras(db, p), "booked_until": p.booked_until, "open_to_work": p.open_to_work}

@router.put("/me")
def put_me(body: schemas.ProfileIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    data = body.model_dump()
    data["availability"] = {k.isoformat(): v for k, v in data["availability"].items()}
    p = db.get(Profile, me)
    if p:
        for k, v in data.items():
            setattr(p, k, v)
    else:
        p = Profile(id=me, **data)
        db.add(p)
    db.commit()
    db.refresh(p)
    return {**person_summary(p), **_profile_extras(db, p), "booked_until": p.booked_until, "open_to_work": p.open_to_work}

def _profile_extras(db: Session, p: Profile) -> dict:
    my_credits = db.query(Credit).filter(Credit.person_id == p.id).all()
    role_by_work = {c.work_id: c.role for c in my_credits}
    works = db.query(Work).filter(Work.id.in_(role_by_work)).order_by(Work.created_at.desc(), Work.id.desc()).all() if role_by_work else []
    work_dicts = _work_dicts(db, works)
    shared = Counter(c["person"]["id"] for w in work_dicts for c in w["credits"] if c["person"]["id"] != p.id)
    collab_people = _profiles(db, shared)
    return {
        "turnaround": p.turnaround, "gear": p.gear or [], "reel_url": p.reel_url, "weeks": _weeks(p),
        "verified_credits": sum(1 for c in my_credits if c.verified_by),
        "works": [{**w, "my_role": role_by_work[w["id"]]} for w in work_dicts],
        "collaborators": [{**person_summary(collab_people[pid]), "shared": n} for pid, n in shared.most_common(3)],
    }

@router.get("/people")
def list_people(discipline: str = None, offset: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    people = db.query(Profile).order_by(Profile.created_at, Profile.id).all()
    if discipline:
        people = [p for p in people if discipline in (p.disciplines or [])]
    return [person_summary(p) for p in _paged(people, offset, min(limit, 200))]

@router.get("/people/{person_id}")
def get_person(person_id: str, db: Session = Depends(get_db)):
    p = _get_or_404(db, Profile, person_id, "Person")
    return {**person_summary(p), **_profile_extras(db, p)}

# ---------- work and credits ----------

@router.get("/works")
def list_works(discipline: str = None, offset: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    works = db.query(Work).order_by(Work.created_at.desc(), Work.id.desc()).all()
    if discipline:
        works = [w for w in works if discipline in (w.disciplines or [])]
    return _work_dicts(db, _paged(works, offset, min(limit, 200)))

@router.get("/works/{work_id}")
def get_work(work_id: int, db: Session = Depends(get_db)):
    return _work_dicts(db, [_get_or_404(db, Work, work_id, "Work")])[0]

@router.post("/works", status_code=201)
def create_work(body: schemas.WorkIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    _require_profile(db, me)
    others = {c.person_id: c.role for c in body.credits if c.person_id != me}
    missing = set(others) - set(_profiles(db, others))
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown people: {', '.join(sorted(missing))}")
    w = Work(**body.model_dump(exclude={"my_role", "credits"}), created_by=me)
    db.add(w)
    db.flush()
    db.add(Credit(work_id=w.id, person_id=me, role=body.my_role))
    for pid, role in others.items():
        db.add(Credit(work_id=w.id, person_id=pid, role=role, verified_by=me))
    db.commit()
    return _work_dicts(db, [w])[0]

def _my_credit(db: Session, work_id: int, me: str) -> Credit:
    _get_or_404(db, Work, work_id, "Work")
    mine = db.query(Credit).filter(Credit.work_id == work_id, Credit.person_id == me).first()
    if not mine:
        raise HTTPException(status_code=403, detail="Only people credited on this work can do that")
    return mine

@router.post("/works/{work_id}/credits", status_code=201)
def add_credit(work_id: int, body: schemas.CreditIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    _my_credit(db, work_id, me)
    _get_or_404(db, Profile, body.person_id, "Person")
    if db.query(Credit).filter(Credit.work_id == work_id, Credit.person_id == body.person_id).first():
        raise HTTPException(status_code=409, detail="Already credited")
    db.add(Credit(work_id=work_id, person_id=body.person_id, role=body.role, verified_by=me))
    db.commit()
    return get_work(work_id, db)

@router.post("/works/{work_id}/credits/{person_id}/verify")
def verify_credit(work_id: int, person_id: str, db: Session = Depends(get_db), me: str = Depends(current_user)):
    _my_credit(db, work_id, me)
    if person_id == me:
        raise HTTPException(status_code=400, detail="A collaborator has to verify your credit")
    c = db.query(Credit).filter(Credit.work_id == work_id, Credit.person_id == person_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Credit not found")
    c.verified_by = me
    db.commit()
    return get_work(work_id, db)

@router.delete("/works/{work_id}/credits/{person_id}")
def remove_credit(work_id: int, person_id: str, db: Session = Depends(get_db), me: str = Depends(current_user)):
    w = _get_or_404(db, Work, work_id, "Work")
    if me not in (person_id, w.created_by):
        raise HTTPException(status_code=403, detail="Only the credited person or the work's creator can remove a credit")
    c = db.query(Credit).filter(Credit.work_id == work_id, Credit.person_id == person_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Credit not found")
    db.delete(c)
    db.commit()
    return get_work(work_id, db)

# ---------- gigs ----------

def _gig_dicts(db: Session, gigs: list[Gig], me: str = None) -> list[dict]:
    posters = _profiles(db, [g.posted_by for g in gigs])
    convs = db.query(Conversation).filter(Conversation.gig_id.in_([g.id for g in gigs])).all() if gigs else []
    return [{
        "id": g.id, "title": g.title, "brief": g.brief, "discipline": g.discipline, "when": g.when,
        "poster": person_summary(posters[g.posted_by]), "mine": g.posted_by == me,
        "responses": sum(1 for c in convs if c.gig_id == g.id),
        "responded": any(c.gig_id == g.id and me in (c.sender_id, c.recipient_id) for c in convs) if me else False,
        "created_at": g.created_at.isoformat() if g.created_at else None,
    } for g in gigs]

@router.get("/gigs")
def list_gigs(discipline: str = None, offset: int = 0, limit: int = 50, db: Session = Depends(get_db), me: str = Depends(optional_user)):
    q = db.query(Gig).filter(Gig.is_open.is_(True))
    if discipline:
        q = q.filter(Gig.discipline == discipline)
    gigs = q.order_by(Gig.created_at.desc(), Gig.id.desc()).offset(offset).limit(min(limit, 200)).all()
    return _gig_dicts(db, gigs, me)

@router.post("/gigs", status_code=201)
def post_gig(body: schemas.GigIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    p = _require_profile(db, me)
    g = Gig(**body.model_dump(), posted_by=me)
    if not g.brief:
        g.brief = f"Posted by {_first(p.name)}. Matching {g.discipline.lower()} freelancers will see it."
    db.add(g)
    db.commit()
    return _gig_dicts(db, [g], me)[0]

@router.delete("/gigs/{gig_id}")
def close_gig(gig_id: int, db: Session = Depends(get_db), me: str = Depends(current_user)):
    g = _get_or_404(db, Gig, gig_id, "Gig")
    if g.posted_by != me:
        raise HTTPException(status_code=403, detail="Only the poster can close a gig")
    g.is_open = False
    db.commit()
    return {"id": g.id, "is_open": False}

@router.post("/gigs/{gig_id}/respond")
def respond_to_gig(gig_id: int, db: Session = Depends(get_db), me: str = Depends(current_user)):
    g = _get_or_404(db, Gig, gig_id, "Gig")
    if not g.is_open:
        raise HTTPException(status_code=409, detail="This gig is closed")
    if g.posted_by == me:
        raise HTTPException(status_code=400, detail="This is your gig")
    return _ping(db, me, g.posted_by, g.title, gig=g)

# ---------- shortlists ----------

def _my_shortlist(db: Session, list_id: int, me: str) -> Shortlist:
    s = db.get(Shortlist, list_id)
    if not s or s.owner_id != me:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    return s

@router.get("/shortlists")
def get_shortlists(db: Session = Depends(get_db), me: str = Depends(current_user)):
    lists = db.query(Shortlist).filter(Shortlist.owner_id == me).order_by(Shortlist.id).all()
    return [_shortlist_dict(db, s) for s in lists]

@router.post("/shortlists", status_code=201)
def create_shortlist(body: schemas.ShortlistIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    _require_profile(db, me)
    if body.person_id:
        _get_or_404(db, Profile, body.person_id, "Person")
    s = Shortlist(owner_id=me, name=body.name.strip())
    db.add(s)
    db.flush()
    if body.person_id:
        db.add(ShortlistMember(shortlist_id=s.id, person_id=body.person_id))
    db.commit()
    return _shortlist_dict(db, s)

@router.delete("/shortlists/{list_id}")
def delete_shortlist(list_id: int, db: Session = Depends(get_db), me: str = Depends(current_user)):
    s = _my_shortlist(db, list_id, me)
    db.query(ShortlistMember).filter(ShortlistMember.shortlist_id == s.id).delete()
    db.delete(s)
    db.commit()
    return {"id": list_id, "deleted": True}

@router.put("/shortlists/{list_id}/people/{person_id}")
def add_to_shortlist(list_id: int, person_id: str, db: Session = Depends(get_db), me: str = Depends(current_user)):
    s = _my_shortlist(db, list_id, me)
    _get_or_404(db, Profile, person_id, "Person")
    if not db.query(ShortlistMember).filter(ShortlistMember.shortlist_id == s.id, ShortlistMember.person_id == person_id).first():
        db.add(ShortlistMember(shortlist_id=s.id, person_id=person_id))
        db.commit()
    return _shortlist_dict(db, s)

@router.delete("/shortlists/{list_id}/people/{person_id}")
def remove_from_shortlist(list_id: int, person_id: str, db: Session = Depends(get_db), me: str = Depends(current_user)):
    s = _my_shortlist(db, list_id, me)
    db.query(ShortlistMember).filter(ShortlistMember.shortlist_id == s.id, ShortlistMember.person_id == person_id).delete()
    db.commit()
    return _shortlist_dict(db, s)

# ---------- pings and conversations ----------

def _ping(db: Session, me: str, to: str, context: str, gig: Gig = None) -> dict:
    _require_profile(db, me)
    other = _get_or_404(db, Profile, to, "Person")
    if to == me:
        raise HTTPException(status_code=400, detail="You can't ping yourself")
    c = _between(db, me, to)
    created = c is None
    if created:
        c = Conversation(sender_id=me, recipient_id=to, context=context, gig_id=gig.id if gig else None)
        db.add(c)
        db.flush()
        _add_message(db, c, me, f"Hi {_first(other.name)}, interested in a quick chat about {context}?")
    elif gig and c.gig_id != gig.id:
        # Responding to a gig from someone you already talk to joins the existing thread.
        c.gig_id, c.context = gig.id, gig.title
        _add_message(db, c, me, f"Responding to your gig: {gig.title}")
    elif c.status == "later" and c.sender_id == me:
        # They asked to be pinged later; this is that ping.
        c.status, c.context = "pinged", context
        _add_message(db, c, me, f"Hi {_first(other.name)}, checking in again about {context}. Free now?")
    db.commit()
    return {**_conv_dict(db, c, me), "created": created}

@router.post("/pings")
def ping(body: schemas.PingIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    return _ping(db, me, body.to, body.context.strip())

@router.get("/inbox")
def inbox(db: Session = Depends(get_db), me: str = Depends(current_user)):
    convs = db.query(Conversation).filter(or_(Conversation.sender_id == me, Conversation.recipient_id == me)) \
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc()).all()
    return [_conv_dict(db, c, me) for c in convs]

@router.get("/conversations/{conv_id}")
def get_conversation(conv_id: int, db: Session = Depends(get_db), me: str = Depends(current_user)):
    c = _participant(db, conv_id, me)
    db.query(Message).filter(Message.conversation_id == c.id, Message.sender_id != me, Message.read_at.is_(None)) \
        .update({Message.read_at: datetime.now(timezone.utc)}, synchronize_session=False)
    db.commit()
    return _conv_dict(db, c, me, messages=True)

@router.post("/conversations/{conv_id}/reply")
def reply(conv_id: int, body: schemas.ReplyIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    c = _participant(db, conv_id, me)
    if c.recipient_id != me:
        raise HTTPException(status_code=403, detail="Only the person who was pinged can reply")
    if c.status != "pinged":
        raise HTTPException(status_code=409, detail="Already replied")
    p = db.get(Profile, me)
    if body.interested:
        c.status, default = "interested", "Yes, interested. Send me the details."
    else:
        avail = _availability_text(p)
        c.status = "later"
        default = f"Booked at the moment. {avail}. Ping me after." if avail.startswith("Booked") else "Booked at the moment. Ping me later."
    _add_message(db, c, me, (body.message or "").strip() or default)
    db.commit()
    return _conv_dict(db, c, me, messages=True)

def _require_interested(c: Conversation):
    if c.status != "interested":
        raise HTTPException(status_code=409, detail="Messages open once they reply that they're interested")

@router.post("/conversations/{conv_id}/messages", status_code=201)
def send_message(conv_id: int, body: schemas.MessageIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    c = _participant(db, conv_id, me)
    _require_interested(c)
    _add_message(db, c, me, body.body.strip())
    db.commit()
    return _conv_dict(db, c, me, messages=True)

@router.post("/conversations/{conv_id}/details", status_code=201)
def share_details(conv_id: int, body: schemas.DetailsIn, db: Session = Depends(get_db), me: str = Depends(current_user)):
    c = _participant(db, conv_id, me)
    _require_interested(c)
    _add_message(db, c, me, f"Details\nJob: {body.job.strip() or 'Details to follow'}\nWhen: {body.when}", kind="details")
    db.commit()
    return _conv_dict(db, c, me, messages=True)
