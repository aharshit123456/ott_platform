from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    fastpix_media_id = Column(String, nullable=True)
    fastpix_playback_id = Column(String, nullable=True)
    tmdb_id = Column(Integer, nullable=True)
    media_type = Column(String, default="movie")
    is_published = Column(Boolean, default=False)

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))
    rating = Column(Integer)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, nullable=True)
    hashed_password = Column(String)
