from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pathlib import Path
import shutil
import subprocess

app = FastAPI()

# Directories
# SONGS_DIR = Path("/var/www/html/rhythmix/")  # HLS output folder final
SONGS_DIR = Path("/home/raspi1/rhythmix/audio_files")  # HLS output folder
UPLOAD_DIR = Path("/home/raspi1/rhythmix/audio_files_tmp")  # temporary upload folder
COVER_DIR = Path("/home/raspi1/rhythmix/song_cover")  # HLS output folder
#
# SONGS_DIR = Path("/audio_files")  # HLS output folder
# UPLOAD_DIR = Path("/audio_files_tmp")  # temporary upload folder


# Allowed audio file types
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a"}
ALLOWED_COVER_EXTENSIONS = {".png", ".jpg", ".webp"}


# Ensure folders exist
SONGS_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
COVER_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/upload")
async def upload_audio(
    song_id: str = Form(...),
    file: UploadFile = File(...),
    cover: UploadFile = File(...)
):
    # Check file extension
    ext_audio = Path(file.filename).suffix.lower()
    ext_cover = Path(cover.filename).suffix.lower()
    if ext_audio not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {ALLOWED_AUDIO_EXTENSIONS} are allowed"
        )
    if ext_cover not in ALLOWED_COVER_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {ALLOWED_COVER_EXTENSIONS} are allowed"
        )

    cover_path = COVER_DIR / f"{song_id}{ext_cover}"
    with open(cover_path, "wb") as buffer:
        shutil.copyfileobj(cover.file, buffer)

    # Save uploaded file temporarily
    tmp_file_path = UPLOAD_DIR / f"{song_id}_{file.filename}"
    with open(tmp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # HLS output path
    hls_output = SONGS_DIR / "output.m3u8"

    # Build FFmpeg command with sudo
    ffmpeg_cmd = [
         "ffmpeg",
        "-i", str(tmp_file_path),
        "-vn",
        "-ar", "44100",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-f", "hls",
        "-hls_time", "4",
        "-hls_segment_type", "fmp4",
        "-hls_playlist_type", "vod",
        "-avoid_negative_ts", "make_zero",
        str(hls_output)
    ]

    # Run FFmpeg
    try:
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print("FFmpeg stdout:", result.stdout)
            print("FFmpeg stderr:", result.stderr)
            raise HTTPException(status_code=500, detail="FFmpeg processing failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FFmpeg execution error: {e}")

    # Delete temporary upload file
    tmp_file_path.unlink()

    return {
        "status": "success",
        "song_id": song_id,
        "filename": file.filename,
        "message": f"File processed and HLS stored in '{SONGS_DIR}'"
    }
