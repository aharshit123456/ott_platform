from sqlalchemy.orm import Session
import models, schemas

def get_movie(db: Session, movie_id: int):
    return db.query(models.Movie).filter(models.Movie.id == movie_id).first()

def get_movies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Movie).offset(skip).limit(limit).all()

def create_movie(db: Session, movie: schemas.MovieCreate, fastpix_media_id: str = None, fastpix_playback_id: str = None):
    db_movie = models.Movie(
        title=movie.title,
        description=movie.description,
        thumbnail_url=movie.thumbnail_url,
        is_published=movie.is_published,
        fastpix_media_id=fastpix_media_id,
        fastpix_playback_id=fastpix_playback_id
    )
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

def update_movie_fastpix_ids(db: Session, movie_id: int, media_id: str, playback_id: str):
    db_movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if db_movie:
        db_movie.fastpix_media_id = media_id
        db_movie.fastpix_playback_id = playback_id
        db.commit()
        db.refresh(db_movie)
    return db_movie
