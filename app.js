// ==========================
// Holiday Harmony — app.js
// ==========================

const debugEl = document.getElementById("debug");
function debug(msg) {
  if (debugEl) debugEl.textContent = msg;
  console.log("[HH]", msg);
}

if (!window.supabase || !window.supabase.createClient) {
  debug("❌ Supabase library not loaded (CDN blocked?).");
  throw new Error("Supabase UMD not available");
}

// ✅ PASTE REAL VALUES (KEEP QUOTES!)
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

if (!SUPABASE_URL || !SUPABASE_ANON_PUBLIC_KEY) {
  debug("❌ Missing Supabase keys in app.js");
  throw new Error("Missing Supabase keys");
}
if (SUPABASE_URL.includes("PASTE_") || SUPABASE_ANON_PUBLIC_KEY.includes("PASTE_")) {
  debug("❌ Supabase keys are still placeholders. Paste URL + anon key in app.js.");
  // Keep going so page doesn't feel dead
}

const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);
debug("✅ JS running. Connecting…");

// ---- URL params
const params = new URLSearchParams(location.search);
const room = (params.get("room") || "").trim();

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
const kpiReactsEl = document.getElementById("kpiReacts");

const defuseBtn = document.getElementById("defuseBtn");
const choreBtn = document.getElementById("choreBtn");
const defuseOut = document.getElementById("defuseOut");

const awardsOut = document.getElementById("awardsOut");
const tipsOut = document.getElementById("tipsOut");
const recapOut = document.getElementById("recapOut");

const newTipBtn = document.getElementById("newTipBtn");

const soundToggle = document.getElementById("soundToggle");
const ambienceBtn = document.getElementById("ambienceBtn");

const challengeOut = document.getElementById("challengeOut");
const challengeDoneBtn = document.getElementById("challengeDoneBtn");
const challengeRerollBtn = document.getElementById("challengeRerollBtn");

const roleButtons = {
  Parent: document.getElementById("roleParent"),
  Child: document.getElementById("roleChild"),
  Relative: document.getElementById("roleRelative"),
  Guest: document.getElementById("roleGuest"),
};

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

function soundOn() {
  if (!soundToggle) return true;
  return !!soundToggle.checked;
}

function tryPlayAudio(src, opts = {}) {
  if (!soundOn()) return null;
  try {
    const a = new Audio(src);
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
  tryPlayAudio(src);
}

// ---- Ambience toggle
let ambienceAudio = null;
ambienceBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!ambienceAudio) {
    ambienceAudio = new Audio("assets/sounds/ambience.mp3");
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.22;
  }
  if (!soundOn()) {
    ambienceAudio.pause();
    return;
  }
  if (ambienceAudio.paused) ambienceAudio.play().catch(() => {});
  else ambienceAudio.pause();
});

// If user turns sound OFF, stop ambience too
soundToggle?.addEventListener("change", () => {
  if (!soundOn() && ambienceAudio) ambienceAudio.pause();
});

// ---- Remember name + role
function getSavedName() { return localStorage.getItem("hh_name") || ""; }
function setSavedName(v) { if (v) localStorage.setItem("hh_name", v); }

function getSavedRole() { return localStorage.getItem("hh_role") || ""; }
function setSavedRole(v) { if (v) localStorage.setItem("hh_role", v); }

function paintRoleButtons(selected) {
  Object.entries(roleButtons).forEach(([role, el]) => {
    if (!el) return;
    el.classList.toggle("roleSelected", role === selected);
  });
  roleLineEl.textContent = selected ? `Role: ${selected}` : "";
}

function loadIdentity() {
  const name = getSavedName();
  const role = getSavedRole();
  if (name && nameEl) nameEl.value = name;
  paintRoleButtons(role);
}
loadIdentity();

nameEl?.addEventListener("input", () => {
  const name = (nameEl.value || "").trim();
  if (name) setSavedName(name);
});

Object.entries(roleButtons).forEach(([role, el]) => {
  el?.addEventListener("click", () => {
    playSound("tap");
    setSavedRole(role);
    paintRoleButtons(role);
  });
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
  "Kitchen teamwork: one person chops, one stirs, one tastes",
  "Quick tidy sprint: 5 minutes with music",
  "Story time: each person shares one warm memory"
];

document.getElementById("activityBtn")?.addEventListener("click", () => {
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
  "Compliment round: each person says one nice thing. Short and real.",
  "Humor mode: say your complaint like a Disney villain. Everyone laughs, problem shrinks.",
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

choreBtn?.addEventListener("click", () => {
  playSound("tap");
  const pick = chores[Math.floor(Math.random() * chores.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>🎡 Chore Roulette:</b> ${escapeHtml(pick)}<br>
      <small>Rule: we do it with good humor.</small>
    </div>`;
});

// ---- Mood check-in
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

// ---------------------------
// Daily Challenge (DB-backed)
// ---------------------------
const challengePool = [
  "Everyone says one sincere compliment today.",
  "Take a 10-minute walk together (no heavy topics).",
  "Do a 5-minute tidy sprint with music.",
  "Tea break: no problem-solving for 15 minutes.",
  "Each person shares one funny memory from the past.",
  "One small kindness: do a tiny helpful thing for someone.",
  "Movie vote: everyone suggests 1 title, then vote.",
  "Kitchen teamwork: cook one thing together."
];

let todaysChallenge = null;

async function ensureChallengeToday(forceReroll = false) {
  const date = todayISODate();
  const pick = challengePool[Math.floor(Math.random() * challengePool.length)];

  if (forceReroll) {
    // Update the text for today
    const { error } = await supa
      .from("challenges")
      .upsert([{ room_code: room, challenge_date: date, text: pick }],
        { onConflict: "room_code,challenge_date" });

    if (error) {
      challengeOut.textContent = "Challenge error: " + error.message;
      return;
    }
  } else {
    // Create if missing (will overwrite only if row doesn't exist)
    const { data, error } = await supa
      .from("challenges")
      .select("*")
      .eq("room_code", room)
      .eq("challenge_date", date)
      .limit(1);

    if (error) {
      challengeOut.textContent = "Challenge load error: " + error.message;
      return;
    }

    if (!data || data.length === 0) {
      const { error: e2 } = await supa
        .from("challenges")
        .insert([{ room_code: room, challenge_date: date, text: pick }]);
      if (e2) {
        challengeOut.textContent = "Challenge create error: " + e2.message;
        return;
      }
    }
  }

  const { data: again, error: e3 } = await supa
    .from("challenges")
    .select("*")
    .eq("room_code", room)
    .eq("challenge_date", date)
    .limit(1);

  if (e3 || !again || !again[0]) {
    challengeOut.textContent = "Challenge load error.";
    return;
  }

  todaysChallenge = again[0];
  renderChallenge();
}

function challengeDoneKey() {
  return `hh_ch_done_${room}_${todayISODate()}_${getSavedName() || "anon"}`;
}

function renderChallenge() {
  if (!todaysChallenge) return;
  const done = localStorage.getItem(challengeDoneKey()) === "1";
  challengeOut.innerHTML = `
    <div class="tipBox">
      <b>Today:</b> ${escapeHtml(todaysChallenge.text)}<br>
      <small>${done ? "✅ You marked it done (you)." : "Not marked done yet."}</small>
    </div>`;
}

challengeDoneBtn?.addEventListener("click", () => {
  playSound("tap");
  localStorage.setItem(challengeDoneKey(), "1");
  renderChallenge();
  playSound("success");
});

challengeRerollBtn?.addEventListener("click", async () => {
  playSound("tap");
  await ensureChallengeToday(true);
  playSound("success");
});

// ---------------------------
// Reactions (DB-backed)
// ---------------------------
async function addReaction(memoryId, emoji) {
  const name = (nameEl.value || getSavedName() || "Someone").trim();
  if (!memoryId) return;

  playSound("tap");

  const { error } = await supa
    .from("reactions")
    .insert([{ room_code: room, memory_id: memoryId, emoji, name }]);

  // If unique constraint blocks duplicates, ignore it.
  if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
    debug("Reaction error: " + error.message);
  }
  await loadAll();
}

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

function updateDashboard(memoriesTodayCount, checkinsToday, reactionsTodayCount) {
  const { counts, vibe } = summarizeMood(checkinsToday);

  kpiMemoriesEl.textContent = String(memoriesTodayCount);
  kpiCheckinsEl.textContent = String(checkinsToday.length);
  kpiMoodEl.textContent = vibe;
  kpiReactsEl.textContent = String(reactionsTodayCount);

  const el = document.getElementById("happinessLevel");

  let label = "🙂 Cozy start";
  let note = "Post one happy moment (even a tiny one) — it helps everyone notice the good.";

  if (memoriesTodayCount >= 2 || checkinsToday.length >= 2) {
    label = "🙂 Good vibes";
    note = "Nice. The warm timeline is growing.";
  }
  if (memoriesTodayCount >= 4 && counts.bad === 0) {
    label = "😄 Great day together";
    note = "Food, laughs, and a little rest. Perfect.";
  }
  if (counts.bad >= 2 && checkinsToday.length >= 3) {
    label = "🧯 Gentle reset";
    note = "Tea/walk mode can save the evening.";
  }

  el.innerHTML = `<b>${label}</b><br><small>${escapeHtml(note)}</small>`;

  // End-of-day recap style box
  const calm = counts.good;
  const ok = counts.ok;
  const over = counts.bad;

  recapOut.innerHTML = `
    <b>Today recap:</b><br>
    • Memories: <b>${memoriesTodayCount}</b> &nbsp; • Reactions: <b>${reactionsTodayCount}</b><br>
    • Check-ins: 😇 <b>${calm}</b> / 😐 <b>${ok}</b> / 😤 <b>${over}</b><br>
    <small>Pro tip: when reactions go up, the room gets warmer. Science-ish. 😄</small>
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

  // Memory Maker
  const byName = {};
  for (const m of memories) byName[m.name] = (byName[m.name] || 0) + 1;
  const top = Object.entries(byName).sort((a,b)=>b[1]-a[1])[0];
  const mostMemories = top ? { name: top[0], val: top[1] } : null;

  // Most loved memory (by reactions)
  let topMemory = null;
  for (const m of memories) {
    const cnt = reactionsByMemory[m.id]?.total || 0;
    if (!topMemory || cnt > topMemory.cnt) topMemory = { id: m.id, cnt, name: m.name, moment: m.moment };
  }

  const moodNames = { good: [], ok: [], bad: [] };
  for (const c of checkinsToday) moodNames[c.mood]?.push(c.name);

  const awards = [];
  if (mostMemories) awards.push(`✨ <b>Memory Maker</b>: ${escapeHtml(mostMemories.name)} (${mostMemories.val} posts)`);
  if (moodNames.good?.[0]) awards.push(`🕊 <b>Calm Star</b>: ${escapeHtml(moodNames.good[0])}`);
  if (moodNames.ok?.[0]) awards.push(`🙂 <b>Steady Support</b>: ${escapeHtml(moodNames.ok[0])}`);
  if (moodNames.bad?.[0]) awards.push(`🫶 <b>Needs a Hug</b>: ${escapeHtml(moodNames.bad[0])} (self-reported, totally normal)`);

  if (topMemory && topMemory.cnt > 0) {
    awards.push(`⭐ <b>Most Loved Moment</b>: ${escapeHtml(topMemory.name)} (${topMemory.cnt} reactions)`);
  }

  awardsOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      ${awards.length ? awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("") : "<small>No awards yet.</small>"}
    </div>`;
}

// ---- Quick Tips
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
  tips.push("⭐ Try reacting to memories — it boosts the vibe fast.");

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

newTipBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!lastTipsPool.length) lastTipsPool = buildTipsPool(lastMemoriesTodayCount, lastCheckinsToday);
  renderTips(pickRandom(lastTipsPool, 3));
});

// ---- Post memory
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

// ---- Stop blinking: only re-render memories list when it changed
let lastMemoriesRenderKey = "";

// ---- Main load
async function loadAll() {
  try {
    const today = todayISODate();

    // Load memories + checkins + reactions + challenge
    const [memRes, chkRes, reactRes] = await Promise.all([
      supa.from("memories").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(80),
      supa.from("checkins").select("*").eq("room_code", room).eq("checkin_date", today).order("created_at", { ascending: false }).limit(80),
      supa.from("reactions").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(500),
    ]);

    if (memRes.error) throw memRes.error;
    if (chkRes.error) throw chkRes.error;
    if (reactRes.error) throw reactRes.error;

    const memories = memRes.data || [];
    const checkinsToday = chkRes.data || [];
    const reactions = reactRes.data || [];

    // Ensure today’s challenge exists
    await ensureChallengeToday(false);

    // Count today's memories
    const todayStr = new Date().toDateString();
    const memoriesTodayCount = memories.filter(m => new Date(m.created_at).toDateString() === todayStr).length;

    // Build reactions per memory + count today reactions
    const reactionsByMemory = {};
    let reactionsTodayCount = 0;

    for (const r of reactions) {
      const memId = r.memory_id;
      if (!reactionsByMemory[memId]) reactionsByMemory[memId] = { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };

      if (reactionsByMemory[memId][r.emoji] !== undefined) reactionsByMemory[memId][r.emoji] += 1;
      reactionsByMemory[memId].total += 1;

      if (new Date(r.created_at).toDateString() === todayStr) reactionsTodayCount += 1;
    }

    // UI updates
    updateDashboard(memoriesTodayCount, checkinsToday, reactionsTodayCount);
    updateMoodBoard(checkinsToday);
    updateAwards(memories, checkinsToday, reactionsByMemory);
    updateTips(memoriesTodayCount, checkinsToday);
    loadMyMoodSelection(checkinsToday);

    // Render memories with reactions
    const renderKey = memories.map(m => `${m.id}|${m.created_at}|${m.name}|${m.moment}|${reactionsByMemory[m.id]?.total || 0}`).join("||");

    if (renderKey !== lastMemoriesRenderKey) {
      lastMemoriesRenderKey = renderKey;

      listEl.innerHTML = memories.map(m => {
        const rx = reactionsByMemory[m.id] || { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };

        return `
          <div class="card">
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

      // Attach reaction listeners
      document.querySelectorAll(".reactBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const mid = btn.getAttribute("data-mid");
          const emo = btn.getAttribute("data-emo");
          await addReaction(mid, emo);
          playSound("success");
        });
      });
    }

    debug("✅ Connected. Data loaded.");
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

setInterval(loadAll, 5000);
loadAll();
