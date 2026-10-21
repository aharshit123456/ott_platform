import os
import sys

import pytest

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@pytest.fixture(scope="session")
def app_env(tmp_path_factory):
    # Run on the SQLite fallback in a throwaway directory (fallback.db is relative to cwd).
    os.chdir(tmp_path_factory.mktemp("db"))
    for k in ("DB_USER", "DB_PASSWORD", "DB_HOST", "DB_NAME"):
        os.environ.pop(k, None)
    os.environ["DB_HOST"] = "127.0.0.1"
    os.environ["DB_PORT"] = "1"
    sys.path.insert(0, BACKEND)
    import database
    assert database.IS_FALLBACK
    from fastapi.testclient import TestClient
    import main
    from wham.seed import seed
    db = database.SessionLocal()
    seed(db)
    db.close()
    return TestClient(main.app)

@pytest.fixture(scope="session")
def client(app_env):
    return app_env

_n = [0]

@pytest.fixture
def user(client):
    """Sign up and log in a fresh user; returns (user_id, auth headers)."""
    _n[0] += 1
    email = f"user{_n[0]}@example.com"
    client.post("/auth/signup", json={"email": email, "password": "pw-123456", "username": f"u{_n[0]}"})
    r = client.post("/auth/login", json={"email": email, "password": "pw-123456"})
    assert r.status_code == 200, r.text
    return r.json()["user"]["id"], {"Authorization": f"Bearer {r.json()['access_token']}"}

@pytest.fixture
def member(client, user):
    """A user who has created a WHAM! profile."""
    uid, h = user
    r = client.put("/wham/me", headers=h, json={"name": f"Test Person{uid[:4]}", "headline": "Colorist", "disciplines": ["Editing"], "city": "Pune"})
    assert r.status_code == 200, r.text
    return uid, h
