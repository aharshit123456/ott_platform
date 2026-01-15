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
