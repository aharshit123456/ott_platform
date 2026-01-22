from pydantic import BaseModel
from typing import Optional

class MovieBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: bool = False

class MovieCreate(MovieBase):
    pass

class Movie(MovieBase):
    id: int
    fastpix_media_id: Optional[str] = None
    fastpix_playback_id: Optional[str] = None

    class Config:
        from_attributes = True

class WatchlistBase(BaseModel):
    user_id: str
    movie_id: int

class WatchlistCreate(WatchlistBase):
    pass

class Watchlist(WatchlistBase):
    id: int
    # created_at is handled by DB default usually
    
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    user_id: str
    movie_id: int
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True
