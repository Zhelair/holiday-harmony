import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ✅ Paste your Supabase URL + anon key here:
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- URL params
const params = new URLSearchParams(location.search);
const room = params.get("room")?.trim();
const suggestedName = params.get("name")?.trim();
const suggestedRole = params.get("role")?.trim();

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

const privateToggle = document.getElementById("privateToggle");
const privateList = document.getElementById("privateList");

if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}

roomLabel.textContent = room;

// Share link (safe)
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
  // Optional: only plays if files exist
  const map = {
    tap: "assets/sounds/tap.mp3",
    success: "assets/sounds/success.mp3",
  };
  const src = map[which];
  if (!src) return;
  try { new Audio(src).play(); } catch {}
}

// ---- Remember name + role on this device
function loadIdentity() {
  const savedName = localStorage.getItem("hh_name") || "";
  const savedRole = localStorage.getItem("hh_role") || "";

  const name = suggestedName || savedName;
  const role = suggestedRole || savedRole;

  if (name && nameEl) nameEl.value = name;
  if (role) roleLineEl.textContent = `Role: ${role}`;
  else roleLineEl.textContent = "";

  if (name) localStorage.setItem("hh_name", name);
  if (role) localStorage.setItem("hh_role", role);
}
loadIdentity();

nameEl?.addEventListener("input", () => {
  const name = nameEl.value.trim();
  if (name) localStorage.setItem("hh_name", name);
});

// ---- Activity generator
const activities = [
  "2 Truths and a Lie (one round each)",
  "Pick a movie: everyone suggests 1, then vote",
  "10-minute walk together (no big topics — just fresh air 😄)",
  "Tea + dessert: each person says one good thing from today",
  "Photo challenge: recreate an old family photo pose",
  "Mini quiz: 'Who said this?' (family quotes edition)",
  "Puzzle/board game for 20 minutes",
  "Kitchen teamwork: one person chops, one stirs, one tastes (official quality control)",
  "Quick tidy sprint: 5 minutes with music",
  "Story time: each person shares one warm memory"
];

document.getElementById("activityBtn")?.addEventListener("click", () => {
  playSound("tap");
  const pick = activities[Math.floor(Math.random() * activities.length)];
  document.getElementById("activityOut").innerHTML =
    `<div style="margin-top:10px"><b>${escapeHtml(pick)}</b></div>`;
});

// ---- Reset Moment (Defuse)
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
  "New plan: let’s be kind first, correct later. Works weirdly well."
];


defuseBtn?.addEventListener("click", () => {
  playSound("tap");
  const pick = defuseLines[Math.floor(Math.random() * defuseLines.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>🧯 Reset Moment:</b> ${escapeHtml(pick)}<br>
      <small>Try: tea • walk • music • activity button</small>
    </div>`;
});

// ---- Chore roulette (friendly)
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

choreBtn?.addEventListener("click", () => {
  playSound("tap");
  const pick = chores[Math.floor(Math.random() * chores.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>🎡 Chore Roulette:</b> ${escapeHtml(pick)}<br>
      <small>Rule: we do it with good humor. Bonus points for music.</small>
    </div>`;
});

// ---- Mood Check-in (Supabase)
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
  playSound("tap");

  const checkin_date = todayISODate();

  const { error } = await supabase
    .from("checkins")
    .upsert([{ room_code: room, name, checkin_date, mood }],
      { onConflict: "room_code,name,checkin_date" });

  if (error) {
    moodStatusEl.textContent = "Mood save error: " + error.message;
    return;
  }

  clearMoodSelection();
  if (mood === "good") moodButtons.good?.classList.add("moodSelected");
  if (mood === "ok") moodButtons.ok?.classList.add("moodSelected");
  if (mood === "bad") moodButtons.bad?.classList.add("moodSelected");

  moodStatusEl.textContent = "Checked in ✅";
  playSound("success");
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

// ---- Private memories (local only)
function privateKey() {
  return `hh_private_${room}_${todayISODate()}`;
}

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
  if (!privateList) return;
  if (list.length === 0) {
    privateList.innerHTML = `<small>No private notes yet.</small>`;
    return;
  }
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

// ---- Memories: post
async function postMemory() {
  if (statusEl) statusEl.textContent = "";

  const name = nameEl.value.trim();
  const moment = momentEl.value.trim();

  if (!name || !moment) {
    if (statusEl) statusEl.textContent = "Please fill your name + the moment.";
    return;
  }

  playSound("tap");

  // Private?
  if (privateToggle?.checked) {
    addPrivateMemory(name, moment);
    momentEl.value = "";
    if (statusEl) statusEl.textContent = "Saved privately 🔒";
    playSound("success");
    renderPrivateMemories();
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
  playSound("success");
  await loadAll();
}

document.getElementById("postBtn")?.addEventListener("click", postMemory);

// ---- Dashboard + Mood board + Awards
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
  if (!el) return;

  let label = "🙂 Cozy start";
  let note = "Post one happy moment (even a tiny one) — it helps everyone notice the good.";

  if (memoriesTodayCount >= 2 || checkinsToday.length >= 2) {
    label = "🙂 Good vibes";
    note = "Nice. The warm timeline is growing.";
  }
  if (memoriesTodayCount >= 4 && counts.bad === 0) {
    label = "😄 Great day together";
    note = "Love this. Keep it simple: food, laughs, and a little rest.";
  }
  if (counts.bad >= 2 && checkinsToday.length >= 3) {
    label = "🧯 Reset moment";
    note = "A short break can save the whole evening: tea, walk, or a quick activity.";
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
    moodBoardEl.innerHTML = `<small>No one checked in yet. Want to start? 🙂</small>`;
    return;
  }
  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";
  const moodLabel = (m) => m === "good" ? "calm" : m === "ok" ? "ok" : "overloaded";

  moodBoardEl.innerHTML = checkinsToday
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(c => `
      <div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
        <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)} <small>(${escapeHtml(moodLabel(c.mood))})</small>
      </div>
    `).join("");
}

function updateTips(memoriesTodayCount, checkinsToday) {
  const { counts } = summarizeMood(checkinsToday);
  const tips = [];

  if (counts.bad >= 2) tips.push("🧯 A couple people feel overloaded → tea/walk mode is perfect.");
  if (memoriesTodayCount === 0) tips.push("✨ No happy moments yet → post one tiny win (even “good coffee” counts).");
  if (checkinsToday.length === 0) tips.push("✅ Ask everyone to check in. It’s one tap and it helps everyone sync.");
  tips.push("🎬 Decide entertainment by voting: everyone suggests 1 movie, then vote.");
  tips.push("🧹 A 5-minute tidy sprint with music = surprisingly good mood booster.");
  tips.push("🫶 One compliment each at dinner. Keep it simple and real.");

  tipsOut.innerHTML = tips.map(t => `<div style="margin:8px 0;">${escapeHtml(t)}</div>`).join("");
}

function updateAwards(memories, checkinsToday) {
  if (!awardsOut) return;

  const byName = {};
  for (const m of memories) byName[m.name] = (byName[m.name] || 0) + 1;

  const pickTop = (obj) => {
    let bestName = null, bestVal = -1;
    for (const [k,v] of Object.entries(obj)) {
      if (v > bestVal) { bestVal = v; bestName = k; }
    }
    return bestName ? { name: bestName, val: bestVal } : null;
  };

  const moodNames = { good: [], ok: [], bad: [] };
  for (const c of checkinsToday) moodNames[c.mood]?.push(c.name);

  const mostMemories = pickTop(byName);
  const calmStar = moodNames.good.length ? moodNames.good[0] : null;
  const gentleHero = moodNames.ok.length ? moodNames.ok[0] : null;
  const needsCare = moodNames.bad.length ? moodNames.bad[0] : null;

  const checkedNames = checkinsToday.map(c => c.name);
  const randName = checkedNames.length ? checkedNames[Math.floor(Math.random()*checkedNames.length)] : null;

  const awards = [];
  if (mostMemories) awards.push(`✨ <b>Memory Maker</b>: ${escapeHtml(mostMemories.name)} (${mostMemories.val} posts)`);
  if (calmStar) awards.push(`🕊 <b>Calm Star</b>: ${escapeHtml(calmStar)}`);
  if (gentleHero) awards.push(`🙂 <b>Steady Support</b>: ${escapeHtml(gentleHero)}`);
  if (needsCare) awards.push(`🫶 <b>Needs a Hug</b>: ${escapeHtml(needsCare)} (self-reported, totally normal)`);
  if (randName) awards.push(`🎁 <b>Bonus Warmth</b>: ${escapeHtml(randName)}`);

  if (awards.length === 0) {
    awardsOut.innerHTML = `<small>No awards yet. Add a memory or a mood check-in.</small>`;
    return;
  }

  awardsOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      ${awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("")}
    </div>`;
}

// ---- Load everything
async function loadAll() {
  const today = todayISODate();

  const [memRes, chkRes] = await Promise.all([
    supabase
      .from("memories")
      .select("*")
      .eq("room_code", room)
      .order("created_at", { ascending: false })
      .limit(80),

    supabase
      .from("checkins")
      .select("*")
      .eq("room_code", room)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  const memories = memRes.data || [];
  const checkinsToday = chkRes.data || [];

  const todayStr = new Date().toDateString();
  const memoriesTodayCount = memories.filter(m =>
    new Date(m.created_at).toDateString() === todayStr
  ).length;

  updateDashboard(memoriesTodayCount, checkinsToday);
  updateMoodBoard(checkinsToday);
  updateTips(memoriesTodayCount, checkinsToday);
  updateAwards(memories, checkinsToday);
  loadMyMoodSelection(checkinsToday);
  renderPrivateMemories();

  listEl.innerHTML = memories.map(m => `
    <div class="card">
      <b>${escapeHtml(m.name)}</b>
      <small> — ${new Date(m.created_at).toLocaleString()}</small>
      <div>${escapeHtml(m.moment)}</div>
    </div>
  `).join("");
}

// Refresh
setInterval(loadAll, 4000);
loadAll();
