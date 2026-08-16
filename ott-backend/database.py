from sqlalchemy import create_engine, URL, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

def _build_supabase_url():
    return URL.create(
        drivername="postgresql+psycopg2",
        username=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 5432)),
        database=os.getenv("DB_NAME"),
    )

IS_FALLBACK = False
engine = None

try:
    supabase_url = _build_supabase_url()
    _engine = create_engine(supabase_url, connect_args={"connect_timeout": 3})
    with _engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = _engine
    print("database.py: connected to Supabase Postgres")
except Exception as e:
    print(f"database.py: Supabase Postgres unreachable ({e}); falling back to local SQLite")
    IS_FALLBACK = True
    engine = create_engine(
        "sqlite:///./fallback.db",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if IS_FALLBACK:
    import models  # noqa: E402  (registers models on Base before create_all)
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
