# Holiday Harmony 🎄✨
A lightweight “family survival” web app for the holidays: mood check-ins, memory vault, movie night voting (TMDB), daily recap export, and a fun Bingo mini-game.

Built as a simple static site (HTML/CSS/JS) + Supabase for storage.

## Features
- **Mood Check-ins**: quick daily mood + notes
- **Memory Vault**: add small moments and memories
- **Movie Night (TMDB)**:
  - Netflix-style grid
  - movie overview/summary
  - TMDB link + Trailer button
  - voting
- **Daily Recap Export**:
  - one-click PNG download (great for sharing)
- **Date & Range View**:
  - date picker + Today / Yesterday / Last 7 / Last 30
  - ranges combine data
- **Bingo Game**:
  - tap-to-complete tasks
  - detects completed lines
  - “BINGO!” popup + reward

## Tech Stack
- Vanilla **HTML/CSS/JS**
- **Supabase** (database + simple API)
- **TMDB API** (movie discovery + trailers)
- `html-to-image` for PNG export

## Live Demo
You can run the app instantly here (no setup required):
👉 https://zhelair.github.io/holiday-harmony/

Open `room.html` if it doesn’t load automatically.

## Setup (Local)
1. Clone or download this repository.
2. Open `room.html` directly in a browser  
   **or** run a local server:

### Option A — VS Code (recommended)
- Install the **Live Server** extension
- Right-click `room.html` → **Open with Live Server**

### Option B — Python
```bash
python -m http.server 8000

## Setup (Supabase)
This project expects Supabase tables for:
- `memories`
- `checkins`
- `reactions`
- `movie_votes` (or your existing voting table)
- `signals` (pause)

> Your Supabase URL and anon/public key are used in `app.js`.

## Setup (TMDB)
Movie Night uses TMDB.
You’ll need a TMDB API key / read token configured in `app.js`.


## Notes
- `/favicon.ico` 404 is harmless. (Optional: add a favicon.)
- If updates don’t show on Pages, bump cache:
  - in `room.html`: `app.js?v=1011` → `app.js?v=1012`
