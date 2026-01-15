from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud, database
import os
from dotenv import load_dotenv
import requests
# Using the official SDK now
from fastpix import Client

load_dotenv()

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost", "capacitor://localhost", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FastPix Client Setup
FASTPIX_ACCESS_TOKEN = os.getenv("FASTPIX_ACCESS_TOKEN_ID")
FASTPIX_SECRET_KEY = os.getenv("FASTPIX_SECRET_KEY")

# Initialize client only if creds are present to avoid startup errors during dev
client = None
if FASTPIX_ACCESS_TOKEN and FASTPIX_SECRET_KEY:
    try:
        client = Client(FASTPIX_ACCESS_TOKEN, FASTPIX_SECRET_KEY)
    except Exception as e:
        print(f"Failed to init FastPix client: {e}")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/movies/", response_model=schemas.Movie)
def create_movie(movie: schemas.MovieCreate, db: Session = Depends(get_db)):
    return crud.create_movie(db=db, movie=movie)

@app.get("/movies/", response_model=list[schemas.Movie])
def read_movies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    movies = crud.get_movies(db, skip=skip, limit=limit)
    return movies

@app.post("/upload-local-video/")
def upload_local_video(file_path: str, title: str, db: Session = Depends(get_db)):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    if not client:
         raise HTTPException(status_code=500, detail="FastPix client not initialized")

    try:
        # 1. Get Presigned URL using official SDK
        # Note: SDK methods and response structure might vary slightly, adapting based on typical SDK usage.
        # Assuming client.media.get_presigned_url accepts a dict.
        media_request = {
            "corsOrigin": "*",
            "pushMediaSettings": {
                "accessPolicy": "public",
                "maxResolution": "1080p"
            }
        }
        response = client.media.get_presigned_url(media_request)
        
        # The SDK likely returns a dict or an object. If dict:
        # response = { "data": { "signedUrl": "...", "id": "..." }, "success": True }
        
        # If the SDK returns an object, we might need to access attributes. 
        # For now assuming dict based on previous REST assumption, but let's be robust.
        if hasattr(response, 'data'):
             data = response.data
        else:
             data = response.get('data', {})

        signed_url = data.get('signedUrl')
        media_id = data.get('id')

        if not signed_url or not media_id:
             raise Exception(f"Failed to get signed URL or Media ID. Response: {response}")

        # 2. Upload File
        with open(file_path, 'rb') as f:
            # Note: Presigned URLs usually require specific headers or just the body
            # Standard PUT to signed URL
            upload_resp = requests.put(signed_url, data=f, headers={"Content-Type": "video/mp4"}) 
            upload_resp.raise_for_status()

        # 3. Create Playback ID
        playback_response = client.media_playback_ids.create(media_id, {"accessPolicy": "public"})
        
        if hasattr(playback_response, 'data'):
             playback_data = playback_response.data
        else:
             playback_data = playback_response.get('data', {})
             
        playback_id = playback_data.get('id')

        # 4. Save to DB
        movie_data = schemas.MovieCreate(title=title, is_published=True)
        db_movie = crud.create_movie(db, movie_data, fastpix_media_id=media_id, fastpix_playback_id=playback_id)
        
        return db_movie

    except Exception as e:
        # Log the full error for debugging
        print(f"Error in upload_local_video: {e}")
        raise HTTPException(status_code=500, detail=str(e))
