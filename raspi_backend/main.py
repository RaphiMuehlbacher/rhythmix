from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pathlib import Path
import shutil
import subprocess
import shutil as pyshutil

app = FastAPI()

# Directories
SONGS_DIR = Path("/home/raspi1/rhythmix/audio_files")       # HLS output base
UPLOAD_DIR = Path("/home/raspi1/rhythmix/audio_files_tmp")  # temporary upload folder
COVER_DIR = Path("/home/raspi1/rhythmix/covers")            # cover images

# Allowed file types
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a"}
ALLOWED_COVER_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

# Ensure base folders exist
for d in (SONGS_DIR, UPLOAD_DIR, COVER_DIR):
    d.mkdir(parents=True, exist_ok=True)
print(f"created at {COVER_DIR}")

@app.post("/upload")
async def upload_audio(
    song_id: str = Form(...),
    file: UploadFile = File(...),
    cover: UploadFile = File(...)
):
    # Validate extensions
    ext_audio = Path(file.filename).suffix.lower()
    ext_cover = Path(cover.filename).suffix.lower()
    if ext_audio not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {sorted(ALLOWED_AUDIO_EXTENSIONS)} are allowed"
        )
    if ext_cover not in ALLOWED_COVER_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Only files with extensions {sorted(ALLOWED_COVER_EXTENSIONS)} are allowed"
        )

    # Save cover
    cover_path = COVER_DIR / f"{song_id}{ext_cover}"
    with open(cover_path, "wb") as buffer:
        shutil.copyfileobj(cover.file, buffer)
    print(f"saved cover at: {cover_path}")

    # Save uploaded audio temporarily
    tmp_file_path = UPLOAD_DIR / f"{song_id}_{file.filename}"
    with open(tmp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Prepare per-song output dir and paths
    ID_SONG_DIR = SONGS_DIR / f"{song_id}"
    ID_SONG_DIR.mkdir(parents=True, exist_ok=True)  # IMPORTANT: create the directory
    hls_output = ID_SONG_DIR / "output.m3u8"
    segment_pattern = ID_SONG_DIR / "segment_%03d.m4s"

    # Optionally verify ffmpeg is available
    if pyshutil.which("ffmpeg") is None:
        # Clean up tmp file before error
        try:
            tmp_file_path.unlink(missing_ok=True)
        finally:
            pass
        raise HTTPException(status_code=500, detail="ffmpeg not found in PATH")

    # FFmpeg command
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",                              # overwrite if exists
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
            # Log both streams to help debugging
            print("FFmpeg stdout:", result.stdout)
            print("FFmpeg stderr:", result.stderr)
            raise HTTPException(status_code=500, detail=f"FFmpeg processing failed: {result.stderr.strip()[:1000]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FFmpeg execution error: {e}")
    finally:
        # Always remove the temp file
        try:
            tmp_file_path.unlink(missing_ok=True)
        except Exception:
            pass

    return {
        "status": "success",
        "song_id": song_id,
        "filename": file.filename,
        "covername": cover.filename,
        "message": f"File processed and HLS stored in '{ID_SONG_DIR}'"
    }
