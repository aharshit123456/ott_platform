from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# import models, schemas, crud, database
import schemas, crud
import os
from dotenv import load_dotenv
import requests
# Using the official SDK now
# Using the official SDK now (with monkey patch for package name bug)
try:
    from fastpix_python import Fastpix as Client
    from fastpix_python import models 
    
    # MONKEY PATCH: Fix bug in SDK where it expects 'Fastpix' package but we have 'fastpix_python'
    # Iterate over the map and replace "Fastpix." with "fastpix_python."
    new_map = {}
    for key, val in Client._sub_sdk_map.items():
        module_path, class_name = val
        if module_path.startswith("Fastpix."):
            new_module_path = module_path.replace("Fastpix.", "fastpix_python.")
            new_map[key] = (new_module_path, class_name)
        else:
            new_map[key] = val
    Client._sub_sdk_map = new_map
    
except ImportError:
    print("Could not import fastpix_python")
    Client = None
    models = None

load_dotenv()

# We are using Supabase API mostly now, skipping local DB metadata creation which fails
# try:
#     models.Base.metadata.create_all(bind=database.engine)
# except Exception as e:
#     print(f"Warning: Could not connect to DB to create tables: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://wham.cosq.in", "http://wham.cosq.in/", "https://wham.cosq.in", "http://localhost:5173", "http://localhost", "https://localhost", "capacitor://localhost", "http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi.requests import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # This ensures that even 500 errors get CORS headers
    return JSONResponse(
        status_code=500,
        content={"message": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# FastPix Client Setup
FASTPIX_ACCESS_TOKEN = os.getenv("FASTPIX_ACCESS_TOKEN_ID")
FASTPIX_SECRET_KEY = os.getenv("FASTPIX_SECRET_KEY")

# Auth Router
import auth
app.include_router(auth.router)

# Initialize client only if creds are present to avoid startup errors during dev
client = None
if FASTPIX_ACCESS_TOKEN and FASTPIX_SECRET_KEY and Client:
    try:
        client = Client(FASTPIX_ACCESS_TOKEN, FASTPIX_SECRET_KEY)
    except Exception as e:
        print(f"Failed to init FastPix client: {e}")

# Fake dependency to keep signature somewhat consistent or just remove it
def get_db():
    return None

@app.post("/movies/", response_model=schemas.Movie)
def create_movie(movie: schemas.MovieCreate, db = Depends(get_db)):
    return crud.create_movie(db, movie=movie)

@app.get("/movies/", response_model=list[schemas.Movie])
def read_movies(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    movies = crud.get_movies(db, skip=skip, limit=limit)
    return movies

@app.get("/movies/{movie_id}", response_model=schemas.Movie)
def read_movie(movie_id: int, db = Depends(get_db)):
    movie = crud.get_movie(db, movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@app.post("/upload-local-video/")
def upload_local_video(file_path: str, title: str, description: str = None, thumbnail_url: str = None, db = Depends(get_db)):
    print(f"DEBUG: upload_local_video called with path={file_path}, title={title}")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    if not client:
         print("DEBUG: Client is None")
         raise HTTPException(status_code=500, detail="FastPix client not initialized")

    try:
        # 1. Direct Upload using updated SDK method
        # 1. Direct Upload using direct API call (bypassing buggy SDK)
        print("DEBUG: Calling FastPix API directly...")
        
        api_url = "https://api.fastpix.io/v1/on-demand/upload"
        auth = (FASTPIX_ACCESS_TOKEN, FASTPIX_SECRET_KEY)
        payload = {
            "corsOrigin": "*",
            "pushMediaSettings": {
                "accessPolicy": "public"
            }
        }
        
        response = requests.post(api_url, json=payload, auth=auth)
        # response.raise_for_status() # Let's print response before raising
        
        print(f"DEBUG: API Response Status: {response.status_code}")
        print(f"DEBUG: API Response Body: {response.text}")
        
        if response.status_code not in [200, 201]:
             raise Exception(f"FastPix API failed: {response.text}")

        data = response.json().get('data', {})
        media_id = data.get('id') or data.get('uploadId')
        signed_url = data.get('url') or data.get('signedUrl')

        print(f"DEBUG: media_id={media_id}, signed_url={signed_url}")

        if not signed_url or not media_id:
             raise Exception(f"Failed to get signed URL or Media ID. Response: {response.text}")

        # 2. Upload File to Signed URL
        print("DEBUG: Uploading file to signed URL...")
        with open(file_path, 'rb') as f:
            upload_resp = requests.put(signed_url, data=f, headers={"Content-Type": "video/mp4"}) 
            upload_resp.raise_for_status()
        print("DEBUG: Upload successful")

        # 2.5 Poll for Playback IDs (Wait for processing)
        print("DEBUG: Polling for Playback IDs...")
        playback_ids_url = f"https://api.fastpix.io/v1/on-demand/{media_id}/playback-ids"
        import time
        
        playback_id = None
        
        for attempt in range(5):
            print(f"DEBUG: Waiting 30 seconds (Attempt {attempt + 1}/5)...")
            time.sleep(30)
            
            try:
                print(f"DEBUG: Checking Playback IDs at {playback_ids_url}")
                pb_resp = requests.get(playback_ids_url, auth=auth)
                print(f"DEBUG: Response Code: {pb_resp.status_code}")
                
                if pb_resp.status_code == 200:
                    pb_data = pb_resp.json()
                    print(f"DEBUG: Response Body: {pb_data}")
                    
                    data_list = pb_data.get('data', [])
                    if isinstance(data_list, list) and len(data_list) > 0:
                        # Take the first playback ID
                        playback_id = data_list[0].get('id')
                        print(f"DEBUG: Found Playback ID: {playback_id}")
                        break
                    else:
                        print("DEBUG: No playback IDs found yet.")
                else:
                    print(f"DEBUG: Failed to get playback IDs: {pb_resp.text}")
                        
            except Exception as e:
                print(f"DEBUG: Error checking playback IDs: {e}")

        if not playback_id:
             print("WARNING: Could not retrieve a Playback ID after polling. Saving without it.")

        # 4. Save to DB (Supabase via API)
        print("DEBUG: Saving to DB...")
        movie_data = schemas.MovieCreate(
            title=title, 
            description=description,
            thumbnail_url=thumbnail_url,
            is_published=True
        )
        db_movie = crud.create_movie(db, movie_data, fastpix_media_id=media_id, fastpix_playback_id=playback_id)
        print(f"DEBUG: Movie saved: {db_movie}")
        
        return db_movie

    except Exception as e:
        print("\n\n!!!!!!!!!!!!!!!! EXCEPTION CAUGHT !!!!!!!!!!!!!!!!")
        print(f"Error in upload_local_video: {e}")
        import traceback
        traceback.print_exc()
        print("!!!!!!!!!!!!!!!! END EXCEPTION !!!!!!!!!!!!!!!!\n\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/movies/{movie_id}/refresh-playback-id")
def refresh_playback_id(movie_id: int, db = Depends(get_db)):
    movie = crud.get_movie(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    media_id = movie.get("fastpix_media_id")
    if not media_id:
        raise HTTPException(status_code=400, detail="Movie has no FastPix Media ID")
        
    current_playback_id = movie.get("fastpix_playback_id")
    if current_playback_id:
        return {"message": "Playback ID already exists", "playback_id": current_playback_id}

    # Attempt to create
    api_url = f"https://api.fastpix.io/v1/on-demand/{media_id}/playback-ids"
    auth = (FASTPIX_ACCESS_TOKEN, FASTPIX_SECRET_KEY)
    payload = {"accessPolicy": "public"}
    
    try:
        response = requests.post(api_url, json=payload, auth=auth)
        if response.status_code not in [200, 201]:
             # Check if it failed because it requires processing
             raise HTTPException(status_code=400, detail=f"FastPix Error: {response.text}")
             
        data = response.json().get('data', {})
        new_playback_id = data.get('id')
        
        if new_playback_id:
            updated_movie = crud.update_movie(db, movie_id, {"fastpix_playback_id": new_playback_id})
            return updated_movie
        else:
            raise HTTPException(status_code=500, detail="API returned success but no ID found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/watchlist/", response_model=schemas.Watchlist)
def add_to_watchlist(item: schemas.WatchlistCreate, db = Depends(get_db)):
    return crud.add_to_watchlist(db, item)

@app.delete("/watchlist/{user_id}/{movie_id}")
def remove_from_watchlist(user_id: str, movie_id: int, db = Depends(get_db)):
    return crud.remove_from_watchlist(db, user_id, movie_id)

@app.get("/watchlist/{user_id}")
def get_watchlist(user_id: str, db = Depends(get_db)):
    return crud.get_watchlist(db, user_id)

@app.post("/reviews/", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db = Depends(get_db)):
    return crud.create_review(db, review)

@app.get("/reviews/{movie_id}", response_model=list[schemas.Review])
def get_reviews(movie_id: int, db = Depends(get_db)):
    return crud.get_reviews(db, movie_id)
