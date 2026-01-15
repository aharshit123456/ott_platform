from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    fastpix_media_id = Column(String, nullable=True)
    fastpix_playback_id = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
