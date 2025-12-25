// ==========================
// Holiday Harmony — app.js (No Password / Sandbox Mode)
// History + Mood + Memories + Reactions + Vibe Bar + No-blink feed + Ambience
// ==========================

/* -------------------------
   Debug
------------------------- */
const debugEl = document.getElementById("debug");
function debug(msg) {
  if (debugEl) debugEl.textContent = msg;
  console.log("[HH]", msg);
}

if (!window.supabase || !window.supabase.createClient) {
  debug("❌ Supabase library not loaded.");
  throw new Error("Supabase UMD not available");
}

/* -------------------------
   ✅ CONFIG — paste real values
------------------------- */
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

/* -------------------------
   Supabase client (no password)
------------------------- */
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);

/* -------------------------
   Room / URL params
------------------------- */
const params = new URLSearchParams(location.search);
const room = (params.get("room") || "").trim();

if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}

const roomLabelEl = document.getElementById("roomLabel");
if (roomLabelEl) roomLabelEl.textContent = room;

const shareLink = document.getElementById("shareLink");
if (shareLink) {
  const base = location.href.substring(0, location.href.lastIndexOf("/") + 1);
  shareLink.textContent = `Share: ${base}room.html?room=${encodeURIComponent(room)}`;
}

/* -------------------------
   DOM refs
------------------------- */
const nameEl = document.getElementById("name");
const momentEl = document.getElementById("moment");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");
const tagSelect = document.getElementById("tagSelect");

const moodStatusEl = document.getElementById("moodStatus");
const moodBoardEl = document.getElementById("moodBoard");

const kpiMemoriesEl = document.getElementById("kpiMemories");
const kpiCheckinsEl = document.getElementById("kpiCheckins");
const kpiMoodEl = document.getElementById("kpiMood");
const kpiReactsEl = document.getElementById("kpiReacts");

const vibeWrapEl = document.getElementById("vibeWrap");
const vibeBarEl = document.getElementById("vibeBar");

const soundToggle = document.getElementById("soundToggle");
const partyBtn = document.getElementById("partyBtn");

// History controls
const btnToday = document.getElementById("btnToday");
const btnYesterday = document.getElementById("btnYesterday");
const btn7 = document.getElementById("btn7");
const btn30 = document.getElementById("btn30");
const historyDateEl = document.getElementById("historyDate");
const historyStatusEl = document.getElementById("historyStatus");

/* -------------------------
   Helpers
------------------------- */
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (s) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[s]));
}

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(baseISO, delta) {
  const d = new Date(`${baseISO}T00:00:00`);
  d.setDate(d.getDate() + delta);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isoToStartEnd(iso) {
  const start = new Date(`${iso}T00:00:00`);
  const end = new Date(`${iso}T23:59:59.999`);
  return { start: start.toISOString(), end: end.toISOString() };
}

function fmtLocal(ts) {
  try { return new Date(ts).toLocaleString(); }
  catch { return ""; }
}

/* -------------------------
   Saved name + device id
------------------------- */
function getSavedName() { return localStorage.getItem("hh_name") || ""; }
function setSavedName(v) { if (v) localStorage.setItem("hh_name", v); }

(function initName() {
  const n = getSavedName();
  if (n && nameEl) nameEl.value = n;
})();
nameEl?.addEventListener("input", () => {
  const name = (nameEl.value || "").trim();
  if (name) setSavedName(name);
});

function ensureDeviceId() {
  let id = localStorage.getItem("hh_device_id");
  if (!id) {
    id = (crypto?.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    localStorage.setItem("hh_device_id", id);
  }
  return id;
}
const DEVICE_ID = ensureDeviceId();

/* -------------------------
   History state
------------------------- */
let SELECTED_DATE = params.get("date") || todayISODate();
historyDateEl && (historyDateEl.value = SELECTED_DATE);

function viewingToday() { return SELECTED_DATE === todayISODate(); }

function setSelectedDate(iso) {
  SELECTED_DATE = iso;
  if (historyDateEl) historyDateEl.value = iso;

  const url = new URL(location.href);
  url.searchParams.set("date", iso);
  history.replaceState({}, "", url.toString());

  updateReadOnlyUI();
  loadForSelectedDate();
}

btnToday?.addEventListener("click", () => setSelectedDate(todayISODate()));
btnYesterday?.addEventListener("click", () => setSelectedDate(addDaysISO(todayISODate(), -1)));
btn7?.addEventListener("click", () => setSelectedDate(addDaysISO(todayISODate(), -6)));
btn30?.addEventListener("click", () => setSelectedDate(addDaysISO(todayISODate(), -29)));
historyDateEl?.addEventListener("change", () => {
  const iso = (historyDateEl.value || "").trim();
  if (iso) setSelectedDate(iso);
});

function updateReadOnlyUI() {
  const isToday = viewingToday();
  const lockMsg = isToday
    ? ""
    : "🔒 View only: you’re looking at a past day. Posting/check-in works only for today.";
  if (historyStatusEl) historyStatusEl.innerHTML = lockMsg ? `<small>${escapeHtml(lockMsg)}</small>` : "";

  const disable = !isToday;
  document.getElementById("postBtn")?.toggleAttribute("disabled", disable);
  document.getElementById("moodGood")?.toggleAttribute("disabled", disable);
  document.getElementById("moodOk")?.toggleAttribute("disabled", disable);
  document.getElementById("moodBad")?.toggleAttribute("disabled", disable);
}

/* -------------------------
   Sound
------------------------- */
function soundOn() { return soundToggle ? !!soundToggle.checked : true; }

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

let ambienceAudio = null;
partyBtn?.addEventListener("click", () => {
  if (!ambienceAudio) {
    ambienceAudio = new Audio("assets/sounds/ambience.mp3");
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.9; // louder
  }
  if (!soundOn()) { ambienceAudio.pause(); return; }
  if (ambienceAudio.paused) ambienceAudio.play().catch(() => {});
  else ambienceAudio.pause();
});
soundToggle?.addEventListener("change", () => {
  if (!soundOn() && ambienceAudio) ambienceAudio.pause();
});

/* -------------------------
   Vibe bar
------------------------- */
let lastVibePercent = null;

function pulseVibe() {
  if (!vibeWrapEl) return;
  vibeWrapEl.classList.remove("vibePulse");
  void vibeWrapEl.offsetWidth;
  vibeWrapEl.classList.add("vibePulse");
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

  if (lastVibePercent === null || Math.abs(p - lastVibePercent) >= 3) {
    pulseVibe();
    lastVibePercent = p;
  }
}

/* -------------------------
   Mood summary
------------------------- */
function summarizeMood(checkins) {
  const counts = { good: 0, ok: 0, bad: 0 };
  for (const c of checkins) if (counts[c.mood] !== undefined) counts[c.mood]++;
  let vibe = "No check-ins";
  if (checkins.length > 0) {
    if (counts.bad >= Math.max(counts.good, counts.ok)) vibe = "😤 Overloaded";
    else if (counts.good >= Math.max(counts.ok, counts.bad)) vibe = "😇 Calm";
    else vibe = "😐 Okay";
  }
  return { counts, vibe };
}

function updateMoodBoard(checkins) {
  if (!moodBoardEl) return;
  if (checkins.length === 0) {
    moodBoardEl.innerHTML = `<small>No check-ins.</small>`;
    return;
  }
  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";

  moodBoardEl.innerHTML = checkins
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(c => `
      <div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
        <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)}
      </div>
    `).join("");
}

/* -------------------------
   Reactions (toggle + counts)
------------------------- */
async function toggleReaction(memoryIdRaw, emoji) {
  const memIdNum = Number(memoryIdRaw);
  if (!Number.isFinite(memIdNum)) return;

  const { data: existing, error: selErr } = await supa
    .from("reactions")
    .select("id")
    .eq("room_code", room)
    .eq("memory_id", memIdNum)
    .eq("emoji", emoji)
    .eq("device_id", DEVICE_ID)
    .limit(1);

  if (selErr) { alert("Reaction select error: " + selErr.message); return; }

  if (existing && existing.length) {
    const { error: delErr } = await supa.from("reactions").delete().eq("id", existing[0].id);
    if (delErr) { alert("Reaction delete error: " + delErr.message); return; }
  } else {
    const name = ((nameEl.value || getSavedName()) || "Someone").trim();
    const { error: insErr } = await supa.from("reactions").insert([{
      room_code: room, memory_id: memIdNum, emoji, name, device_id: DEVICE_ID
    }]);
    if (insErr) { alert("Reaction insert error: " + insErr.message); return; }
  }

  loadForSelectedDate();
}

listEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".reactBtn");
  if (!btn) return;
  await toggleReaction(btn.getAttribute("data-mid"), btn.getAttribute("data-emo"));
});

/* -------------------------
   Post memory + Mood check-in (today only)
------------------------- */
async function postMemory() {
  if (!viewingToday()) return;

  const name = (nameEl.value || "").trim();
  let moment = (momentEl.value || "").trim();
  const tag = (tagSelect?.value || "").trim();

  if (!name || !moment) { statusEl.textContent = "Please fill your name + the moment."; return; }
  if (tag) moment = `${tag} ${moment}`;

  const { error } = await supa.from("memories").insert([{ room_code: room, name, moment }]);
  if (error) { statusEl.textContent = "Error: " + error.message; return; }

  momentEl.value = "";
  statusEl.textContent = "Posted ✅";
  loadForSelectedDate();
}
document.getElementById("postBtn")?.addEventListener("click", postMemory);

const moodButtons = {
  good: document.getElementById("moodGood"),
  ok: document.getElementById("moodOk"),
  bad: document.getElementById("moodBad"),
};

function clearMoodSelection() {
  Object.values(moodButtons).forEach(btn => btn?.classList.remove("moodSelected"));
}

async function setMood(mood) {
  if (!viewingToday()) return;

  const name = (nameEl.value || "").trim();
  if (!name) { moodStatusEl.textContent = "Please enter your name first 🙂"; return; }

  moodStatusEl.textContent = "Saving…";

  const checkin_date = todayISODate();
  const { error } = await supa
    .from("checkins")
    .upsert([{ room_code: room, name, checkin_date, mood }],
      { onConflict: "room_code,name,checkin_date" });

  if (error) { moodStatusEl.textContent = "Error: " + error.message; return; }

  clearMoodSelection();
  if (mood === "good") moodButtons.good?.classList.add("moodSelected");
  if (mood === "ok") moodButtons.ok?.classList.add("moodSelected");
  if (mood === "bad") moodButtons.bad?.classList.add("moodSelected");

  moodStatusEl.textContent = "Checked in ✅";
  loadForSelectedDate();
}

moodButtons.good?.addEventListener("click", () => setMood("good"));
moodButtons.ok?.addEventListener("click", () => setMood("ok"));
moodButtons.bad?.addEventListener("click", () => setMood("bad"));

/* -------------------------
   Feed rendering (no blinking)
------------------------- */
let lastRenderKey = "";

async function loadForSelectedDate() {
  try {
    const { start, end } = isoToStartEnd(SELECTED_DATE);

    const memRes = await supa
      .from("memories")
      .select("*")
      .eq("room_code", room)
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false })
      .limit(200);

    if (memRes.error) throw memRes.error;
    const memories = memRes.data || [];

    const chkRes = await supa
      .from("checkins")
      .select("*")
      .eq("room_code", room)
      .eq("checkin_date", SELECTED_DATE)
      .order("created_at", { ascending: false })
      .limit(200);

    if (chkRes.error) throw chkRes.error;
    const checkins = chkRes.data || [];

    const memoryIds = memories.map(m => m.id);
    let reactions = [];
    if (memoryIds.length) {
      const reactRes = await supa
        .from("reactions")
        .select("*")
        .eq("room_code", room)
        .in("memory_id", memoryIds)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (reactRes.error) throw reactRes.error;
      reactions = reactRes.data || [];
    }

    const reactionsByMemory = {};
    for (const r of reactions) {
      const memId = String(r.memory_id);
      if (!reactionsByMemory[memId]) reactionsByMemory[memId] = { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };
      if (reactionsByMemory[memId][r.emoji] !== undefined) reactionsByMemory[memId][r.emoji] += 1;
      reactionsByMemory[memId].total += 1;
    }

    // KPIs + vibe
    const { counts, vibe } = summarizeMood(checkins);
    kpiMemoriesEl && (kpiMemoriesEl.textContent = String(memories.length));
    kpiCheckinsEl && (kpiCheckinsEl.textContent = String(checkins.length));
    kpiMoodEl && (kpiMoodEl.textContent = vibe);
    kpiReactsEl && (kpiReactsEl.textContent = String(reactions.length));

    const badCount = checkins.filter(c => c.mood === "bad").length;
    const scoreRaw = (memories.length * 12) + (reactions.length * 3) + (checkins.length * 8) - (badCount * 12);
    const score = Math.max(0, Math.min(100, scoreRaw));
    setVibeBar(score, vibe);

    updateMoodBoard(checkins);

    // No-blink feed
    const renderKey = memories
      .map(m => `${m.id}|${m.created_at}|${reactionsByMemory[String(m.id)]?.total || 0}`)
      .join("||");

    if (renderKey !== lastRenderKey) {
      lastRenderKey = renderKey;

      listEl && (listEl.innerHTML = memories.map(m => {
        const rx = reactionsByMemory[String(m.id)] || { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };
        return `
          <div class="memoryCard">
            <b>${escapeHtml(m.name)}</b>
            <small> — ${escapeHtml(fmtLocal(m.created_at))}</small>
            <div style="margin-top:6px;">${escapeHtml(m.moment)}</div>

            <div class="memoryCardActions">
              <button class="reactBtn" data-mid="${m.id}" data-emo="❤️" type="button">❤️ ${rx["❤️"]}</button>
              <button class="reactBtn" data-mid="${m.id}" data-emo="😂" type="button">😂 ${rx["😂"]}</button>
              <button class="reactBtn" data-mid="${m.id}" data-emo="⭐" type="button">⭐ ${rx["⭐"]}</button>
            </div>
          </div>
        `;
      }).join(""));
    }

    debug(`✅ Loaded ${SELECTED_DATE} | memories ${memories.length} | checkins ${checkins.length}`);
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

/* -------------------------
   Boot
------------------------- */
updateReadOnlyUI();
debug("✅ Booting…");
loadForSelectedDate();
setInterval(loadForSelectedDate, 6000);
