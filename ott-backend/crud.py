from sqlalchemy.orm import Session

from database import IS_FALLBACK
import models
import schemas
import local_auth

if not IS_FALLBACK:
    from supabase_client import supabase, url, key
    from supabase import create_client, ClientOptions

# Note: We are now using Supabase API directly due to DB connection issues,
# with an automatic local SQLite fallback when Supabase is unreachable.

def _movie_to_dict(movie: models.Movie) -> dict:
    return {
        "id": movie.id,
        "title": movie.title,
        "description": movie.description,
        "thumbnail_url": movie.thumbnail_url,
        "is_published": movie.is_published,
        "fastpix_media_id": movie.fastpix_media_id,
        "fastpix_playback_id": movie.fastpix_playback_id,
        "tmdb_id": movie.tmdb_id,
        "media_type": movie.media_type,
    }

def _review_to_dict(review: models.Review) -> dict:
    return {
        "id": review.id,
        "user_id": review.user_id,
        "movie_id": review.movie_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }

def create_movie(db: Session, movie: schemas.MovieCreate, fastpix_media_id: str = None, fastpix_playback_id: str = None):
    if IS_FALLBACK:
        db_movie = models.Movie(
            title=movie.title,
            description=movie.description,
            thumbnail_url=movie.thumbnail_url,
            is_published=movie.is_published,
            fastpix_media_id=fastpix_media_id,
            fastpix_playback_id=fastpix_playback_id,
            tmdb_id=movie.tmdb_id,
            media_type=movie.media_type,
        )
        db.add(db_movie)
        db.commit()
        db.refresh(db_movie)
        return _movie_to_dict(db_movie)

    data = {
        "title": movie.title,
        "description": movie.description,
        "thumbnail_url": movie.thumbnail_url,
        "is_published": movie.is_published,
        "fastpix_media_id": fastpix_media_id,
        "fastpix_playback_id": fastpix_playback_id,
        "tmdb_id": movie.tmdb_id,
        "media_type": movie.media_type
    }
    response = supabase.table("movies").insert(data).execute()
    # supabase-py v2 returns a response object with .data
    if response.data:
        return response.data[0]
    return None

def get_movie(db: Session, movie_id: int):
    if IS_FALLBACK:
        movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
        return _movie_to_dict(movie) if movie else None

    response = supabase.table("movies").select("*").eq("id", movie_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_movies(db: Session, skip: int = 0, limit: int = 100):
    if IS_FALLBACK:
        movies = db.query(models.Movie).offset(skip).limit(limit).all()
        return [_movie_to_dict(m) for m in movies]

    response = supabase.table("movies").select("*").range(skip, skip + limit - 1).execute()
    return response.data


def update_movie(db: Session, movie_id: int, updates: dict):
    if IS_FALLBACK:
        movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
        if not movie:
            return None
        for key_, value in updates.items():
            setattr(movie, key_, value)
        db.commit()
        db.refresh(movie)
        return _movie_to_dict(movie)

    response = supabase.table("movies").update(updates).eq("id", movie_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_authenticated_client(token: str):
    return create_client(url, key, options=ClientOptions(headers={"Authorization": f"Bearer {token}"}))

def _user_id_from_token(token: str) -> str:
    payload = local_auth.decode_access_token(token)
    return payload["sub"]

def add_to_watchlist(db: Session, watchlist_entry: schemas.WatchlistCreate, token: str = None):
    if IS_FALLBACK:
        try:
            existing = db.query(models.Watchlist).filter(
                models.Watchlist.user_id == watchlist_entry.user_id,
                models.Watchlist.movie_id == watchlist_entry.movie_id,
            ).first()
            if existing:
                return {"id": existing.id, "user_id": existing.user_id, "movie_id": existing.movie_id}

            entry = models.Watchlist(user_id=watchlist_entry.user_id, movie_id=watchlist_entry.movie_id)
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return {"id": entry.id, "user_id": entry.user_id, "movie_id": entry.movie_id}
        except Exception as e:
            print(f"Error in add_to_watchlist (fallback): {e}")
            raise e

    try:
        sb_client = get_authenticated_client(token) if token else supabase

        data = {
            "user_id": watchlist_entry.user_id,
            "movie_id": watchlist_entry.movie_id
        }
        # Check if exists
        existing = sb_client.table("watchlist").select("id").eq("user_id", data["user_id"]).eq("movie_id", data["movie_id"]).execute()
        if existing.data:
            return existing.data[0]

        response = sb_client.table("watchlist").insert(data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error in add_to_watchlist: {e}")
        raise e

def remove_from_watchlist(db: Session, user_id: str, movie_id: int, token: str = None):
    if IS_FALLBACK:
        entry = db.query(models.Watchlist).filter(
            models.Watchlist.user_id == user_id,
            models.Watchlist.movie_id == movie_id,
        ).first()
        if entry:
            db.delete(entry)
            db.commit()
            return [{"id": entry.id, "user_id": user_id, "movie_id": movie_id}]
        return []

    sb_client = get_authenticated_client(token) if token else supabase
    response = sb_client.table("watchlist").delete().eq("user_id", user_id).eq("movie_id", movie_id).execute()
    return response.data

def get_watchlist(db: Session, user_id: str, token: str = None):
    if IS_FALLBACK:
        entries = db.query(models.Watchlist).filter(models.Watchlist.user_id == user_id).all()
        result = []
        for entry in entries:
            movie = db.query(models.Movie).filter(models.Movie.id == entry.movie_id).first()
            result.append({
                "id": entry.id,
                "user_id": entry.user_id,
                "movie_id": entry.movie_id,
                "movies": _movie_to_dict(movie) if movie else None,
            })
        return result

    sb_client = get_authenticated_client(token) if token else supabase
    # Assuming foreign key relation exists in Supabase
    response = sb_client.table("watchlist").select("*, movies(*)").eq("user_id", user_id).execute()
    return response.data

def create_review(db: Session, review: schemas.ReviewCreate, token: str = None):
    if IS_FALLBACK:
        db_review = models.Review(
            user_id=review.user_id,
            movie_id=review.movie_id,
            rating=review.rating,
            comment=review.comment,
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return _review_to_dict(db_review)

    sb_client = get_authenticated_client(token) if token else supabase
    data = {
        "user_id": review.user_id,
        "movie_id": review.movie_id,
        "rating": review.rating,
        "comment": review.comment
    }
    response = sb_client.table("reviews").insert(data).execute()
    if response.data:
        return response.data[0]
    return None

def get_reviews(db: Session, movie_id: int):
    if IS_FALLBACK:
        reviews = db.query(models.Review).filter(models.Review.movie_id == movie_id).all()
        return [_review_to_dict(r) for r in reviews]

    response = supabase.table("reviews").select("*").eq("movie_id", movie_id).execute()
    return response.data

def get_movie_by_playback_id(db: Session, playback_id: str):
    if IS_FALLBACK:
        movie = db.query(models.Movie).filter(models.Movie.fastpix_playback_id == playback_id).first()
        return _movie_to_dict(movie) if movie else None

    response = supabase.table("movies").select("*").eq("fastpix_playback_id", playback_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_movie_by_media_id(db: Session, media_id: str):
    if IS_FALLBACK:
        movie = db.query(models.Movie).filter(models.Movie.fastpix_media_id == media_id).first()
        return _movie_to_dict(movie) if movie else None

    response = supabase.table("movies").select("*").eq("fastpix_media_id", media_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_user_reviews(db: Session, user_id: str, token: str = None):
    if IS_FALLBACK:
        reviews = db.query(models.Review).filter(models.Review.user_id == user_id).all()
        result = []
        for r in reviews:
            movie = db.query(models.Movie).filter(models.Movie.id == r.movie_id).first()
            d = _review_to_dict(r)
            d["movies"] = _movie_to_dict(movie) if movie else None
            result.append(d)
        return result

    sb_client = get_authenticated_client(token) if token else supabase
    response = sb_client.table("reviews").select("*, movies(*)").eq("user_id", user_id).execute()
    return response.data
