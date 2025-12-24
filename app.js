import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ✅ Paste your Supabase URL + anon key here:
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_PUBLIC_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Read room + optional name from URL
const params = new URLSearchParams(location.search);
const room = params.get("room")?.trim();
const suggestedName = params.get("name")?.trim();

const roomLabel = document.getElementById("roomLabel");
const shareLink = document.getElementById("shareLink");

const nameEl = document.getElementById("name");
const momentEl = document.getElementById("moment");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

const moodStatusEl = document.getElementById("moodStatus");
const moodBoardEl = document.getElementById("moodBoard");

const kpiMemoriesEl = document.getElementById("kpiMemories");
const kpiCheckinsEl = document.getElementById("kpiCheckins");
const kpiMoodEl = document.getElementById("kpiMood");

if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}

roomLabel.textContent = room;
if (suggestedName && nameEl) nameEl.value = suggestedName;

// Build share link that works on GitHub Pages too
const base = location.href.split("room.html")[0];
const fullLink = `${base}room.html?room=${encodeURIComponent(room)}`;
shareLink.textContent = `Share: ${fullLink}`;

// ---- Helpers
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, s => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[s]));
}

function todayISODate() {
  // YYYY-MM-DD in the user's local timezone
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ---- Activity generator (no backend needed)
const activities = [
  "2 Truths and a Lie (one round each)",
  "Pick a movie: everyone suggests 1, then vote",
  "10-minute walk together (no heavy topics allowed 😄)",
  "Tea + dessert: each person says one good thing from today",
  "Photo challenge: recreate an old family photo pose",
  "Mini quiz: 'Who said this?' (family quotes edition)",
  "Puzzle/board game for 20 minutes",
  "Kitchen teamwork: one person chops, one stirs, one tastes (dangerously)",
  "Quick cleanup sprint: 5 minutes — music on, judgement off",
  "Story time: each person shares one funny memory from childhood"
];

document.getElementById("activityBtn")?.addEventListener("click", () => {
  const pick = activities[Math.floor(Math.random() * activities.length)];
  document.getElementById("activityOut").innerHTML =
    `<div style="margin-top:10px"><b>${escapeHtml(pick)}</b></div>`;
});

// ---- Mood Check-in
const moodButtons = {
  good: document.getElementById("moodGood"),
  ok: document.getElementById("moodOk"),
  bad: document.getElementById("moodBad"),
};

function clearMoodSelection() {
  Object.values(moodButtons).forEach(btn => btn?.classList.remove("moodSelected"));
}

async function setMood(mood) {
  const name = nameEl.value.trim();
  if (!name) {
    moodStatusEl.textContent = "Please enter your name first.";
    return;
  }

  moodStatusEl.textContent = "Saving…";

  const checkin_date = todayISODate();

  // Upsert so each person has 1 mood per day
  const { error } = await supabase
    .from("checkins")
    .upsert(
      [{ room_code: room, name, checkin_date, mood }],
      { onConflict: "room_code,name,checkin_date" }
    );

  if (error) {
    moodStatusEl.textContent = "Mood save error: " + error.message;
    return;
  }

  clearMoodSelection();
  if (mood === "good") moodButtons.good?.classList.add("moodSelected");
  if (mood === "ok") moodButtons.ok?.classList.add("moodSelected");
  if (mood === "bad") moodButtons.bad?.classList.add("moodSelected");

  moodStatusEl.textContent = "Checked in ✅";
  await loadAll();
}

moodButtons.good?.addEventListener("click", () => setMood("good"));
moodButtons.ok?.addEventListener("click", () => setMood("ok"));
moodButtons.bad?.addEventListener("click", () => setMood("bad"));

async function loadMyMoodSelection(checkinsToday) {
  const name = nameEl.value.trim();
  if (!name) return;

  const mine = checkinsToday.find(c => c.name === name);
  if (!mine) return;

  clearMoodSelection();
  if (mine.mood === "good") moodButtons.good?.classList.add("moodSelected");
  if (mine.mood === "ok") moodButtons.ok?.classList.add("moodSelected");
  if (mine.mood === "bad") moodButtons.bad?.classList.add("moodSelected");
}

// ---- Memories: post + load
async function postMemory() {
  if (statusEl) statusEl.textContent = "";

  const name = nameEl.value.trim();
  const moment = momentEl.value.trim();

  if (!name || !moment) {
    if (statusEl) statusEl.textContent = "Please fill your name + the moment.";
    return;
  }

  const { error } = await supabase
    .from("memories")
    .insert([{ room_code: room, name, moment }]);

  if (error) {
    if (statusEl) statusEl.textContent = "Post error: " + error.message;
    return;
  }

  momentEl.value = "";
  if (statusEl) statusEl.textContent = "Posted ✅";
  await loadAll();
}

document.getElementById("postBtn")?.addEventListener("click", postMemory);

// ---- Dashboard logic (memories + moods today)
function summarizeMood(checkinsToday) {
  const counts = { good: 0, ok: 0, bad: 0 };
  for (const c of checkinsToday) {
    if (counts[c.mood] !== undefined) counts[c.mood]++;
  }

  // Determine vibe by majority
  let vibe = "—";
  if (checkinsToday.length === 0) vibe = "No check-ins yet";
  else if (counts.bad >= Math.max(counts.good, counts.ok)) vibe = "😤 Spicy";
  else if (counts.good >= Math.max(counts.ok, counts.bad)) vibe = "😇 Calm";
  else vibe = "😐 Okay";

  return { counts, vibe };
}

function updateDashboard(memoriesTodayCount, checkinsToday) {
  const { counts, vibe } = summarizeMood(checkinsToday);

  // KPI line
  kpiMemoriesEl.textContent = String(memoriesTodayCount);
  kpiCheckinsEl.textContent = String(checkinsToday.length);
  kpiMoodEl.textContent = vibe;

  // Main dashboard message (simple + friendly)
  const el = document.getElementById("happinessLevel");
  if (!el) return;

  // Combine into a “level”
  let label = "😐 Neutral vibes";
  let note = "Small wins still count. Post one good moment.";

  if (memoriesTodayCount >= 1 || checkinsToday.length >= 1) {
    label = "🙂 Warming up";
    note = "Nice. Keep feeding the good timeline.";
  }
  if (memoriesTodayCount >= 3 && counts.bad === 0) {
    label = "🙂 Good vibes";
    note = "Solid. Family is cooperating (for now).";
  }
  if (memoriesTodayCount >= 6 && counts.bad <= 1) {
    label = "😄 Family on fire";
    note = "This is suspiciously wholesome. Screenshot it.";
  }
  if (counts.bad >= 2 && checkinsToday.length >= 3) {
    label = "🧯 Tension detected";
    note = "Time for a walk / tea / activity button. No politics. No inheritance talk.";
  }

  el.innerHTML = `
    <b>${label}</b><br>
    ${memoriesTodayCount} happy moment${memoriesTodayCount === 1 ? "" : "s"} today •
    ${checkinsToday.length} mood check-in${checkinsToday.length === 1 ? "" : "s"}<br>
    <small>${escapeHtml(note)}</small>
  `;
}

function updateMoodBoard(checkinsToday) {
  if (!moodBoardEl) return;

  if (checkinsToday.length === 0) {
    moodBoardEl.innerHTML = `<small>No one checked in yet. Be the first brave soul.</small>`;
    return;
  }

  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";

  moodBoardEl.innerHTML = checkinsToday
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(c => `
      <div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
        <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)} <small>(${escapeHtml(c.mood)})</small>
      </div>
    `).join("");
}

// ---- Load everything (memories + today checkins)
async function loadAll() {
  const today = todayISODate();

  const [memRes, chkRes] = await Promise.all([
    supabase
      .from("memories")
      .select("*")
      .eq("room_code", room)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("checkins")
      .select("*")
      .eq("room_code", room)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (memRes.error) {
    if (statusEl) statusEl.textContent = "Load memories error: " + memRes.error.message;
  }

  if (chkRes.error) {
    moodStatusEl.textContent = "Load check-ins error: " + chkRes.error.message;
  }

  const memories = memRes.data || [];
  const checkinsToday = chkRes.data || [];

  // Count today's memories (local timezone)
  const todayStr = new Date().toDateString();
  const memoriesTodayCount = memories.filter(m =>
    new Date(m.created_at).toDateString() === todayStr
  ).length;

  // Update UI parts
  updateDashboard(memoriesTodayCount, checkinsToday);
  updateMoodBoard(checkinsToday);
  loadMyMoodSelection(checkinsToday);

  // Render memories list
  listEl.innerHTML = memories.map(m => `
    <div class="card">
      <b>${escapeHtml(m.name)}</b>
      <small> — ${new Date(m.created_at).toLocaleString()}</small>
      <div>${escapeHtml(m.moment)}</div>
    </div>
  `).join("");
}

// Refresh so you see what others do
setInterval(loadAll, 4000);
loadAll();
