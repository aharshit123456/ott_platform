# from sqlalchemy.orm import Session
# import models, schemas
from supabase_client import supabase, url, key
from supabase import create_client, ClientOptions
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

def get_authenticated_client(token: str):
    return create_client(url, key, options=ClientOptions(headers={"Authorization": f"Bearer {token}"}))

def add_to_watchlist(db, watchlist_entry: schemas.WatchlistCreate, token: str = None):
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

def remove_from_watchlist(db, user_id: str, movie_id: int, token: str = None):
    sb_client = get_authenticated_client(token) if token else supabase
    response = sb_client.table("watchlist").delete().eq("user_id", user_id).eq("movie_id", movie_id).execute()
    return response.data

def get_watchlist(db, user_id: str, token: str = None):
    # Assuming foreign key relation exists in Supabase
    sb_client = get_authenticated_client(token) if token else supabase
    response = sb_client.table("watchlist").select("*, movies(*)").eq("user_id", user_id).execute()
    return response.data

def create_review(db, review: schemas.ReviewCreate, token: str = None):
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

def get_reviews(db, movie_id: int):
    response = supabase.table("reviews").select("*").eq("movie_id", movie_id).execute()
    return response.data

def get_movie_by_playback_id(db, playback_id: str):
    response = supabase.table("movies").select("*").eq("fastpix_playback_id", playback_id).execute()
    if response.data:
        return response.data[0]
    return None

def get_movie_by_media_id(db, media_id: str):
    response = supabase.table("movies").select("*").eq("fastpix_media_id", media_id).execute()
    if response.data:
        return response.data[0]
    return None
