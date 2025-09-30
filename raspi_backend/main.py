from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pathlib import Path
import shutil
import subprocess
import shutil as pyshutil
from mutagen import File as MutagenFile
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "https://rhythmix.redstphillip.uk",  # frontend domain
    # "http://localhost:5173",            # local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
SONGS_DIR = Path("/var/www/html/rhythmix/audio_files")   # HLS output base
UPLOAD_DIR = Path("/home/raspi1/rhythmix/audio_files_tmp")  # temporary upload folder
COVER_DIR = Path("/var/www/html/rhythmix/covers")       # cover images
PROFILE_IMG_DIR = Path("/var/www/html/rhythmix/profile-images")
PLAYLIST_IMG_DIR = Path("/var/www/html/rhythmix/playlist-images")

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a"}
ALLOWED_IMG_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

for d in (SONGS_DIR, UPLOAD_DIR, COVER_DIR, PROFILE_IMG_DIR, PLAYLIST_IMG_DIR):
    d.mkdir(parents=True, exist_ok=True)


def get_audio_duration(path: Path) -> int:
    """Return duration in ms using Mutagen."""
    try:
        audio = MutagenFile(path)
        if audio is None or not audio.info:
            return 0
        return int(audio.info.length * 1000)
    except Exception:
        return 0


@app.post("/upload-song")
async def upload_audio(
    song_id: str = Form(...),
    file: UploadFile = File(...),
    cover: UploadFile = File(...),
):
    ext_audio = Path(file.filename).suffix.lower()
    ext_cover = Path(cover.filename).suffix.lower()
    if ext_audio not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {sorted(ALLOWED_AUDIO_EXTENSIONS)} are allowed"
        )
    if ext_cover not in ALLOWED_IMG_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {sorted(ALLOWED_IMG_EXTENSIONS)} are allowed"
        )

    # Save cover
    cover_path = COVER_DIR / f"{song_id}{ext_cover}"
    with open(cover_path, "wb") as buffer:
        shutil.copyfileobj(cover.file, buffer)

    # Save uploaded audio temporarily
    tmp_file_path = UPLOAD_DIR / f"{song_id}_{file.filename}"
    with open(tmp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract duration in ms BEFORE transcoding
    duration_ms = get_audio_duration(tmp_file_path)

    # Prepare per-song output dir and paths
    ID_SONG_DIR = SONGS_DIR / song_id
    ID_SONG_DIR.mkdir(parents=True, exist_ok=True)
    hls_output = ID_SONG_DIR / "output.m3u8"
    segment_pattern = ID_SONG_DIR / "segment_%03d.m4s"

    # Verify ffmpeg is available
    if pyshutil.which("ffmpeg") is None:
        tmp_file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="ffmpeg not found in PATH")

    # FFmpeg command
    ffmpeg_cmd = [
        "ffmpeg", "-y",
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
        "-hls_flags", "independent_segments",
        "-hls_segment_filename", str(segment_pattern),
        "-avoid_negative_ts", "make_zero",
        str(hls_output),
    ]

    try:
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print("FFmpeg stdout:", result.stdout)
            print("FFmpeg stderr:", result.stderr)
            raise HTTPException(status_code=500, detail=f"FFmpeg processing failed: {result.stderr.strip()[:1000]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FFmpeg execution error: {e}")
    finally:
        tmp_file_path.unlink(missing_ok=True)

    return {
        "status": "success",
        "trackId": song_id,
        "duration": duration_ms,
        "filePath": str(hls_output),
        "coverPath": str(cover_path),
    }


@app.post("/upload-profile-picture")
async def upload_profile_picture(
    artist_id: str = Form(...),
    file: UploadFile = File(...),
):
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMG_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {sorted(ALLOWED_IMG_EXTENSIONS)} are allowed"
        )

    filename = f"{artist_id}{ext}"
    profile_path = PROFILE_IMG_DIR / filename
    with open(profile_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {
        "status": "success",
        "artistId": artist_id,
        "filename": str(filename),
    }


@app.post("/upload-playlist-cover")
async def upload_playlist_cover(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMG_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {sorted(ALLOWED_IMG_EXTENSIONS)} are allowed"
        )

    filename = f"{uuid.uuid4()}{ext}"
    img_path = PLAYLIST_IMG_DIR / filename

    with open(img_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "filename": str(filename),
        "filePath": str(img_path),
    }
