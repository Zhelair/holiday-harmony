# Holiday Harmony 🎄✨

**A cooperative family survival game (disguised as a web app).**

Holiday Harmony is a lightweight web app for surviving the holidays **together**.
Think less *Last of Us*, more *Last Piece of Pie*.

You don’t fight zombies — you fight bad moods, indecisive movie nights, and the eternal question:

> *“So… what do we watch?”*

Built as a simple static site (HTML/CSS/JS) with Supabase for storage and just enough structure to keep everyone sane.

---

## What Is This, Really?

A **co-op experience** where everyone wins if:

* moods are checked,
* memories are saved,
* movies are voted on democratically,
* and someone finally gets a BINGO.

No scores. No losers. Just harmony.
(Or at least fewer arguments.)

---

## Features 🧩

### 🧠 Mood Check-ins

Quick daily mood + optional notes.
Great for:

* emotional weather forecasts
* spotting danger zones early
* passive-aggressive emojis (optional)

---

### 📸 Memory Vault

Save small moments before they vanish forever:

* funny quotes
* tiny wins
* “remember when Uncle Alex said *that*?”

Low effort. High nostalgia ROI.

---

### 🎬 Movie Night (TMDB-powered)

Because choosing a movie is the **hardest boss fight**.

Includes:

* Netflix-style movie grid
* short movie overview (so you know what you’re voting for)
* TMDB link + Trailer button
* voting system (democracy… but festive)

---

### 📤 Daily Recap Export

One click → PNG summary.

Perfect for:

* family chats
* group memories
* proof that *something* productive happened today

---

### 📅 Date & Range View

Time travel, but useful:

* Today / Yesterday
* Last 7 / Last 30 days
* ranges **combine data**, because memory is unreliable during holidays

---

### 🎯 Bingo Mini-Game

The secret weapon.

* tap-to-complete tasks
* auto-detects completed lines
* dramatic **“BINGO!”** popup
* optional reward (cake recommended)

Suddenly everyone wants to help. Strange how that works.

---

## Tech Stack 🛠️

Simple, boring, reliable — like a good family recipe.

* Vanilla **HTML / CSS / JS**
* **Supabase** (database + simple API)
* **TMDB API** (movies + trailers)
* `html-to-image` for PNG exports

No frameworks. No build step. No nonsense.

---

## Live Demo 🚀

Run it instantly — no setup, no excuses:

👉 [https://zhelair.github.io/holiday-harmony/](https://zhelair.github.io/holiday-harmony/)

If it doesn’t load automatically, open `room.html`.

---

## Setup (Local) 🧑‍💻

1. Clone or download this repository
2. Open `room.html` directly in your browser
   **or** run a local server:

### Option A — VS Code (recommended)

* Install **Live Server**
* Right-click `room.html` → **Open with Live Server**

### Option B — Python

```bash
python -m http.server 8000
```

---

## Setup (Supabase) 🗄️

The app expects these tables:

* `memories`
* `checkins`
* `reactions`
* `movie_votes` (or your existing voting table)
* `signals` (pause / sync)

> Supabase URL + anon/public key are used in `app.js`.

⚠️ Heads up:
Anyone can see the **public anon key** in a static app.
That’s normal. Just use Row Level Security like a responsible adult.

---

## Setup (TMDB) 🎥

Movie Night needs TMDB access.

* Create a TMDB API key / read token
* Add it to `app.js`

That’s it. No rituals required.

---

## Notes 📝

* `/favicon.ico` 404 is harmless. The app is not crying for help.
* If GitHub Pages shows old code, bump cache:

  * `room.html`: `app.js?v=1011` → `app.js?v=1012`

---

If you want, next we can:

* add *“family roles”* (The Organizer, The Grump, The Optimist 😈)
* turn Bingo into a **season-long campaign**
* or package this as a template others can reuse (👀 monetization alert)

You built something genuinely charming here.
Holiday survival, but make it cooperative 💛
