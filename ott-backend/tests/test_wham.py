def test_seeded_discover(client):
    works = client.get("/wham/works").json()
    assert works[0]["title"] == "Chai Masala: 30s TVC"
    assert [c["role"] for c in works[0]["credits"]] == ["Director", "DOP", "Editor", "Sound design"]
    assert works[0]["credits"][0]["verified_by"]["name"] == "Dev Malhotra"

    sound = client.get("/wham/people", params={"discipline": "Sound"}).json()
    assert [p["name"] for p in sound] == ["Sana Qureshi"]
    assert len(client.get("/wham/gigs", params={"discipline": "Sound"}).json()) == 1


def test_person_detail(client):
    p = client.get("/wham/people/seed-nikhil").json()
    assert p["availability_text"].startswith("Booked until") and p["open"] is False
    assert len(p["weeks"]) == 6 and p["weeks"][0]["status"] == "booked"
    assert {w["my_role"] for w in p["works"]} == {"Director"}
    assert p["collaborators"][0]["shared"] >= 1
    assert p["verified_credits"] == 2
    assert client.get("/wham/people/nobody").status_code == 404


def test_writes_need_auth_and_profile(client, user):
    _, h = user
    assert client.post("/wham/pings", json={"to": "seed-ria"}).status_code == 401
    assert client.post("/wham/pings", json={"to": "seed-ria"}, headers={"Authorization": "Bearer junk"}).status_code == 401
    assert client.get("/wham/me", headers=h).status_code == 404
    assert client.post("/wham/pings", json={"to": "seed-ria"}, headers=h).status_code == 403


def test_profile_validation(client, user):
    _, h = user
    r = client.put("/wham/me", headers=h, json={"name": "X", "disciplines": ["Juggling"]})
    assert r.status_code == 422


def test_ping_reply_details_flow(client, member):
    a, ha = member
    b, hb = _new_member(client, "Bea Roy")

    r = client.post("/wham/pings", headers=ha, json={"to": b, "context": "Perfume ad"}).json()
    assert r["created"] and r["status"] == "pinged" and r["last_message"]["body"].startswith("Hi Bea")
    cid = r["id"]
    # Pinging again returns the same thread
    assert client.post("/wham/pings", headers=ha, json={"to": b}).json()["id"] == cid

    inbox_b = client.get("/wham/inbox", headers=hb).json()
    assert inbox_b[0]["unread"] == 1 and inbox_b[0]["role"] == "recipient"
    # No messaging until they say yes, and only the recipient can reply
    assert client.post(f"/wham/conversations/{cid}/messages", headers=ha, json={"body": "hello"}).status_code == 409
    assert client.post(f"/wham/conversations/{cid}/reply", headers=ha, json={"interested": True}).status_code == 403

    r = client.post(f"/wham/conversations/{cid}/reply", headers=hb, json={"interested": True}).json()
    assert r["status"] == "interested"
    assert client.get("/wham/inbox", headers=ha).json()[0]["unread"] == 1

    r = client.post(f"/wham/conversations/{cid}/details", headers=ha, json={"job": "45s spot", "when": "Next month"})
    assert r.status_code == 201
    msgs = client.get(f"/wham/conversations/{cid}", headers=ha).json()["messages"]
    assert msgs[-1]["kind"] == "details" and "Job: 45s spot" in msgs[-1]["body"]
    assert client.get("/wham/inbox", headers=ha).json()[0]["unread"] == 0

    # Outsiders can't read it
    _, hc = _new_member(client, "Cy Das")
    assert client.get(f"/wham/conversations/{cid}", headers=hc).status_code == 404


def test_later_then_reping(client, member):
    a, ha = member
    b, hb = _new_member(client, "Dina Paul")
    client.put("/wham/me", headers=hb, json={"name": "Dina Paul", "booked_until": "2099-01-31"})
    cid = client.post("/wham/pings", headers=ha, json={"to": b}).json()["id"]
    r = client.post(f"/wham/conversations/{cid}/reply", headers=hb, json={"interested": False}).json()
    assert r["status"] == "later" and "Booked until 31 Jan" in r["messages"][-1]["body"]
    r = client.post("/wham/pings", headers=ha, json={"to": b, "context": "a reel"}).json()
    assert r["status"] == "pinged" and not r["created"]


def test_gigs(client, member):
    a, ha = member
    g = client.post("/wham/gigs", headers=ha, json={"title": "Colorist for a short", "discipline": "Editing", "when": "This month"})
    assert g.status_code == 201 and g.json()["mine"] and "editing" in g.json()["brief"]
    assert client.post(f"/wham/gigs/{g.json()['id']}/respond", headers=ha).status_code == 400
    assert client.post("/wham/gigs", headers=ha, json={"title": "x", "discipline": "Nope"}).status_code == 422

    sound_gig = client.get("/wham/gigs", params={"discipline": "Sound"}).json()[0]
    r = client.post(f"/wham/gigs/{sound_gig['id']}/respond", headers=ha).json()
    assert r["gig_id"] == sound_gig["id"] and r["other"]["id"] == "seed-nikhil"
    listed = [x for x in client.get("/wham/gigs", headers=ha).json() if x["id"] == sound_gig["id"]][0]
    assert listed["responded"] and listed["responses"] == 1

    _, hb = _new_member(client, "Eve Lal")
    assert client.delete(f"/wham/gigs/{g.json()['id']}", headers=hb).status_code == 403
    assert client.delete(f"/wham/gigs/{g.json()['id']}", headers=ha).status_code == 200
    assert all(x["id"] != g.json()["id"] for x in client.get("/wham/gigs").json())


def test_shortlists(client, member):
    _, h = member
    s = client.post("/wham/shortlists", headers=h, json={"name": "Podcast promo", "person_id": "seed-sana"}).json()
    assert [p["id"] for p in s["people"]] == ["seed-sana"]
    s = client.put(f"/wham/shortlists/{s['id']}/people/seed-ria", headers=h).json()
    s = client.put(f"/wham/shortlists/{s['id']}/people/seed-ria", headers=h).json()
    assert len(s["people"]) == 2
    s = client.delete(f"/wham/shortlists/{s['id']}/people/seed-sana", headers=h).json()
    assert [p["id"] for p in s["people"]] == ["seed-ria"]

    _, other = _new_member(client, "Fay Ali")
    assert client.get("/wham/shortlists", headers=other).json() == []
    assert client.put(f"/wham/shortlists/{s['id']}/people/seed-dev", headers=other).status_code == 404
    assert client.delete(f"/wham/shortlists/{s['id']}", headers=h).json()["deleted"]


def test_works_and_credits(client, member):
    a, ha = member
    w = client.post("/wham/works", headers=ha, json={
        "title": "Rain Reel", "kind": "Reel", "length": "0:20", "year": 2026, "disciplines": ["Editing"],
        "my_role": "Editor", "credits": [{"person_id": "seed-leo", "role": "Creator"}]})
    assert w.status_code == 201, w.text
    w = w.json()
    mine = next(c for c in w["credits"] if c["person"]["id"] == a)
    leo = next(c for c in w["credits"] if c["person"]["id"] == "seed-leo")
    assert mine["verified_by"] is None and leo["verified_by"]["id"] == a
    # You can't verify yourself; outsiders can't touch credits
    assert client.post(f"/wham/works/{w['id']}/credits/{a}/verify", headers=ha).status_code == 400
    _, hb = _new_member(client, "Gia Sen")
    assert client.post(f"/wham/works/{w['id']}/credits", headers=hb, json={"person_id": "seed-ria", "role": "x"}).status_code == 403
    assert client.delete(f"/wham/works/{w['id']}/credits/seed-leo", headers=hb).status_code == 403
    assert client.delete(f"/wham/works/{w['id']}/credits/seed-leo", headers=ha).status_code == 200

    bad = client.post("/wham/works", headers=ha, json={"title": "x", "my_role": "y", "credits": [{"person_id": "ghost", "role": "z"}]})
    assert bad.status_code == 400

    me = client.get("/wham/me", headers=ha).json()
    assert me["works"][0]["title"] == "Rain Reel" and me["works"][0]["my_role"] == "Editor"


def _new_member(client, name):
    import uuid
    email = f"{uuid.uuid4().hex[:8]}@example.com"
    client.post("/auth/signup", json={"email": email, "password": "pw-123456"})
    r = client.post("/auth/login", json={"email": email, "password": "pw-123456"}).json()
    h = {"Authorization": f"Bearer {r['access_token']}"}
    client.put("/wham/me", headers=h, json={"name": name})
    return r["user"]["id"], h
