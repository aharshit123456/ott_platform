from sqlalchemy import Column, Integer, String, Boolean, Text, Date, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.sql import func
from database import Base

# WHAM! freelance network. Profile ids are auth user ids (Supabase or local fallback).

class Profile(Base):
    __tablename__ = "wham_profiles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    headline = Column(String, nullable=True)          # e.g. "Video editor"
    disciplines = Column(JSON, default=list)          # subset of DISCIPLINES
    city = Column(String, nullable=True)
    open_to_work = Column(Boolean, default=True)
    booked_until = Column(Date, nullable=True)
    availability = Column(JSON, default=dict)         # {"YYYY-MM-DD" (week start): "open" | "partly" | "booked"}
    reply_time = Column(String, nullable=True)        # e.g. "2h"
    turnaround = Column(String, nullable=True)        # e.g. "Rough cut in 3 days"
    gear = Column(JSON, default=list)
    reel_url = Column(String, nullable=True)
    reel_length = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Work(Base):
    __tablename__ = "wham_works"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    kind = Column(String, nullable=True)              # Ad, Reel, Brand film, ...
    length = Column(String, nullable=True)            # "0:30" or "12 stills"
    year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    disciplines = Column(JSON, default=list)
    media_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    created_by = Column(String, ForeignKey("wham_profiles.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Credit(Base):
    __tablename__ = "wham_credits"
    __table_args__ = (UniqueConstraint("work_id", "person_id"),)

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer, ForeignKey("wham_works.id", ondelete="CASCADE"), index=True)
    person_id = Column(String, ForeignKey("wham_profiles.id"), index=True)
    role = Column(String, nullable=False)
    # Another collaborator on the same work who vouches for this credit.
    verified_by = Column(String, ForeignKey("wham_profiles.id"), nullable=True)

class Gig(Base):
    __tablename__ = "wham_gigs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    brief = Column(Text, nullable=True)
    discipline = Column(String, nullable=False)
    when = Column(String, nullable=False)             # "This week" | "This month" | "Flexible" | free text
    posted_by = Column(String, ForeignKey("wham_profiles.id"), index=True)
    is_open = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Shortlist(Base):
    __tablename__ = "wham_shortlists"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("wham_profiles.id"), index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ShortlistMember(Base):
    __tablename__ = "wham_shortlist_members"
    __table_args__ = (UniqueConstraint("shortlist_id", "person_id"),)

    id = Column(Integer, primary_key=True, index=True)
    shortlist_id = Column(Integer, ForeignKey("wham_shortlists.id", ondelete="CASCADE"), index=True)
    person_id = Column(String, ForeignKey("wham_profiles.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Conversation(Base):
    """A ping and the thread that follows it. One per pair of people."""
    __tablename__ = "wham_conversations"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("wham_profiles.id"), index=True)
    recipient_id = Column(String, ForeignKey("wham_profiles.id"), index=True)
    context = Column(String, nullable=False)          # what the ping is about, e.g. a shortlist or gig title
    gig_id = Column(Integer, ForeignKey("wham_gigs.id"), nullable=True, index=True)
    status = Column(String, default="pinged")         # pinged | interested | later
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Message(Base):
    __tablename__ = "wham_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("wham_conversations.id", ondelete="CASCADE"), index=True)
    sender_id = Column(String, ForeignKey("wham_profiles.id"))
    kind = Column(String, default="text")             # text | details
    body = Column(Text, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

TABLES = [m.__table__ for m in (Profile, Work, Credit, Gig, Shortlist, ShortlistMember, Conversation, Message)]
