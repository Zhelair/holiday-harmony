// ==========================
// Holiday Harmony — app.js
// ==========================

console.log("APP VERSION v2 LOADED");

const debugEl = document.getElementById("debug");
function debug(msg) {
  if (debugEl) debugEl.textContent = msg;
  console.log("[HH]", msg);
}

if (!window.supabase || !window.supabase.createClient) {
  debug("❌ Supabase library not loaded (CDN blocked?). Try another browser / disable adblock / use Wi-Fi.");
  throw new Error("Supabase UMD not available");
}

// ✅ PASTE REAL VALUES (KEEP QUOTES!)

const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

if (!SUPABASE_URL || !SUPABASE_ANON_PUBLIC_KEY) {
  debug("❌ Missing Supabase keys in app.js");
  throw new Error("Missing Supabase keys");
}

const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);
debug("✅ JS running. Connecting…");

// ---- URL params
const params = new URLSearchParams(location.search);
const room = (params.get("room") || "").trim();
const suggestedName = (params.get("name") || "").trim();
const suggestedRole = (params.get("role") || "").trim();

if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}

// ---- DOM
const roomLabel = document.getElementById("roomLabel");
const shareLink = document.getElementById("shareLink");
const nameEl = document.getElementById("name");
const roleLineEl = document.getElementById("roleLine");
const momentEl = document.getElementById("moment");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

const moodStatusEl = document.getElementById("moodStatus");
const moodBoardEl = document.getElementById("moodBoard");

const kpiMemoriesEl = document.getElementById("kpiMemories");
const kpiCheckinsEl = document.getElementById("kpiCheckins");
const kpiMoodEl = document.getElementById("kpiMood");

const defuseBtn = document.getElementById("defuseBtn");
const choreBtn = document.getElementById("choreBtn");
const defuseOut = document.getElementById("defuseOut");

const awardsOut = document.getElementById("awardsOut");
const tipsOut = document.getElementById("tipsOut");
const newTipBtn = document.getElementById("newTipBtn");

const privateToggle = document.getElementById("privateToggle");
const privateList = document.getElementById("privateList");

roomLabel.textContent = room;

// Share link
const base = location.href.substring(0, location.href.lastIndexOf("/") + 1);
const fullLink = `${base}room.html?room=${encodeURIComponent(room)}`;
shareLink.textContent = `Share: ${fullLink}`;

// ---- Helpers
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, s => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[s]));
}

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function playSound(which) {
  const map = { tap: "assets/sounds/tap.mp3", success: "assets/sounds/success.mp3" };
  const src = map[which];
  if (!src) return;
  try { new Audio(src).play(); } catch {}
}

// ---- Remember identity
function loadIdentity() {
  const savedName = localStorage.getItem("hh_name") || "";
  const savedRole = localStorage.getItem("hh_role") || "";
  const name = suggestedName || savedName;
  const role = suggestedRole || savedRole;

  if (name) nameEl.value = name;
  roleLineEl.textContent = role ? `Role: ${role}` : "";

  if (name) localStorage.setItem("hh_name", name);
  if (role) localStorage.setItem("hh_role", role);
}
loadIdentity();

nameEl.addEventListener("input", () => {
  const name = nameEl.value.trim();
  if (name) localStorage.setItem("hh_name", name);
});

// ---- Activity generator
const activities = [
  "2 Truths and a Lie (one round each)",
  "Pick a movie: everyone suggests 1 title, then vote",
  "10-minute walk together (no big topics — just fresh air 😄)",
  "Tea + dessert: each person says one good thing from today",
  "Photo challenge: recreate an old family photo pose",
  "Mini quiz: 'Who said this?' (family quotes edition)",
  "Puzzle/board game for 20 minutes",
  "Kitchen teamwork: one person chops, one stirs, one tastes (official quality control)",
  "Quick tidy sprint: 5 minutes with music",
  "Story time: each person shares one warm memory"
];

document.getElementById("activityBtn").addEventListener("click", () => {
  playSound("tap");
  const pick = activities[Math.floor(Math.random() * activities.length)];
  document.getElementById("activityOut").innerHTML =
    `<div style="margin-top:10px"><b>${escapeHtml(pick)}</b></div>`;
});

// ---- Reset Moment (friendly)
const defuseLines = [
  "Reset moment: 3 slow breaths. Then we continue with softer voices. 🙂",
  "Quick pause: water + a small smile. Team ‘family’ is back online.",
  "Switch scene: tea, a short walk, or a cozy activity. Keep it light for 10 minutes.",
  "Try the ‘hug rule’: if it’s not worth a hug later, it’s not worth a fight now.",
  "Compliment round: each person says one nice thing. Short and real.",
  "Mini mission: do one helpful thing (tiny!) and come back with better energy.",
  "If someone is tired: it’s not personal. It’s just… tiredness. We’ve all been there.",
  "Humor mode: say your complaint like a Disney villain. Everyone laughs, problem shrinks.",
  "Peace offering: bring a snack. Snacks solve many mysteries.",
  "New plan: kind first, correct later. Works weirdly well."
];

defuseBtn.addEventListener("click", () => {
  playSound("tap");
  const pick = defuseLines[Math.floor(Math.random() * defuseLines.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>🧯 Reset Moment:</b> ${escapeHtml(pick)}<br>
      <small>Try: tea • walk • music • activity button</small>
    </div>`;
});

// ---- Chore roulette
const chores = [
  "You wash dishes 🫧",
  "You dry dishes 🍽️",
  "You set the table 🧂",
  "You choose music 🎵",
  "You make tea ☕",
  "You do a 5-minute tidy sprint 🧹",
  "You rest — you earned it 😌",
  "You pick the movie 🎬",
];

choreBtn.addEventListener("click", () => {
  playSound("tap");
  const pick = chores[Math.floor(Math.random() * chores.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>🎡 Chore Roulette:</b> ${escapeHtml(pick)}<br>
      <small>Rule: we do it with good humor. Bonus points for music.</small>
    </div>`;
});

// ---- Mood check-in
const moodButtons = {
  good: document.getElementById("moodGood"),
  ok: document.getElementById("moodOk"),
  bad: document.getElementById("moodBad"),
};

function clearMoodSelection() {
  Object.values(moodButtons).forEach(btn => btn.classList.remove("moodSelected"));
}

async function setMood(mood) {
  const name = nameEl.value.trim();
  if (!name) { moodStatusEl.textContent = "Please enter your name first."; return; }

  moodStatusEl.textContent = "Saving…";
  playSound("tap");
  const checkin_date = todayISODate();

  const { error } = await supa
    .from("checkins")
    .upsert([{ room_code: room, name, checkin_date, mood }],
      { onConflict: "room_code,name,checkin_date" });

  if (error) { moodStatusEl.textContent = "Mood save error: " + error.message; return; }

  clearMoodSelection();
  if (mood === "good") moodButtons.good.classList.add("moodSelected");
  if (mood === "ok") moodButtons.ok.classList.add("moodSelected");
  if (mood === "bad") moodButtons.bad.classList.add("moodSelected");

  moodStatusEl.textContent = "Checked in ✅";
  playSound("success");
  await loadAll();
}

moodButtons.good.addEventListener("click", () => setMood("good"));
moodButtons.ok.addEventListener("click", () => setMood("ok"));
moodButtons.bad.addEventListener("click", () => setMood("bad"));

function loadMyMoodSelection(checkinsToday) {
  const name = nameEl.value.trim();
  if (!name) return;
  const mine = checkinsToday.find(c => c.name === name);
  if (!mine) return;

  clearMoodSelection();
  if (mine.mood === "good") moodButtons.good.classList.add("moodSelected");
  if (mine.mood === "ok") moodButtons.ok.classList.add("moodSelected");
  if (mine.mood === "bad") moodButtons.bad.classList.add("moodSelected");
}

// ---- Private memories (local only)
function privateKey() { return `hh_private_${room}_${todayISODate()}`; }
function getPrivateMemories() {
  try { return JSON.parse(localStorage.getItem(privateKey()) || "[]"); }
  catch { return []; }
}
function addPrivateMemory(name, text) {
  const list = getPrivateMemories();
  list.unshift({ name, text, ts: new Date().toISOString() });
  localStorage.setItem(privateKey(), JSON.stringify(list.slice(0, 20)));
}
function renderPrivateMemories() {
  const list = getPrivateMemories();
  if (list.length === 0) { privateList.innerHTML = `<small>No private notes yet.</small>`; return; }
  privateList.innerHTML = `
    <div style="margin-top:10px;">
      <b>🔒 Private notes (this device only)</b>
      ${list.map(i => `
        <div style="margin-top:8px; border:1px solid #e7e7ef; border-radius:14px; padding:10px 12px; background:#fff;">
          <b>${escapeHtml(i.name)}</b> <small>— ${new Date(i.ts).toLocaleTimeString()}</small>
          <div>${escapeHtml(i.text)}</div>
        </div>
      `).join("")}
    </div>`;
}

// ---- Post memory
async function postMemory() {
  statusEl.textContent = "";
  const name = nameEl.value.trim();
  const moment = momentEl.value.trim();
  if (!name || !moment) { statusEl.textContent = "Please fill your name + the moment."; return; }

  playSound("tap");

  if (privateToggle.checked) {
    addPrivateMemory(name, moment);
    momentEl.value = "";
    statusEl.textContent = "Saved privately 🔒";
    playSound("success");
    renderPrivateMemories();
    return;
  }

  const { error } = await supa.from("memories").insert([{ room_code: room, name, moment }]);
  if (error) { statusEl.textContent = "Post error: " + error.message; return; }

  momentEl.value = "";
  statusEl.textContent = "Posted ✅";
  playSound("success");
  await loadAll();
}
document.getElementById("postBtn").addEventListener("click", postMemory);

// ---- Dashboard helpers
function summarizeMood(checkinsToday) {
  const counts = { good: 0, ok: 0, bad: 0 };
  for (const c of checkinsToday) if (counts[c.mood] !== undefined) counts[c.mood]++;
  let vibe = "No check-ins yet";
  if (checkinsToday.length > 0) {
    if (counts.bad >= Math.max(counts.good, counts.ok)) vibe = "😤 Overloaded";
    else if (counts.good >= Math.max(counts.ok, counts.bad)) vibe = "😇 Calm";
    else vibe = "😐 Okay";
  }
  return { counts, vibe };
}

function updateDashboard(memoriesTodayCount, checkinsToday) {
  const { counts, vibe } = summarizeMood(checkinsToday);
  kpiMemoriesEl.textContent = String(memoriesTodayCount);
  kpiCheckinsEl.textContent = String(checkinsToday.length);
  kpiMoodEl.textContent = vibe;

  const el = document.getElementById("happinessLevel");
  let label = "🙂 Cozy start";
  let note = "Post one happy moment (even a tiny one) — it helps everyone notice the good.";
  if (memoriesTodayCount >= 2 || checkinsToday.length >= 2) { label = "🙂 Good vibes"; note = "Nice. The warm timeline is growing."; }
  if (memoriesTodayCount >= 4 && counts.bad === 0) { label = "😄 Great day together"; note = "Love this. Keep it simple: food, laughs, rest."; }
  if (counts.bad >= 2 && checkinsToday.length >= 3) { label = "🧯 Gentle reset"; note = "A short break can save the evening: tea, walk, music, or activity."; }
  el.innerHTML = `<b>${label}</b><br>${memoriesTodayCount} happy moments today • ${checkinsToday.length} mood check-ins<br><small>${escapeHtml(note)}</small>`;
}

function updateMoodBoard(checkinsToday) {
  if (checkinsToday.length === 0) { moodBoardEl.innerHTML = `<small>No one checked in yet. Want to start? 🙂</small>`; return; }
  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";
  const moodLabel = (m) => m === "good" ? "calm" : m === "ok" ? "ok" : "overloaded";
  moodBoardEl.innerHTML = checkinsToday
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(c => `<div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
      <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)} <small>(${escapeHtml(moodLabel(c.mood))})</small></div>`).join("");
}

function updateAwards(memories, checkinsToday) {
  const byName = {};
  for (const m of memories) byName[m.name] = (byName[m.name] || 0) + 1;
  const top = Object.entries(byName).sort((a,b)=>b[1]-a[1])[0];
  const mostMemories = top ? { name: top[0], val: top[1] } : null;

  const moodNames = { good: [], ok: [], bad: [] };
  for (const c of checkinsToday) moodNames[c.mood].push(c.name);

  const awards = [];
  if (mostMemories) awards.push(`✨ <b>Memory Maker</b>: ${escapeHtml(mostMemories.name)} (${mostMemories.val} posts)`);
  if (moodNames.good[0]) awards.push(`🕊 <b>Calm Star</b>: ${escapeHtml(moodNames.good[0])}`);
  if (moodNames.ok[0]) awards.push(`🙂 <b>Steady Support</b>: ${escapeHtml(moodNames.ok[0])}`);
  if (moodNames.bad[0]) awards.push(`🫶 <b>Needs a Hug</b>: ${escapeHtml(moodNames.bad[0])} (self-reported, totally normal)`);

  awardsOut.innerHTML = `<div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
    ${awards.length ? awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("") : "<small>No awards yet.</small>"}
  </div>`;
}

// ---- Quick Tips (always works)
let lastTipsPool = [];
let lastMemoriesTodayCount = 0;
let lastCheckinsToday = [];

function pickRandom(arr, count = 3) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < count) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}

function buildTipsPool(memoriesTodayCount, checkinsToday) {
  const { counts } = summarizeMood(checkinsToday);
  const tips = [];
  if (checkinsToday.length === 0) tips.push("✅ Ask everyone to check in. One tap = better vibe.");
  if (memoriesTodayCount === 0) tips.push("✨ Post one tiny happy moment. ‘Good tea’ counts.");
  if (counts.bad >= 2) tips.push("🧯 If someone is overloaded: tea/walk mode can save the evening.");
  tips.push("🫶 Compliment round: one sincere sentence each.");
  tips.push("🎬 Movie decision: everyone suggests 1 title, then vote.");
  tips.push("🧹 5-minute tidy sprint with music = fast reset.");
  tips.push("🍵 Tea break rule: no problem-solving during tea.");
  tips.push("🎲 Use Activity Generator when conversation gets stuck.");
  tips.push("😂 ‘Remember when…’ story time is the best glue.");
  return tips;
}

function renderTips(tips) {
  tipsOut.innerHTML = tips.map(t => `<div style="margin:10px 0;">${escapeHtml(t)}</div>`).join("");
}

function updateTips(memoriesTodayCount, checkinsToday) {
  lastMemoriesTodayCount = memoriesTodayCount;
  lastCheckinsToday = checkinsToday;
  lastTipsPool = buildTipsPool(memoriesTodayCount, checkinsToday);
  renderTips(pickRandom(lastTipsPool, 3));
}

newTipBtn.addEventListener("click", () => {
  playSound("tap");
  if (!lastTipsPool.length) lastTipsPool = buildTipsPool(lastMemoriesTodayCount, lastCheckinsToday);
  renderTips(pickRandom(lastTipsPool, 3));
});

// ---- Stop blinking list
let lastMemoriesRenderKey = "";

// ---- Load all
async function loadAll() {
  try {
    const today = todayISODate();

    const [memRes, chkRes] = await Promise.all([
      supa.from("memories").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(80),
      supa.from("checkins").select("*").eq("room_code", room).eq("checkin_date", today).order("created_at", { ascending: false }).limit(80),
    ]);

    if (memRes.error) throw memRes.error;
    if (chkRes.error) throw chkRes.error;

    const memories = memRes.data || [];
    const checkinsToday = chkRes.data || [];

    const todayStr = new Date().toDateString();
    const memoriesTodayCount = memories.filter(m => new Date(m.created_at).toDateString() === todayStr).length;

    updateDashboard(memoriesTodayCount, checkinsToday);
    updateMoodBoard(checkinsToday);
    updateAwards(memories, checkinsToday);
    updateTips(memoriesTodayCount, checkinsToday);
    loadMyMoodSelection(checkinsToday);
    renderPrivateMemories();

    const renderKey = memories.map(m => `${m.created_at}|${m.name}|${m.moment}`).join("||");
    if (renderKey !== lastMemoriesRenderKey) {
      lastMemoriesRenderKey = renderKey;
      listEl.innerHTML = memories.map(m => `
        <div class="card">
          <b>${escapeHtml(m.name)}</b>
          <small> — ${new Date(m.created_at).toLocaleString()}</small>
          <div>${escapeHtml(m.moment)}</div>
        </div>
      `).join("");
    }

    debug("✅ Connected. Data loaded.");
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

setInterval(loadAll, 5000);
loadAll();
