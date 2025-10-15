# Rhythmix

A full-stack music streaming platform with HLS audio delivery, artist uploads, playlists, and real-time search.

---

## Features

- **Authentication** - Email/password and Google OAuth via Convex Auth
- **Artist Dashboard** - Upload tracks with cover art and manage artist profile
- **Music Playback** - HLS streaming with real-time playback controls and volume management
- **Playlists** - Create, edit, and manage custom playlists
- **Search** - Real-time search functionality for tracks and artists

---

## Installation

### Prerequisites

- Node.js 18+
- Python 3.13+
- FFmpeg
- Raspberry Pi or Linux server
- Convex account

### Frontend Setup

```bash
# Install dependencies
npm install

# Set up Convex
npx convex dev

# Run development server
npm run dev
```

Create a `.env.local` file with your Convex deployment URL and authentication settings.

The application will be available at `http://localhost:5173`

### Backend Setup (Raspberry Pi)

```bash
# Navigate to backend directory
cd raspi_backend

# Install Python dependencies
pip install -r requirements.txt

# Install FFmpeg
sudo apt-get update
sudo apt-get install ffmpeg

# Create required directories
sudo mkdir -p /var/www/html/rhythmix/audio_files
sudo mkdir -p /var/www/html/rhythmix/covers
sudo mkdir -p /var/www/html/rhythmix/profile-images
sudo mkdir -p /var/www/html/rhythmix/playlist-images
mkdir -p /home/raspi1/rhythmix/audio_files_tmp

# Run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Technical Overview

### React

Built with **React 19** using:

- **React Router** - routing with protected routes
- **Zustand** - state management for the player
- **React Hook Form + Zod** - form validation
- **TailwindCSS v4** - styling
- **Vite** - build tooling
- **shadcn/ui** - UI components
- **HLS.js** - audio streaming

### Convex

Convex serves as the backend-as-a-service providing:

- Real-time database with live queries
- Secure authentication system
- Full-text search indexes
- File storage and URL management
- Server-side functions for data operations

**Database Schema:**
- `users` - User accounts with authentication
- `artists` - Artist profiles linked to users
- `tracks` - Song metadata (title, duration, URLs)
- `playlists` - User-created playlists
- `playlistsTracks` - Track ordering within playlists
- `playbackStates` - Current playback state per user

### Raspberry Pi Backend

FastAPI service handling media processing:

- **Audio Transcoding** - Converts uploaded audio to HLS format using FFmpeg
- **Multi-format Support** - Accepts MP3, WAV, FLAC, M4A
- **HLS Generation** - Creates adaptive streaming segments
- **Image Processing** - Handles cover art, profile pictures, and playlist images

**API Endpoints:**
- `POST /upload-song` - Accepts audio file + cover, transcodes to HLS, returns duration and URLs
- `POST /upload-profile-picture` - Handles artist profile image uploads
- `POST /upload-playlist-image` - Manages playlist cover images

---

## Future

Planned features and improvements:
- Show similar songs
- Music recommendations based on listening history
- Synchronized lyrics during playback
- Advanced search filters (genre, mood, release date)
- Artist analytics dashboard with play counts and listener