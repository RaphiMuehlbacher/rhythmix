from fastapi import FastAPI, File, UploadFile, Form
from pathlib import Path
import shutil

app = FastAPI()

# Directories
SONGS_DIR = Path("songs")
UPLOAD_DIR = Path("uploads")

# Ensure folders exist
SONGS_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/upload")
async def upload_mp3(
    song_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Create folder for this song_id inside songs/
    song_folder = SONGS_DIR / song_id
    song_folder.mkdir(parents=True, exist_ok=True)

    # Save the uploaded MP3 file in the song_id folder
    file_path = song_folder / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "song_id": song_id,
        "message": f"File '{file.filename}' saved in '{song_folder}'"
    }
