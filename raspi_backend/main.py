from fastapi import FastAPI, File, UploadFile, Form
import shutil
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/upload")
async def upload_mp3(
    song_id: str = Form(...),
    file: UploadFile = File(...)
):
    file_path = UPLOAD_DIR / f"{song_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"Received song_id: {song_id}")
    print(f"Received file: {file.filename}")
    print(f"Would split '{file_path.name}' into chunks and store them in 'processed/' folder")
    print(f"Temporary paths would be something like: processed/{file_path.stem}_001.mp3, processed/{file_path.stem}_002.mp3, ...")

    return {
        "status": "success",
        "song_id": song_id,
        "message": f"File '{file.filename}' received and stored as '{file_path.name}' in 'uploads/' (splitting simulated)"
    }
