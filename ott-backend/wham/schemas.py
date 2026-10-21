from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

DISCIPLINES = ['Editing', 'Videography', 'Sound', 'Motion/VFX', 'Directing', 'Writing', 'Photography', 'Producing', 'Reels']
WeekStatus = Literal["open", "partly", "booked"]

def _check_disciplines(values):
    bad = [d for d in values if d not in DISCIPLINES]
    if bad:
        raise ValueError(f"Unknown disciplines: {', '.join(bad)}")
    return values

class ProfileIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    headline: Optional[str] = Field(None, max_length=80)
    disciplines: list[str] = []
    city: Optional[str] = Field(None, max_length=60)
    open_to_work: bool = True
    booked_until: Optional[date] = None
    availability: dict[date, WeekStatus] = {}
    reply_time: Optional[str] = Field(None, max_length=20)
    turnaround: Optional[str] = Field(None, max_length=60)
    gear: list[str] = Field([], max_length=30)
    reel_url: Optional[str] = Field(None, max_length=500)
    reel_length: Optional[str] = Field(None, max_length=20)

    @field_validator("disciplines")
    @classmethod
    def check_disciplines(cls, v):
        return _check_disciplines(v)

class CreditIn(BaseModel):
    person_id: str
    role: str = Field(min_length=1, max_length=60)

class WorkIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    kind: Optional[str] = Field(None, max_length=40)
    length: Optional[str] = Field(None, max_length=20)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    description: Optional[str] = Field(None, max_length=2000)
    disciplines: list[str] = []
    media_url: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    my_role: str = Field(min_length=1, max_length=60)
    credits: list[CreditIn] = []    # collaborators; credits you add are verified by you

    @field_validator("disciplines")
    @classmethod
    def check_disciplines(cls, v):
        return _check_disciplines(v)

class GigIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    brief: Optional[str] = Field(None, max_length=1000)
    discipline: str
    when: str = Field("Flexible", min_length=1, max_length=40)

    @field_validator("discipline")
    @classmethod
    def check_discipline(cls, v):
        _check_disciplines([v])
        return v

class ShortlistIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    person_id: Optional[str] = None

class PingIn(BaseModel):
    to: str
    context: str = Field("a project", min_length=1, max_length=120)

class ReplyIn(BaseModel):
    interested: bool
    message: Optional[str] = Field(None, max_length=2000)

class MessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)

class DetailsIn(BaseModel):
    job: str = Field("", max_length=300)
    when: str = Field("Flexible", max_length=40)
