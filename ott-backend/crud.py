# from sqlalchemy.orm import Session
# import models, schemas
from supabase_client import supabase
import schemas

# Note: We are now using Supabase API directly due to DB connection issues

def create_movie(db, movie: schemas.MovieCreate, fastpix_media_id: str = None, fastpix_playback_id: str = None):
    data = {
        "title": movie.title,
        "description": movie.description,
        "thumbnail_url": movie.thumbnail_url,
        "is_published": movie.is_published,
        "fastpix_media_id": fastpix_media_id,
        "fastpix_playback_id": fastpix_playback_id
    }
    response = supabase.table("movies").insert(data).execute()
    # supabase-py v2 returns a response object with .data
    if response.data:
        return response.data[0]
    return None

def get_movie(db, movie_id: int):
    response = supabase.table("movies").select("*").eq("id", movie_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_movies(db, skip: int = 0, limit: int = 100):
    response = supabase.table("movies").select("*").range(skip, skip + limit - 1).execute()
    return response.data


def update_movie(db, movie_id: int, updates: dict):
    response = supabase.table("movies").update(updates).eq("id", movie_id).execute()
    if response.data:
        return response.data[0]
    return None
