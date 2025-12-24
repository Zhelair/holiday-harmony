// ==========================
// Holiday Harmony — app.js
// (FULL COPY-PASTE VERSION)
// ==========================

const debugEl = document.getElementById("debug");
function debug(msg) {
  if (debugEl) debugEl.textContent = msg;
  console.log("[HH]", msg);
}

if (!window.supabase || !window.supabase.createClient) {
  debug("❌ Supabase library not loaded.");
  throw new Error("Supabase UMD not available");
}

// ✅ PASTE REAL VALUES (KEEP QUOTES!)
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);

// ---- URL params
const params = new URLSearchParams(location.search);
const room = (params.get("room") || "").trim();
if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}

// ---- DOM
document.getElementById("roomLabel").textContent = room;

const shareLink = document.getElementById("shareLink");
const base = location.href.substring(0, location.href.lastIndexOf("/") + 1);
shareLink.textContent = `Share: ${base}room.html?room=${encodeURIComponent(room)}`;

const nameEl = document.getElementById("name");
const momentEl = document.getElementById("moment");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

const moodStatusEl = document.getElementById("moodStatus");
const moodBoardEl = document.getElementById("moodBoard");

const kpiMemoriesEl = document.getElementById("kpiMemories");
const kpiCheckinsEl = document.getElementById("kpiCheckins");
const kpiMoodEl = document.getElementById("kpiMood");
const kpiReactsEl = document.getElementById("kpiReacts");

const defuseBtn = document.getElementById("defuseBtn");
const choreBtn = document.getElementById("choreBtn");
const defuseOut = document.getElementById("defuseOut");

const awardsOut = document.getElementById("awardsOut");
const tipsOut = document.getElementById("tipsOut");
const recapOut = document.getElementById("recapOut");
const newTipBtn = document.getElementById("newTipBtn");

const soundToggle = document.getElementById("soundToggle");
const partyBtn = document.getElementById("partyBtn");

const missionOut = document.getElementById("missionOut");
const missionDoneBtn = document.getElementById("missionDoneBtn");
const missionNewBtn = document.getElementById("missionNewBtn");

const vibeBarEl = document.getElementById("vibeBar");

// ---- helpers
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

function soundOn() {
  return soundToggle ? !!soundToggle.checked : true;
}

function tryPlayAudio(src, opts = {}) {
  if (!soundOn()) return null;
  try {
    const a = new Audio(src);
    a.addEventListener("error", () => {});
    if (opts.loop) a.loop = true;
    if (typeof opts.volume === "number") a.volume = opts.volume;
    a.play().catch(() => {});
    return a;
  } catch { return null; }
}

function playSound(which) {
  if (!soundOn()) return;
  const map = {
    tap: "assets/sounds/tap.mp3",
    success: "assets/sounds/success.mp3",
  };
  const src = map[which];
  if (!src) return;
  tryPlayAudio(src, { volume: 0.9 });
}

// ---- ambience (LOUD)
let ambienceAudio = null;
partyBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!ambienceAudio) {
    ambienceAudio = new Audio("assets/sounds/ambience.mp3");
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.85; // louder
    ambienceAudio.addEventListener("error", () => {});
  }
  if (!soundOn()) { ambienceAudio.pause(); return; }
  if (ambienceAudio.paused) ambienceAudio.play().catch(() => {});
  else ambienceAudio.pause();
});
soundToggle?.addEventListener("change", () => {
  if (!soundOn() && ambienceAudio) ambienceAudio.pause();
});

// ---- remember name
function getSavedName() { return localStorage.getItem("hh_name") || ""; }
function setSavedName(v) { if (v) localStorage.setItem("hh_name", v); }

(function initIdentity(){
  const n = getSavedName();
  if (n && nameEl) nameEl.value = n;
})();
nameEl?.addEventListener("input", () => {
  const name = (nameEl.value || "").trim();
  if (name) setSavedName(name);
});

// ---- device id (for reactions)
function ensureDeviceId() {
  let id = localStorage.getItem("hh_device_id");
  if (!id) {
    id = (crypto?.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    localStorage.setItem("hh_device_id", id);
  }
  return id;
}
const DEVICE_ID = ensureDeviceId();

// ==========================
// Today’s Mission (no DB)
// ==========================
const missionPool = [
  "Say one sincere compliment to someone today.",
  "Tea break: 15 minutes with no problem-solving.",
  "5-minute tidy sprint with music.",
  "Ask someone: ‘What was the best part of your day?’",
  "Do one small helpful thing without announcing it 😄",
  "Take a 10-minute walk together (no heavy topics).",
  "Everyone shares one funny childhood memory.",
  "Kitchen teamwork: make one thing together.",
  "Photo moment: take a goofy group selfie.",
  "Movie vote: everyone suggests 1 title, then vote."
];

function hashStringToInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function missionKeyBase() { return `hh_mission_${room}_${todayISODate()}`; }
function myMissionOverrideKey() { return `${missionKeyBase()}_override_${DEVICE_ID}`; }
function missionDoneKey() {
  const name = ((nameEl?.value || getSavedName()) || "anon").trim().toLowerCase();
  return `${missionKeyBase()}_done_${name}_${DEVICE_ID}`;
}
function getTodaysMissionIndex() {
  const baseSeed = `${room}|${todayISODate()}`;
  return hashStringToInt(baseSeed) % missionPool.length;
}
function renderMission() {
  const override = localStorage.getItem(myMissionOverrideKey());
  const idx = override ? Number(override) : getTodaysMissionIndex();
  const mission = missionPool[(Number.isFinite(idx) ? idx : 0) % missionPool.length];
  const done = localStorage.getItem(missionDoneKey()) === "1";
  missionOut.innerHTML = `<b>Today:</b> ${escapeHtml(mission)}<br><small>${done ? "✅ You marked it done." : "Not marked done yet."}</small>`;
}
missionDoneBtn?.addEventListener("click", () => {
  playSound("tap");
  const name = (nameEl.value || "").trim();
  if (!name) return alert("Please enter your name first 🙂");
  localStorage.setItem(missionDoneKey(), "1");
  renderMission();
  playSound("success");
});
missionNewBtn?.addEventListener("click", () => {
  playSound("tap");
  localStorage.setItem(myMissionOverrideKey(), String(Math.floor(Math.random() * missionPool.length)));
  renderMission();
  playSound("success");
});
renderMission();

// ==========================
// Activity / Reset / Chores
// ==========================
const activities = [
  "2 Truths and a Lie (one round each)",
  "Pick a movie: everyone suggests 1 title, then vote",
  "10-minute walk together (no big topics — just fresh air 😄)",
  "Tea + dessert: each person says one good thing from today",
  "Photo challenge: recreate an old family photo pose",
  "Mini quiz: 'Who said this?' (family quotes edition)",
  "Puzzle/board game for 20 minutes",
  "Kitchen teamwork: one person chops, one stirs, one tastes",
  "Quick tidy sprint: 5 minutes with music",
  "Story time: each person shares one warm memory"
];
document.getElementById("activityBtn")?.addEventListener("click", () => {
  playSound("tap");
  const pick = activities[Math.floor(Math.random() * activities.length)];
  document.getElementById("activityOut").innerHTML = `<div style="margin-top:10px"><b>${escapeHtml(pick)}</b></div>`;
});

const defuseLines = [
  "Reset moment: 3 slow breaths. Then softer voices. 🙂",
  "Quick pause: water + a small smile. Team ‘family’ is back online.",
  "Switch scene: tea, a short walk, or a cozy activity. Keep it light for 10 minutes.",
  "Compliment round: one sincere sentence each.",
  "Humor mode: say your complaint like a Disney villain.",
  "Peace offering: bring a snack. Snacks solve many mysteries.",
  "Kind first, correct later. Works weirdly well."
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
      <small>Rule: we do it with good humor.</small>
    </div>`;
});

// ==========================
// Mood check-in
// ==========================
const moodButtons = {
  good: document.getElementById("moodGood"),
  ok: document.getElementById("moodOk"),
  bad: document.getElementById("moodBad"),
};
function clearMoodSelection() {
  Object.values(moodButtons).forEach(btn => btn?.classList.remove("moodSelected"));
}
async function setMood(mood) {
  const name = (nameEl.value || "").trim();
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

function loadMyMoodSelection(checkinsToday) {
  const name = (nameEl.value || "").trim();
  if (!name) return;
  const mine = checkinsToday.find(c => c.name === name);
  if (!mine) return;

  clearMoodSelection();
  if (mine.mood === "good") moodButtons.good?.classList.add("moodSelected");
  if (mine.mood === "ok") moodButtons.ok?.classList.add("moodSelected");
  if (mine.mood === "bad") moodButtons.bad?.classList.add("moodSelected");
}

// ==========================
// Reactions (debug-proof)
// ==========================
async function toggleReaction(memoryId, emoji) {
  const name = ((nameEl.value || getSavedName()) || "Someone").trim();
  if (!memoryId) return;

  playSound("tap");

  // 1) SELECT existing
  const { data: existing, error: selErr } = await supa
    .from("reactions")
    .select("id")
    .eq("room_code", room)
    .eq("memory_id", memoryId)
    .eq("emoji", emoji)
    .eq("device_id", DEVICE_ID)
    .limit(1);

  if (selErr) {
    alert("REACTION SELECT ERROR:\n" + selErr.message);
    debug("❌ Reaction SELECT error: " + selErr.message);
    return;
  }

  // 2) Toggle: delete if exists, else insert
  if (existing && existing.length) {
    const { error: delErr } = await supa
      .from("reactions")
      .delete()
      .eq("id", existing[0].id);

    if (delErr) {
      alert("REACTION DELETE ERROR:\n" + delErr.message);
      debug("❌ Reaction DELETE error: " + delErr.message);
      return;
    }
  } else {
    const { error: insErr } = await supa
      .from("reactions")
      .insert([{
        room_code: room,
        memory_id: memoryId,
        emoji,
        name,
        device_id: DEVICE_ID
      }]);

    if (insErr) {
      alert("REACTION INSERT ERROR:\n" + insErr.message);
      debug("❌ Reaction INSERT error: " + insErr.message);
      return;
    }
  }

  playSound("success");
  await loadAll();
}

// Event delegation: always works
listEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".reactBtn");
  if (!btn) return;
  const mid = btn.getAttribute("data-mid");
  const emo = btn.getAttribute("data-emo");
  await toggleReaction(mid, emo);
});

// ==========================
// Dashboard + vibe bar
// ==========================
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

function setVibeBar(percent, vibeText) {
  if (!vibeBarEl) return;
  const p = Math.max(0, Math.min(100, percent));
  vibeBarEl.style.width = p + "%";

  if (String(vibeText).includes("Overloaded")) {
    vibeBarEl.style.background = "linear-gradient(90deg, #ffb3b3, #ffd1d1)";
  } else if (String(vibeText).includes("Calm")) {
    vibeBarEl.style.background = "linear-gradient(90deg, #b8f0d0, #d6ffe9)";
  } else {
    vibeBarEl.style.background = "linear-gradient(90deg, #ffe7b3, #fff2d6)";
  }
}

function updateDashboard(memoriesTodayCount, checkinsToday, reactionsTodayCount) {
  const { counts, vibe } = summarizeMood(checkinsToday);

  kpiMemoriesEl.textContent = String(memoriesTodayCount);
  kpiCheckinsEl.textContent = String(checkinsToday.length);
  kpiMoodEl.textContent = vibe;
  kpiReactsEl.textContent = String(reactionsTodayCount);

  const el = document.getElementById("happinessLevel");

  let label = "🙂 Cozy start";
  let note = "Post one happy moment (even a tiny one).";
  if (memoriesTodayCount >= 2 || checkinsToday.length >= 2) { label = "🙂 Good vibes"; note = "Nice. The warm timeline is growing."; }
  if (memoriesTodayCount >= 4 && counts.bad === 0) { label = "😄 Great day together"; note = "Food, laughs, and a little rest. Perfect."; }
  if (counts.bad >= 2 && checkinsToday.length >= 3) { label = "🧯 Gentle reset"; note = "Tea/walk mode can save the evening."; }

  el.innerHTML = `<b>${label}</b><br><small>${escapeHtml(note)}</small>`;

  const badCount = (checkinsToday || []).filter(c => c.mood === "bad").length;
  const scoreRaw = (memoriesTodayCount * 12) + (reactionsTodayCount * 3) + (checkinsToday.length * 8) - (badCount * 12);
  const score = Math.max(0, Math.min(100, scoreRaw));
  setVibeBar(score, vibe);

  recapOut.innerHTML = `
    <b>Today recap:</b><br>
    • Memories: <b>${memoriesTodayCount}</b> • Reactions: <b>${reactionsTodayCount}</b><br>
    • Check-ins: 😇 <b>${counts.good}</b> / 😐 <b>${counts.ok}</b> / 😤 <b>${counts.bad}</b><br>
    <small>Vibe meter is… surprisingly accurate 😄</small>
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

function updateAwards(memories, checkinsToday, reactionsByMemory) {
  if (!awardsOut) return;

  const byName = {};
  for (const m of memories) byName[m.name] = (byName[m.name] || 0) + 1;
  const top = Object.entries(byName).sort((a,b)=>b[1]-a[1])[0];
  const mostMemories = top ? { name: top[0], val: top[1] } : null;

  let topMemory = null;
  for (const m of memories) {
    const cnt = reactionsByMemory[m.id]?.total || 0;
    if (!topMemory || cnt > topMemory.cnt) topMemory = { cnt, name: m.name };
  }

  const moodNames = { good: [], ok: [], bad: [] };
  for (const c of checkinsToday) moodNames[c.mood]?.push(c.name);

  const awards = [];
  if (mostMemories) awards.push(`✨ <b>Memory Maker</b>: ${escapeHtml(mostMemories.name)} (${mostMemories.val} posts)`);
  if (moodNames.good?.[0]) awards.push(`🕊 <b>Calm Star</b>: ${escapeHtml(moodNames.good[0])}`);
  if (moodNames.ok?.[0]) awards.push(`🙂 <b>Steady Support</b>: ${escapeHtml(moodNames.ok[0])}`);
  if (moodNames.bad?.[0]) awards.push(`🫶 <b>Needs a Hug</b>: ${escapeHtml(moodNames.bad[0])}`);
  if (topMemory && topMemory.cnt > 0) awards.push(`⭐ <b>Most Loved Moment</b>: ${escapeHtml(topMemory.name)} (${topMemory.cnt} reactions)`);

  awardsOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      ${awards.length ? awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("") : "<small>No awards yet.</small>"}
    </div>`;
}

// ==========================
// Tips
// ==========================
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
  tips.push("⭐ React to memories — it boosts the vibe fast.");
  return tips;
}

let lastTipsPool = [];
newTipBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!lastTipsPool.length) return;
  tipsOut.innerHTML = pickRandom(lastTipsPool, 3).map(t => `<div style="margin:10px 0;">${escapeHtml(t)}</div>`).join("");
});

// ==========================
// Post memory
// ==========================
async function postMemory() {
  statusEl.textContent = "";
  const name = (nameEl.value || "").trim();
  const moment = (momentEl.value || "").trim();

  if (!name || !moment) {
    statusEl.textContent = "Please fill your name + the moment.";
    return;
  }

  playSound("tap");

  const { error } = await supa.from("memories").insert([{ room_code: room, name, moment }]);
  if (error) {
    statusEl.textContent = "Post error: " + error.message;
    return;
  }

  momentEl.value = "";
  statusEl.textContent = "Posted ✅";
  playSound("success");
  await loadAll();
}
document.getElementById("postBtn")?.addEventListener("click", postMemory);

// ==========================
// Supabase reaction self-test
// ==========================
async function reactionsSelfTest() {
  // This tells us if the database allows select/insert/delete for anon users.
  try {
    const pingEmoji = "TEST";
    const fakeMemoryId = 0; // will fail if memory_id must reference a real memory (that's OK; error will tell us)
    const name = "selftest";

    // Try SELECT
    const sel = await supa.from("reactions").select("id").limit(1);
    if (sel.error) {
      debug("❌ Reactions SELECT blocked: " + sel.error.message);
      return;
    }

    // Try INSERT (may fail due to constraints; we want the exact message)
    const ins = await supa.from("reactions").insert([{
      room_code: room,
      memory_id: fakeMemoryId,
      emoji: pingEmoji,
      name,
      device_id: DEVICE_ID
    }]).select("id");

    if (ins.error) {
      debug("⚠️ Reactions INSERT test failed (good clue): " + ins.error.message);
      return;
    }

    // Try DELETE test row
    const newId = ins.data?.[0]?.id;
    if (newId) {
      const del = await supa.from("reactions").delete().eq("id", newId);
      if (del.error) {
        debug("⚠️ Reactions DELETE test failed: " + del.error.message);
        return;
      }
    }

    debug("✅ Reactions SELECT/INSERT/DELETE looks OK.");
  } catch (e) {
    debug("⚠️ Reactions self-test exception: " + (e?.message || String(e)));
  }
}

// ==========================
// Load + render
// ==========================
let lastRenderKey = "";

async function loadAll() {
  try {
    const today = todayISODate();
    const todayStr = new Date().toDateString();

    const [memRes, chkRes, reactRes] = await Promise.all([
      supa.from("memories").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(80),
      supa.from("checkins").select("*").eq("room_code", room).eq("checkin_date", today).order("created_at", { ascending: false }).limit(80),
      supa.from("reactions").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(600),
    ]);

    if (memRes.error) throw memRes.error;
    if (chkRes.error) throw chkRes.error;
    if (reactRes.error) throw reactRes.error;

    const memories = memRes.data || [];
    const checkinsToday = chkRes.data || [];
    const reactions = reactRes.data || [];

    const memoriesTodayCount = memories.filter(m => new Date(m.created_at).toDateString() === todayStr).length;

    const reactionsByMemory = {};
    let reactionsTodayCount = 0;

    for (const r of reactions) {
      const memId = String(r.memory_id);
      if (!reactionsByMemory[memId]) reactionsByMemory[memId] = { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };

      if (reactionsByMemory[memId][r.emoji] !== undefined) reactionsByMemory[memId][r.emoji] += 1;
      reactionsByMemory[memId].total += 1;

      if (new Date(r.created_at).toDateString() === todayStr) reactionsTodayCount += 1;
    }

    updateDashboard(memoriesTodayCount, checkinsToday, reactionsTodayCount);
    updateMoodBoard(checkinsToday);
    updateAwards(memories, checkinsToday, reactionsByMemory);

    lastTipsPool = buildTipsPool(memoriesTodayCount, checkinsToday);
    if (tipsOut && tipsOut.textContent.includes("Loading")) {
      tipsOut.innerHTML = pickRandom(lastTipsPool, 3).map(t => `<div style="margin:10px 0;">${escapeHtml(t)}</div>`).join("");
    }

    loadMyMoodSelection(checkinsToday);
    renderMission();

    // Render only when changed (stops blinking)
    const renderKey = memories
      .map(m => `${m.id}|${m.created_at}|${reactionsByMemory[String(m.id)]?.total || 0}`)
      .join("||");

    if (renderKey !== lastRenderKey) {
      lastRenderKey = renderKey;

      listEl.innerHTML = memories.map(m => {
        const rx = reactionsByMemory[String(m.id)] || { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };
        return `
          <div class="memoryCard">
            <b>${escapeHtml(m.name)}</b>
            <small> — ${new Date(m.created_at).toLocaleString()}</small>
            <div style="margin-top:6px;">${escapeHtml(m.moment)}</div>

            <div class="memoryCardActions">
              <button class="reactBtn" data-mid="${m.id}" data-emo="❤️" type="button">❤️ ${rx["❤️"]}</button>
              <button class="reactBtn" data-mid="${m.id}" data-emo="😂" type="button">😂 ${rx["😂"]}</button>
              <button class="reactBtn" data-mid="${m.id}" data-emo="⭐" type="button">⭐ ${rx["⭐"]}</button>
            </div>
          </div>
        `;
      }).join("");
    }

    debug("✅ Connected. Data loaded.");
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

// Start
reactionsSelfTest();   // gives us clues in the debug pill
setInterval(loadAll, 5000);
loadAll();
