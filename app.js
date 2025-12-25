// ==========================
// Holiday Harmony — app.js (Password Gate + History + Cozy UI)
// Project: ubthnjsdxuhjyjnrxube (ONE project for DB + Edge Function + RLS)
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
   ✅ CONFIG — PASTE YOUR REAL ANON KEY
------------------------- */
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

// Edge Function is in SAME project now:
const FUNCTION_LOGIN_URL =
  "https://ubthnjsdxuhjyjnrxube.supabase.co/functions/v1/room-login";

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

// Share link pill
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

const defuseBtn = document.getElementById("defuseBtn");
const choreBtn = document.getElementById("choreBtn");
const pauseBtn = document.getElementById("pauseBtn");
const activityBtn = document.getElementById("activityBtn");
const defuseOut = document.getElementById("defuseOut");
const activityOut = document.getElementById("activityOut");

const awardsOut = document.getElementById("awardsOut");
const tipsOut = document.getElementById("tipsOut");
const recapOut = document.getElementById("recapOut");

const soundToggle = document.getElementById("soundToggle");
const partyBtn = document.getElementById("partyBtn");

const missionOut = document.getElementById("missionOut");
const missionDoneBtn = document.getElementById("missionDoneBtn");
const missionNewBtn = document.getElementById("missionNewBtn");

const vibeWrapEl = document.getElementById("vibeWrap");
const vibeBarEl = document.getElementById("vibeBar");

const langBtn = document.getElementById("langBtn");

const motdOut = document.getElementById("motdOut");

const pauseBanner = document.getElementById("pauseBanner");

const recapBtn = document.getElementById("recapBtn");
const modalBack = document.getElementById("modalBack");
const closeRecapBtn = document.getElementById("closeRecapBtn");
const recapModalKpis = document.getElementById("recapModalKpis");
const recapModalMotd = document.getElementById("recapModalMotd");
const recapModalAwards = document.getElementById("recapModalAwards");

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
   Identity: saved name + device id
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
   Language toggle (basic; keeps your previous behavior)
------------------------- */
const i18n = {
  en: {
    viewOnly: "🔒 View only: you’re looking at a past day. Posting/check-in works only for today.",
    viewOk: "",
    pleaseName: "Please enter your name first 🙂",
    saving: "Saving…",
    checkedIn: "Checked in ✅",
    posted: "Posted ✅",
    fillNameMoment: "Please fill your name + the moment.",
    motdEmpty: "No memories for that day yet ✨",
    awardsNone: "No awards for that day yet.",
    vibeNoCheckins: "No check-ins",
    vibeCalm: "😇 Calm",
    vibeOkay: "😐 Okay",
    vibeOver: "😤 Overloaded",
    pauseTitle: "🧘 Pause time",
    pauseText: "10 minutes. Tea/water. No heavy topics. Same team.",
    pauseRemaining: "Remaining",
  },
  ru: {
    viewOnly: "🔒 Просмотр: выбран прошлый день. Публикация и чек-ин доступны только сегодня.",
    viewOk: "",
    pleaseName: "Сначала введите имя 🙂",
    saving: "Сохраняю…",
    checkedIn: "Отмечено ✅",
    posted: "Добавлено ✅",
    fillNameMoment: "Введите имя и текст момента.",
    motdEmpty: "За этот день пока нет моментов ✨",
    awardsNone: "За этот день наград пока нет.",
    vibeNoCheckins: "Нет чек-инов",
    vibeCalm: "😇 Спокойно",
    vibeOkay: "😐 Норм",
    vibeOver: "😤 Перегруз",
    pauseTitle: "🧘 Пауза",
    pauseText: "10 минут. Чай/вода. Без тяжёлых тем. Мы одна команда.",
    pauseRemaining: "Осталось",
  }
};

function getLang() { return localStorage.getItem("hh_lang") || "en"; }
function setLang(v) { localStorage.setItem("hh_lang", v); }
let LANG = getLang();
function t(key) { return (i18n[LANG] && i18n[LANG][key]) || i18n.en[key] || key; }

langBtn?.addEventListener("click", () => {
  playSound("tap");
  LANG = (LANG === "en") ? "ru" : "en";
  setLang(LANG);
  updateReadOnlyUI();
  loadForSelectedDate();
});

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
  const lockMsg = isToday ? t("viewOk") : t("viewOnly");
  if (historyStatusEl) historyStatusEl.innerHTML = lockMsg ? `<small>${escapeHtml(lockMsg)}</small>` : "";

  const disable = !isToday;
  document.getElementById("postBtn")?.toggleAttribute("disabled", disable);
  document.getElementById("moodGood")?.toggleAttribute("disabled", disable);
  document.getElementById("moodOk")?.toggleAttribute("disabled", disable);
  document.getElementById("moodBad")?.toggleAttribute("disabled", disable);
  pauseBtn?.toggleAttribute("disabled", disable);
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

let ambienceAudio = null;
partyBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!ambienceAudio) {
    ambienceAudio = new Audio("assets/sounds/ambience.mp3");
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.9; // loud
  }
  if (!soundOn()) { ambienceAudio.pause(); return; }
  if (ambienceAudio.paused) ambienceAudio.play().catch(() => {});
  else ambienceAudio.pause();
});
soundToggle?.addEventListener("change", () => {
  if (!soundOn() && ambienceAudio) ambienceAudio.pause();
});

/* -------------------------
   Supabase client (password gate)
------------------------- */
let supa = null;

async function roomLogin(room_code) {
  const password = prompt("Room password:");
  if (!password) throw new Error("No password provided");

  const res = await fetch(FUNCTION_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code, password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Login failed");

  localStorage.setItem("hh_room_token_" + room_code, json.token);
  return json.token;
}

function makeClient(token) {
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function initSupabaseClient() {
  let token = localStorage.getItem("hh_room_token_" + room);

  if (!token) {
    token = await roomLogin(room);
  }

  return makeClient(token);
}

/* -------------------------
   Vibe bar
------------------------- */
let lastVibePercent = null;

function pulseVibe() {
  if (!vibeWrapEl) return;
  vibeWrapEl.classList.remove("vibePulse");
  void vibeWrapEl.offsetWidth; // restart animation
  vibeWrapEl.classList.add("vibePulse");
}

function setVibeBar(percent, vibeText) {
  if (!vibeBarEl) return;
  const p = Math.max(0, Math.min(100, percent));
  vibeBarEl.style.width = p + "%";

  // Simple color by vibe label
  if (String(vibeText).includes("Перегруз") || String(vibeText).includes("Overloaded")) {
    vibeBarEl.style.background = "linear-gradient(90deg, #ffb3b3, #ffd1d1)";
  } else if (String(vibeText).includes("Спокой") || String(vibeText).includes("Calm")) {
    vibeBarEl.style.background = "linear-gradient(90deg, #b8f0d0, #d6ffe9)";
  } else {
    vibeBarEl.style.background = "linear-gradient(90deg, #ffe7b3, #fff2d6)";
  }
  vibeBarEl.style.backgroundSize = "200% 100%";

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
  let vibe = t("vibeNoCheckins");
  if (checkins.length > 0) {
    if (counts.bad >= Math.max(counts.good, counts.ok)) vibe = t("vibeOver");
    else if (counts.good >= Math.max(counts.ok, counts.bad)) vibe = t("vibeCalm");
    else vibe = t("vibeOkay");
  }
  return { counts, vibe };
}

/* -------------------------
   Reactions (toggle)
------------------------- */
async function toggleReaction(memoryIdRaw, emoji) {
  const memIdNum = Number(memoryIdRaw);
  if (!Number.isFinite(memIdNum)) return;

  playSound("tap");

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

  playSound("success");
  loadForSelectedDate();
}

listEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".reactBtn");
  if (!btn) return;
  await toggleReaction(btn.getAttribute("data-mid"), btn.getAttribute("data-emo"));
});

/* -------------------------
   Pause banner (today only)
------------------------- */
function msToMmSs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

async function sendPause() {
  if (!viewingToday()) return;
  playSound("tap");

  const { error } = await supa.from("signals").insert([{
    room_code: room, type: "pause", payload: "10m"
  }]);
  if (error) { alert("Pause error: " + error.message); return; }

  playSound("success");
  loadForSelectedDate();
}

pauseBtn?.addEventListener("click", sendPause);

function renderPauseBanner(latestPauseSignal) {
  if (!pauseBanner) return;

  if (!latestPauseSignal) { pauseBanner.style.display = "none"; return; }

  const created = new Date(latestPauseSignal.created_at).getTime();
  const now = Date.now();
  const durationMs = 10 * 60 * 1000;
  const end = created + durationMs;

  if (now >= end) { pauseBanner.style.display = "none"; return; }

  const remaining = end - now;
  pauseBanner.style.display = "block";
  pauseBanner.innerHTML = `
    <b>${escapeHtml(t("pauseTitle"))}</b><br>
    ${escapeHtml(t("pauseText"))}<br>
    <small>${escapeHtml(t("pauseRemaining"))}: <b>${escapeHtml(msToMmSs(remaining))}</b></small>
  `;
}

/* -------------------------
   Post memory + Mood check-in (today only)
------------------------- */
async function postMemory() {
  if (!viewingToday()) return;

  const name = (nameEl.value || "").trim();
  let moment = (momentEl.value || "").trim();
  const tag = (tagSelect?.value || "").trim();

  if (!name || !moment) { statusEl.textContent = t("fillNameMoment"); return; }

  if (tag) moment = `${tag} ${moment}`;

  playSound("tap");
  const { error } = await supa.from("memories").insert([{ room_code: room, name, moment }]);
  if (error) { statusEl.textContent = "Error: " + error.message; return; }

  momentEl.value = "";
  statusEl.textContent = t("posted");
  playSound("success");
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
  if (!name) { moodStatusEl.textContent = t("pleaseName"); return; }

  moodStatusEl.textContent = t("saving");
  playSound("tap");

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

  moodStatusEl.textContent = t("checkedIn");
  playSound("success");
  loadForSelectedDate();
}

moodButtons.good?.addEventListener("click", () => setMood("good"));
moodButtons.ok?.addEventListener("click", () => setMood("ok"));
moodButtons.bad?.addEventListener("click", () => setMood("bad"));

/* -------------------------
   Recap modal
------------------------- */
recapBtn?.addEventListener("click", () => { playSound("tap"); modalBack.style.display = "flex"; });
closeRecapBtn?.addEventListener("click", () => { modalBack.style.display = "none"; });
modalBack?.addEventListener("click", (e) => { if (e.target === modalBack) modalBack.style.display = "none"; });

/* -------------------------
   Feed rendering (no blinking)
------------------------- */
let lastRenderKey = "";

function updateMoodBoard(checkins) {
  if (!moodBoardEl) return;
  if (checkins.length === 0) {
    moodBoardEl.innerHTML = `<small>${escapeHtml(LANG === "ru" ? "Пока нет чек-инов." : "No check-ins.")}</small>`;
    return;
  }

  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";

  moodBoardEl.innerHTML = `
    <b style="display:block; margin-bottom:8px;">🧾 ${escapeHtml(LANG==="ru" ? "Настроение" : "Mood Board")}</b>
    ${checkins
      .sort((a,b) => a.name.localeCompare(b.name))
      .map(c => `
        <div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
          <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)}
        </div>
      `).join("")}
  `;
}

function renderAwards(memories, reactionsByMemory) {
  if (!awardsOut) return;

  const byName = {};
  for (const m of memories) byName[m.name] = (byName[m.name] || 0) + 1;
  const top = Object.entries(byName).sort((a,b)=>b[1]-a[1])[0];

  let topMemory = null;
  for (const m of memories) {
    const cnt = reactionsByMemory[String(m.id)]?.total || 0;
    if (!topMemory || cnt > topMemory.cnt) topMemory = { cnt, name: m.name };
  }

  const awards = [];
  if (top) awards.push(`✨ <b>${LANG==="ru" ? "Хранитель моментов" : "Memory Maker"}</b>: ${escapeHtml(top[0])} (${top[1]})`);
  if (topMemory && topMemory.cnt > 0) awards.push(`⭐ <b>${LANG==="ru" ? "Самый любимый момент" : "Most Loved Moment"}</b>: ${escapeHtml(topMemory.name)} (${topMemory.cnt})`);

  awardsOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      ${awards.length ? awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("") : `<small>${escapeHtml(t("awardsNone"))}</small>`}
    </div>`;
}

function renderMOTD(memories, reactionsByMemory) {
  if (!motdOut) return null;

  if (!memories.length) {
    motdOut.innerHTML = `<small>${escapeHtml(t("motdEmpty"))}</small>`;
    return null;
  }
  let best = null;
  for (const m of memories) {
    const rx = reactionsByMemory[String(m.id)]?.total || 0;
    if (!best || rx > best.rx || (rx === best.rx && new Date(m.created_at) > new Date(best.created_at))) {
      best = { ...m, rx };
    }
  }
  motdOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>${escapeHtml(best.name)}</b>
      <small> — ${escapeHtml(fmtLocal(best.created_at))}</small>
      <div style="margin-top:6px;">${escapeHtml(best.moment)}</div>
      <div style="margin-top:10px;"><b>⭐</b> ${best.rx} ${LANG==="ru" ? "реакций" : "reactions"}</div>
    </div>
  `;
  return best;
}

function updateDashboard(memoriesCount, checkins, reactionsCount) {
  const { counts, vibe } = summarizeMood(checkins);

  kpiMemoriesEl && (kpiMemoriesEl.textContent = String(memoriesCount));
  kpiCheckinsEl && (kpiCheckinsEl.textContent = String(checkins.length));
  kpiMoodEl && (kpiMoodEl.textContent = vibe);
  kpiReactsEl && (kpiReactsEl.textContent = String(reactionsCount));

  // score 0..100
  const badCount = checkins.filter(c => c.mood === "bad").length;
  const scoreRaw = (memoriesCount * 12) + (reactionsCount * 3) + (checkins.length * 8) - (badCount * 12);
  const score = Math.max(0, Math.min(100, scoreRaw));
  setVibeBar(score, vibe);

  if (recapOut) {
    recapOut.innerHTML = `
      <b>${escapeHtml(LANG==="ru" ? "Итог:" : "Recap:")}</b><br>
      • ${escapeHtml(LANG==="ru" ? "Моменты" : "Memories")}: <b>${memoriesCount}</b> • ${escapeHtml(LANG==="ru" ? "Реакции" : "Reactions")}: <b>${reactionsCount}</b><br>
      • ${escapeHtml(LANG==="ru" ? "Чек-ины" : "Check-ins")}: 😇 <b>${counts.good}</b> / 😐 <b>${counts.ok}</b> / 😤 <b>${counts.bad}</b><br>
      <small>${escapeHtml(LANG==="ru" ? "Шкала вайба… подозрительно точная 😄" : "The vibe meter is… suspiciously accurate 😄")}</small>
    `;
  }
}

/* -------------------------
   Main loader for selected date
------------------------- */
async function loadForSelectedDate() {
  if (!supa) return;

  try {
    const { start, end } = isoToStartEnd(SELECTED_DATE);

    // Memories
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

    // Checkins
    const chkRes = await supa
      .from("checkins")
      .select("*")
      .eq("room_code", room)
      .eq("checkin_date", SELECTED_DATE)
      .order("created_at", { ascending: false })
      .limit(200);

    if (chkRes.error) throw chkRes.error;
    const checkins = chkRes.data || [];

    // Reactions for those memory IDs
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

    // Pause signals (only when viewing today)
    let pauseSignal = null;
    if (viewingToday()) {
      const sigRes = await supa
        .from("signals")
        .select("*")
        .eq("room_code", room)
        .eq("type", "pause")
        .order("created_at", { ascending: false })
        .limit(1);
      if (sigRes.error) throw sigRes.error;
      pauseSignal = (sigRes.data && sigRes.data[0]) ? sigRes.data[0] : null;
    }

    // Count reactions per memory
    const reactionsByMemory = {};
    for (const r of reactions) {
      const memId = String(r.memory_id);
      if (!reactionsByMemory[memId]) reactionsByMemory[memId] = { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };
      if (reactionsByMemory[memId][r.emoji] !== undefined) reactionsByMemory[memId][r.emoji] += 1;
      reactionsByMemory[memId].total += 1;
    }

    updateDashboard(memories.length, checkins, reactions.length);
    updateMoodBoard(checkins);
    renderAwards(memories, reactionsByMemory);

    const motd = renderMOTD(memories, reactionsByMemory);

    // Modal content
    recapModalKpis && (recapModalKpis.innerHTML = recapOut ? recapOut.innerHTML : "");
    recapModalMotd && (recapModalMotd.innerHTML = motdOut ? motdOut.innerHTML : "");
    recapModalAwards && (recapModalAwards.innerHTML = awardsOut ? awardsOut.innerHTML : "");

    renderPauseBanner(pauseSignal);

    // Render feed only if it changed (prevents blinking)
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

    debug(`✅ Loaded ${SELECTED_DATE}`);
  } catch (err) {
    // If token expired or RLS blocks, force re-login once
    const msg = err?.message || String(err);
    debug("❌ Load error: " + msg);

    if (msg.toLowerCase().includes("jwt") || msg.toLowerCase().includes("permission")) {
      // clear and reload to re-prompt
      localStorage.removeItem("hh_room_token_" + room);
      // avoid infinite loop: show message, then reload
      alert("Session expired / locked. Please enter room password again.");
      location.reload();
    }
  }
}

/* -------------------------
   Boot
------------------------- */
(async () => {
  try {
    updateReadOnlyUI();
    debug("🔐 Connecting…");

    supa = await initSupabaseClient();

    debug("✅ Authenticated. Booting…");
    loadForSelectedDate();
    setInterval(loadForSelectedDate, 6000);
  } catch (e) {
    debug("❌ Boot failed: " + (e?.message || e));
  }
})();
