import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ✅ Paste your Supabase URL + anon key here:
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

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

// ---- Dashboard logic: based on today's memories count
function updateDashboard(memories) {
  const el = document.getElementById("happinessLevel");
  if (!el) return;

  const todayStr = new Date().toDateString();

  const todayCount = memories.filter(m =>
    new Date(m.created_at).toDateString() === todayStr
  ).length;

  let label = "😐 Neutral vibes";
  let note = "Small wins still count. Post one good moment.";

  if (todayCount >= 1) { label = "🙂 Warming up"; note = "Nice. Keep feeding the good timeline."; }
  if (todayCount >= 3) { label = "🙂 Good vibes"; note = "Solid. Family is cooperating (for now)."; }
  if (todayCount >= 6) { label = "😄 Family on fire"; note = "This is suspiciously wholesome. Screenshot it."; }

  el.innerHTML = `
    <b>${label}</b><br>
    ${todayCount} happy moment${todayCount === 1 ? "" : "s"} posted today<br>
    <small>${escapeHtml(note)}</small>
  `;
}

// ---- Memory Vault: load + post
async function loadMemories() {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("room_code", room)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (statusEl) statusEl.textContent = "Load error: " + error.message;
    return;
  }

  updateDashboard(data);

  listEl.innerHTML = data.map(m => `
    <div class="card">
      <b>${escapeHtml(m.name)}</b>
      <small> — ${new Date(m.created_at).toLocaleString()}</small>
      <div>${escapeHtml(m.moment)}</div>
    </div>
  `).join("");
}

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
  await loadMemories();
}

document.getElementById("postBtn")?.addEventListener("click", postMemory);

// Refresh so you see what others post
setInterval(loadMemories, 4000);
loadMemories();

// ---- Small safety helper
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, s => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[s]));
}
