// ==========================
// Holiday Harmony — app.js
// Keeps: memories + reactions + mood + dashboard + pause + recap + export + bingo + chores/activities/defuse + EN/RU
// Adds: Movie Night (TMDB trending + shared Supabase votes)
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

// ✅ PASTE REAL VALUES (Supabase)
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

// ✅ TMDB key (free)
const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjMmI3MGFmMmIyYTljNjczYjE0YmQyY2YxYmE4ZTBmMyIsIm5iZiI6MTc2NjY4MTAzNS4xOTI5OTk4LCJzdWIiOiI2OTRkNjljYmE2ZTY3NWZhNWEyZmI0NTQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.mZeoFP55YcDkM7t71gySOBxQiIrUYg2B2lA-Sn4SZ1Q";

const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);

// ---- room
const params = new URLSearchParams(location.search);
const room = (params.get("room") || "").trim();
if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}
document.getElementById("roomLabel").textContent = room;

// ---- share link
const shareLink = document.getElementById("shareLink");
const base = location.href.substring(0, location.href.lastIndexOf("/") + 1);
shareLink.textContent = `Share: ${base}room.html?room=${encodeURIComponent(room)}`;

// ---- DOM
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
const defuseOut = document.getElementById("defuseOut");
const activityOut = document.getElementById("activityOut");

const awardsOut = document.getElementById("awardsOut");
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

const exportBtn = document.getElementById("exportBtn");

// Bingo
const bingoOut = document.getElementById("bingoOut");

// Movie Night
const movieGridEl = document.getElementById("movieGrid");
const movieTopPickEl = document.getElementById("movieTopPick");
const movieStatusEl = document.getElementById("movieStatus");
const movieReloadBtn = document.getElementById("movieReloadBtn");
const movieExportBtn = document.getElementById("movieExportBtn");

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
function isSameLocalDay(isoOrTs) {
  const d = new Date(isoOrTs);
  return d.toDateString() === new Date().toDateString();
}
function fmtLocal(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}
function msToMmSs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2,"0");
  const ss = String(s % 60).padStart(2,"0");
  return `${mm}:${ss}`;
}

// ---- sounds
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
  tryPlayAudio(src, { volume: 0.95 });
}

// ---- ambience (LOUD)
let ambienceAudio = null;
partyBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!ambienceAudio) {
    ambienceAudio = new Audio("assets/sounds/ambience.mp3");
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.95;
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

// ---- device id (for reactions + movie votes)
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
// Language (EN/RU)
// ==========================
const i18n = {
  en: {
    soundLabel:"🔊 Sound",
    motdTitle:"⭐ Memory of the Day",
    motdHint:"Most loved memory today (by reactions).",
    recapBtn:"📸 Recap",
    recapTitle:"📸 Today’s Recap",
    recapHowto:"How to share:",
    recapHowtoText:"Take a screenshot and send it to the family chat 🙂",
    recapFooterHint:"Tip: open this screen on a phone for the best screenshot.",

    pauseBtn:"🧘 I need a pause",
    pauseBannerTitle:"🧘 Pause time",
    pauseBannerText:"10 minutes. Tea/water. No heavy topics. We’re on the same team.",
    pauseRemaining:"Remaining",

    tagNone:"(no tag)",
    post:"Post memory",

    pleaseName:"Please enter your name first 🙂",
    saving:"Saving…",
    checkedIn:"Checked in ✅",
    posted:"Posted ✅",
    fillNameMoment:"Please fill your name + the moment.",

    vibeNoCheckins:"No check-ins yet",
    vibeCalm:"😇 Calm",
    vibeOkay:"😐 Okay",
    vibeOver:"😤 Overloaded",

    cozyStart:"🙂 Cozy start",
    goodVibes:"🙂 Good vibes",
    greatDay:"😄 Great day together",
    gentleReset:"🧯 Gentle reset",

    cozyNote:"Post one happy moment (even a tiny one).",
    goodNote:"Nice. The warm timeline is growing.",
    greatNote:"Food, laughs, and a little rest. Perfect.",
    resetNote:"Tea/walk mode can save the evening.",

    recapTitleInline:"Today recap:",
    recapMem:"Memories",
    recapReact:"Reactions",
    recapCheck:"Check-ins",
    recapFooter:"Vibe meter is… surprisingly accurate 😄",

    moodBoardEmpty:"No one checked in yet. Want to start? 🙂",
    awardsNone:"No awards yet.",
    motdEmpty:"No memories yet today. Add the first warm moment ✨",

    movieTitle:"🍿 Movie Night (Vote)",
    movieHint:"Tap 👍 to vote. Tap again to unvote. Everyone sees the same winner.",
    movieTop:"Top pick tonight:",
    movieNoKey:"TMDB key not set yet (paste it in app.js).",
    movieLoading:"Loading trending movies…",
    movieVotes:"votes",
    movieYouVoted:"You voted",
    movieExport:"Movie Night Card copied to clipboard ✅"
  },
  ru: {
    soundLabel:"🔊 Звук",
    motdTitle:"⭐ Момент дня",
    motdHint:"Самый любимый момент сегодня (по реакциям).",
    recapBtn:"📸 Итог",
    recapTitle:"📸 Итог дня",
    recapHowto:"Как поделиться:",
    recapHowtoText:"Сделайте скриншот и отправьте в семейный чат 🙂",
    recapFooterHint:"Подсказка: на телефоне скрин получается лучше.",

    pauseBtn:"🧘 Нужна пауза",
    pauseBannerTitle:"🧘 Пауза",
    pauseBannerText:"10 минут. Чай/вода. Без тяжёлых тем. Мы одна команда.",
    pauseRemaining:"Осталось",

    tagNone:"(без тега)",
    post:"Добавить момент",

    pleaseName:"Сначала введите имя 🙂",
    saving:"Сохраняю…",
    checkedIn:"Отмечено ✅",
    posted:"Добавлено ✅",
    fillNameMoment:"Введите имя и текст момента.",

    vibeNoCheckins:"Пока нет чек-инов",
    vibeCalm:"😇 Спокойно",
    vibeOkay:"😐 Норм",
    vibeOver:"😤 Перегруз",

    cozyStart:"🙂 Разогреваемся",
    goodVibes:"🙂 Хороший вайб",
    greatDay:"😄 Прям тепло пошло",
    gentleReset:"🧯 Нужна мягкая пауза",

    cozyNote:"Добавьте один тёплый момент (даже маленький).",
    goodNote:"Класс. Лента тепла растёт.",
    greatNote:"Еда, смех и чуть отдыха — идеально.",
    resetNote:"Чай/прогулка часто спасают вечер.",

    recapTitleInline:"Итог дня:",
    recapMem:"Моменты",
    recapReact:"Реакции",
    recapCheck:"Чек-ины",
    recapFooter:"Шкала вайба… подозрительно точная 😄",

    moodBoardEmpty:"Пока никто не отметился. Начнём? 🙂",
    awardsNone:"Пока нет наград.",
    motdEmpty:"Сегодня ещё нет моментов. Добавьте первый тёплый момент ✨",

    movieTitle:"🍿 Кино-вечер (голосуем)",
    movieHint:"Жми 👍 чтобы голосовать. Жми ещё раз — убрать голос. Победителя видят все.",
    movieTop:"Лидер вечера:",
    movieNoKey:"TMDB ключ не задан (вставь в app.js).",
    movieLoading:"Загружаю тренды…",
    movieVotes:"голосов",
    movieYouVoted:"Твой голос",
    movieExport:"Карточка кино-вечера скопирована ✅"
  }
};

function getLang(){ return localStorage.getItem("hh_lang") || "en"; }
function setLang(v){ localStorage.setItem("hh_lang", v); }
let LANG = getLang();
function t(key){ return (i18n[LANG] && i18n[LANG][key]) || i18n.en[key] || key; }

function applyLanguage(){
  document.getElementById("soundLabel").textContent = t("soundLabel");
  document.getElementById("motdTitle").textContent = t("motdTitle");
  document.getElementById("motdHint").textContent = t("motdHint");
  recapBtn.textContent = t("recapBtn");
  document.getElementById("recapTitle").textContent = t("recapTitle");
  document.getElementById("recapHowto").textContent = t("recapHowto");
  document.getElementById("recapHowtoText").textContent = t("recapHowtoText");
  document.getElementById("recapFooterHint").textContent = t("recapFooterHint");

  pauseBtn.textContent = t("pauseBtn");
  document.getElementById("postBtn").textContent = t("post");

  // tags
  const opts = tagSelect?.options;
  if (opts && opts[0]) opts[0].textContent = t("tagNone");

  // movie
  const movieTitle = document.getElementById("movieTitle");
  const movieHint = document.getElementById("movieHint");
  if (movieTitle) movieTitle.textContent = t("movieTitle");
  if (movieHint) movieHint.textContent = t("movieHint");

  renderMission();
  loadAll();
}
langBtn?.addEventListener("click", () => {
  playSound("tap");
  LANG = (LANG === "en") ? "ru" : "en";
  setLang(LANG);
  applyLanguage();
});

// ==========================
// Pools (EN/RU)
// ==========================
function pools() {
  if (LANG === "ru") {
    return {
      missions: [
        "Скажите один искренний комплимент сегодня.",
        "Чай-пауза: 15 минут без «разборов полётов».",
        "5 минут — быстро навести порядок под музыку.",
        "Спросите: «Что было лучшим сегодня?»",
        "Сделайте одно маленькое доброе дело молча 😄",
        "10 минут прогулки вместе (без тяжёлых тем).",
      ],
      activities: [
        "«Две правды и одна ложь» — по кругу",
        "Выбор фильма: каждый предлагает один вариант, потом голосуем",
        "10 минут прогулки (без тяжёлых тем)",
        "Чай + сладкое: каждый говорит одно хорошее за день",
        "Пазл/настолка на 20 минут",
      ],
      defuse: [
        "Пауза: 3 медленных вдоха. Потом — мягче голос 🙂",
        "Сменить сцену: чай/прогулка на 10 минут.",
        "Круг комплиментов: по одному искреннему предложению.",
        "Мирная взятка: принесите перекус. Перекус решает многое.",
      ],
      chores: [
        "Ты моешь посуду 🫧",
        "Ты вытираешь посуду 🍽️",
        "Ты накрываешь на стол 🧂",
        "Ты делаешь чай ☕",
        "Ты 5 минут убираешься 🧹",
        "Ты отдыхаешь — заслужил(а) 😌",
      ]
    };
  }

  return {
    missions: [
      "Say one sincere compliment to someone today.",
      "Tea break: 15 minutes with no problem-solving.",
      "5-minute tidy sprint with music.",
      "Ask someone: ‘What was the best part of your day?’",
      "Do one small helpful thing without announcing it 😄",
      "Take a 10-minute walk together (no heavy topics).",
    ],
    activities: [
      "2 Truths and a Lie (one round each)",
      "Pick a movie: everyone suggests 1 title, then vote",
      "10-minute walk together (no big topics — just fresh air 😄)",
      "Tea + dessert: each person says one good thing from today",
      "Puzzle/board game for 20 minutes",
    ],
    defuse: [
      "Reset moment: 3 slow breaths. Then softer voices. 🙂",
      "Switch scene: tea, a short walk, or a cozy activity. Keep it light for 10 minutes.",
      "Compliment round: one sincere sentence each.",
      "Peace offering: bring a snack. Snacks solve many mysteries.",
    ],
    chores: [
      "You wash dishes 🫧",
      "You dry dishes 🍽️",
      "You set the table 🧂",
      "You make tea ☕",
      "You do a 5-minute tidy sprint 🧹",
      "You rest — you earned it 😌",
    ]
  };
}

// ==========================
// Mission (local)
// ==========================
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
function getTodaysMissionIndex(list) {
  const baseSeed = `${room}|${todayISODate()}`;
  return hashStringToInt(baseSeed) % list.length;
}
function renderMission() {
  const { missions } = pools();
  const override = localStorage.getItem(myMissionOverrideKey());
  const idx = override ? Number(override) : getTodaysMissionIndex(missions);
  const mission = missions[(Number.isFinite(idx) ? idx : 0) % missions.length];
  const done = localStorage.getItem(missionDoneKey()) === "1";
  missionOut.innerHTML = `<b>${escapeHtml(mission)}</b><br><small>${done ? "✅" : ""}</small>`;
}
missionDoneBtn?.addEventListener("click", () => {
  playSound("tap");
  const name = (nameEl.value || "").trim();
  if (!name) return alert(t("pleaseName"));
  localStorage.setItem(missionDoneKey(), "1");
  renderMission();
  playSound("success");
});
missionNewBtn?.addEventListener("click", () => {
  playSound("tap");
  const { missions } = pools();
  localStorage.setItem(myMissionOverrideKey(), String(Math.floor(Math.random() * missions.length)));
  renderMission();
  playSound("success");
});
renderMission();

// ==========================
// Activity / Reset / Chores
// ==========================
document.getElementById("activityBtn")?.addEventListener("click", () => {
  playSound("tap");
  const { activities } = pools();
  const pick = activities[Math.floor(Math.random() * activities.length)];
  activityOut.innerHTML = `<div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;"><b>${escapeHtml(pick)}</b></div>`;
});
defuseBtn?.addEventListener("click", () => {
  playSound("tap");
  const { defuse } = pools();
  const pick = defuse[Math.floor(Math.random() * defuse.length)];
  defuseOut.innerHTML = `<div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;"><b>${escapeHtml(pick)}</b></div>`;
});
choreBtn?.addEventListener("click", () => {
  playSound("tap");
  const { chores } = pools();
  const pick = chores[Math.floor(Math.random() * chores.length)];
  defuseOut.innerHTML = `<div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;"><b>${escapeHtml(pick)}</b></div>`;
});

// ==========================
// Pause (shared via Supabase signals)
// ==========================
async function sendPause() {
  playSound("tap");
  const { error } = await supa.from("signals").insert([{
    room_code: room,
    type: "pause",
    payload: "10m"
  }]);
  if (error) {
    alert("Pause error: " + error.message);
    return;
  }
  playSound("success");
  await loadAll();
}
pauseBtn?.addEventListener("click", () => sendPause());

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
// Reactions (memories)
// ==========================
async function toggleReaction(memoryIdRaw, emoji) {
  const name = ((nameEl.value || getSavedName()) || "Someone").trim();
  const memIdNum = Number(memoryIdRaw);
  if (!Number.isFinite(memIdNum)) {
    alert("Bad memory id: " + memoryIdRaw);
    return;
  }
  playSound("tap");

  const { data: existing, error: selErr } = await supa
    .from("reactions")
    .select("id")
    .eq("room_code", room)
    .eq("memory_id", memIdNum)
    .eq("emoji", emoji)
    .eq("device_id", DEVICE_ID)
    .limit(1);

  if (selErr) { alert("Reaction select error:\n" + selErr.message); return; }

  if (existing && existing.length) {
    const { error: delErr } = await supa.from("reactions").delete().eq("id", existing[0].id);
    if (delErr) { alert("Reaction delete error:\n" + delErr.message); return; }
  } else {
    const { error: insErr } = await supa.from("reactions").insert([{
      room_code: room, memory_id: memIdNum, emoji, name, device_id: DEVICE_ID
    }]);
    if (insErr) { alert("Reaction insert error:\n" + insErr.message); return; }
  }

  playSound("success");
  await loadAll();
}
listEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".reactBtn");
  if (!btn) return;
  await toggleReaction(btn.getAttribute("data-mid"), btn.getAttribute("data-emo"));
});

// ==========================
// Post memory (with TAG prefix)
// ==========================
async function postMemory() {
  statusEl.textContent = "";
  const name = (nameEl.value || "").trim();
  let moment = (momentEl.value || "").trim();
  const tag = (tagSelect.value || "").trim();

  if (!name || !moment) {
    statusEl.textContent = t("fillNameMoment");
    return;
  }
  if (tag) moment = `${tag} ${moment}`;

  playSound("tap");
  const { error } = await supa.from("memories").insert([{ room_code: room, name, moment }]);

  if (error) {
    statusEl.textContent = "Error: " + error.message;
    return;
  }

  momentEl.value = "";
  statusEl.textContent = t("posted");
  playSound("success");
  await loadAll();
}
document.getElementById("postBtn")?.addEventListener("click", postMemory);

// ==========================
// Vibe bar + pulse
// ==========================
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

// ==========================
// Dashboard + awards + MOTD + pause banner
// ==========================
function pickRandom(arr, count = 3) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < count) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}
function summarizeMood(checkinsToday) {
  const counts = { good: 0, ok: 0, bad: 0 };
  for (const c of checkinsToday) if (counts[c.mood] !== undefined) counts[c.mood]++;
  let vibe = t("vibeNoCheckins");
  if (checkinsToday.length > 0) {
    if (counts.bad >= Math.max(counts.good, counts.ok)) vibe = t("vibeOver");
    else if (counts.good >= Math.max(counts.ok, counts.bad)) vibe = t("vibeCalm");
    else vibe = t("vibeOkay");
  }
  return { counts, vibe };
}
function updateMoodBoard(checkinsToday) {
  if (!moodBoardEl) return;
  if (checkinsToday.length === 0) {
    moodBoardEl.innerHTML = `<small>${escapeHtml(t("moodBoardEmpty"))}</small>`;
    return;
  }
  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";
  moodBoardEl.innerHTML = `
    <b style="display:block; margin-bottom:8px;">🧾 ${escapeHtml(LANG==="ru" ? "Доска настроения" : "Today’s Mood Board")}</b>
    ${checkinsToday
      .sort((a,b) => a.name.localeCompare(b.name))
      .map(c => `
        <div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
          <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)}
        </div>
      `).join("")}
  `;
}
function updateAwards(memories, reactionsByMemory) {
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
  const awardName = (en, ru) => LANG === "ru" ? ru : en;

  if (top) awards.push(`✨ <b>${awardName("Memory Maker", "Хранитель моментов")}</b>: ${escapeHtml(top[0])} (${top[1]})`);
  if (topMemory && topMemory.cnt > 0) awards.push(`⭐ <b>${awardName("Most Loved Moment", "Самый любимый момент")}</b>: ${escapeHtml(topMemory.name)} (${topMemory.cnt})`);

  awardsOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      ${awards.length ? awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("") : `<small>${escapeHtml(t("awardsNone"))}</small>`}
    </div>`;
}
function updateDashboard(memoriesTodayCount, checkinsToday, reactionsTodayCount) {
  const { counts, vibe } = summarizeMood(checkinsToday);

  kpiMemoriesEl.textContent = String(memoriesTodayCount);
  kpiCheckinsEl.textContent = String(checkinsToday.length);
  kpiMoodEl.textContent = vibe;
  kpiReactsEl.textContent = String(reactionsTodayCount);

  const el = document.getElementById("happinessLevel");

  let label = t("cozyStart");
  let note = t("cozyNote");
  if (memoriesTodayCount >= 2 || checkinsToday.length >= 2) { label = t("goodVibes"); note = t("goodNote"); }
  if (memoriesTodayCount >= 4 && counts.bad === 0) { label = t("greatDay"); note = t("greatNote"); }
  if (counts.bad >= 2 && checkinsToday.length >= 3) { label = t("gentleReset"); note = t("resetNote"); }

  el.innerHTML = `<b>${escapeHtml(label)}</b><br><small>${escapeHtml(note)}</small>`;

  const badCount = (checkinsToday || []).filter(c => c.mood === "bad").length;
  const scoreRaw = (memoriesTodayCount * 12) + (reactionsTodayCount * 3) + (checkinsToday.length * 8) - (badCount * 12);
  const score = Math.max(0, Math.min(100, scoreRaw));
  setVibeBar(score, vibe);

  recapOut.innerHTML = `
    <b>${escapeHtml(t("recapTitleInline"))}</b><br>
    • ${escapeHtml(t("recapMem"))}: <b>${memoriesTodayCount}</b> • ${escapeHtml(t("recapReact"))}: <b>${reactionsTodayCount}</b><br>
    • ${escapeHtml(t("recapCheck"))}: 😇 <b>${counts.good}</b> / 😐 <b>${counts.ok}</b> / 😤 <b>${counts.bad}</b><br>
    <small>${escapeHtml(t("recapFooter"))}</small>
  `;
}
function renderMOTD(memories, reactionsByMemory) {
  const todays = memories.filter(m => isSameLocalDay(m.created_at));
  if (!todays.length) {
    motdOut.innerHTML = `<small>${escapeHtml(t("motdEmpty"))}</small>`;
    return { motd: null };
  }

  let best = null;
  for (const m of todays) {
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
  return { motd: best };
}
function renderPauseBanner(latestPauseSignal) {
  if (!latestPauseSignal) {
    pauseBanner.style.display = "none";
    return;
  }
  const created = new Date(latestPauseSignal.created_at).getTime();
  const now = Date.now();
  const durationMs = 10 * 60 * 1000;
  const end = created + durationMs;

  if (now >= end) {
    pauseBanner.style.display = "none";
    return;
  }

  const remaining = end - now;

  pauseBanner.style.display = "block";
  pauseBanner.innerHTML = `
    <b>${escapeHtml(t("pauseBannerTitle"))}</b><br>
    ${escapeHtml(t("pauseBannerText"))}<br>
    <small>${escapeHtml(t("pauseRemaining"))}: <b>${escapeHtml(msToMmSs(remaining))}</b></small>
  `;
}

// ==========================
// Recap modal
// ==========================
recapBtn?.addEventListener("click", () => {
  playSound("tap");
  modalBack.style.display = "flex";
});
closeRecapBtn?.addEventListener("click", () => {
  modalBack.style.display = "none";
});
modalBack?.addEventListener("click", (e) => {
  if (e.target === modalBack) modalBack.style.display = "none";
});

// ==========================
// Export (simple text card)
// ==========================
exportBtn?.addEventListener("click", async () => {
  playSound("tap");
  const txt = `Holiday Harmony — ${room}\nDate: ${todayISODate()}\n\n${recapOut?.innerText || ""}\n\nTip: screenshot the Recap too 🙂`;
  try {
    await navigator.clipboard.writeText(txt);
    alert("Export copied ✅");
  } catch {
    alert(txt);
  }
});

// ==========================
// Bingo (3x3 simple co-op, local per device)
// ==========================
function bingoKey(){ return `hh_bingo_${room}_${todayISODate()}_${LANG}`; }
function getBingoPool(){
  return (LANG==="ru")
    ? ["Кто-то сказал «ну я же говорил»","Чай появился","Смеялись вместе","Кто-то предложил фильм","Кто-то помог на кухне","Обнялись/похлопали","Старое фото/воспоминание","Все сели вместе","Кто-то сказал комплимент"]
    : ["Someone said “I told you so”","Tea appeared","We laughed together","Someone suggested a movie","Someone helped in kitchen","Hug / friendly pat","Old memory shared","Everyone sat together","Someone gave a compliment"];
}
function renderBingo(){
  if (!bingoOut) return;
  const pool = getBingoPool();
  const saved = JSON.parse(localStorage.getItem(bingoKey()) || "[]");
  const cells = pool.map((txt, i) => {
    const on = saved.includes(i);
    return `
      <button type="button" data-bi="${i}"
        style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:${on ? "#eafff2" : "#fff"}; font-weight:800;">
        ${escapeHtml(txt)}
      </button>`;
  }).join("");
  bingoOut.innerHTML = `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">${cells}</div>`;
}
bingoOut?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-bi]");
  if (!btn) return;
  playSound("tap");
  const i = Number(btn.getAttribute("data-bi"));
  const saved = JSON.parse(localStorage.getItem(bingoKey()) || "[]");
  const idx = saved.indexOf(i);
  if (idx >= 0) saved.splice(idx,1); else saved.push(i);
  localStorage.setItem(bingoKey(), JSON.stringify(saved));
  renderBingo();
});
renderBingo();

// ==========================
// Movie Night (TMDB + Supabase votes)
// ==========================
const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w342";

function tmdbLang() {
  return (LANG === "ru") ? "ru-RU" : "en-US";
}

async function fetchTrendingMovies() {
  if (!TMDB_API_KEY || TMDB_API_KEY.includes("PASTE_")) {
    if (movieTopPickEl) movieTopPickEl.innerHTML = `<b>${escapeHtml(t("movieNoKey"))}</b>`;
    if (movieGridEl) movieGridEl.innerHTML = "";
    return [];
  }
  if (movieStatusEl) movieStatusEl.textContent = t("movieLoading");

  const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${encodeURIComponent(TMDB_API_KEY)}&language=${encodeURIComponent(tmdbLang())}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDB error: " + res.status);
  const json = await res.json();
  return (json.results || []).slice(0, 12); // keep it light
}

async function loadMovieVotesToday() {
  const vote_date = todayISODate();
  const { data, error } = await supa
    .from("movie_votes")
    .select("*")
    .eq("room_code", room)
    .eq("vote_date", vote_date)
    .limit(2000);

  if (error) throw error;
  return data || [];
}

async function toggleMovieVote(movie) {
  const name = ((nameEl.value || getSavedName()) || "Someone").trim();
  const vote_date = todayISODate();

  playSound("tap");

  // Is there already a vote by this device for this movie today?
  const { data: existing, error: selErr } = await supa
    .from("movie_votes")
    .select("id")
    .eq("room_code", room)
    .eq("vote_date", vote_date)
    .eq("movie_id", movie.id)
    .eq("device_id", DEVICE_ID)
    .limit(1);

  if (selErr) throw selErr;

  if (existing && existing.length) {
    const { error: delErr } = await supa.from("movie_votes").delete().eq("id", existing[0].id);
    if (delErr) throw delErr;
  } else {
    const { error: insErr } = await supa.from("movie_votes").insert([{
      room_code: room,
      vote_date,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      name,
      device_id: DEVICE_ID
    }]);
    if (insErr) throw insErr;
  }

  playSound("success");
  await loadMoviesAndRender();
}

function buildVoteMap(votes) {
  const byMovie = {}; // movie_id => count
  const mine = new Set(); // movie_id voted by this device
  for (const v of votes) {
    byMovie[v.movie_id] = (byMovie[v.movie_id] || 0) + 1;
    if (v.device_id === DEVICE_ID) mine.add(v.movie_id);
  }
  return { byMovie, mine };
}

function renderTopPick(movies, votes) {
  if (!movieTopPickEl) return;

  const { byMovie } = buildVoteMap(votes);
  let best = null;

  for (const m of movies) {
    const c = byMovie[m.id] || 0;
    if (!best || c > best.count) best = { movie: m, count: c };
  }

  if (!best || best.count === 0) {
    movieTopPickEl.innerHTML = `<b>${escapeHtml(t("movieTop"))}</b> <small>${escapeHtml(LANG==="ru" ? "пока нет голосов — жми 👍" : "no votes yet — tap 👍")}</small>`;
    return;
  }

  const poster = best.movie.poster_path ? `${TMDB_POSTER_BASE}${best.movie.poster_path}` : "";
  movieTopPickEl.innerHTML = `
    <b>${escapeHtml(t("movieTop"))}</b>
    <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
      ${poster ? `<img src="${poster}" alt="" style="width:64px; border-radius:12px; border:1px solid #e7e7ef;">` : ""}
      <div>
        <b>${escapeHtml(best.movie.title)}</b><br>
        <small>👍 ${best.count} ${escapeHtml(t("movieVotes"))}</small>
      </div>
    </div>
  `;
}

function renderMovies(movies, votes) {
  if (!movieGridEl) return;

  const { byMovie, mine } = buildVoteMap(votes);

  movieGridEl.innerHTML = movies.map(m => {
    const poster = m.poster_path ? `${TMDB_POSTER_BASE}${m.poster_path}` : "";
    const count = byMovie[m.id] || 0;
    const iVoted = mine.has(m.id);

    return `
      <div class="movieCard" data-mid="${m.id}">
        ${poster ? `<img class="moviePoster" src="${poster}" alt="${escapeHtml(m.title)}">` : `<div class="moviePoster"></div>`}
        <div class="movieMeta">
          <b>${escapeHtml(m.title)}</b>
          <small>👍 ${count} ${escapeHtml(t("movieVotes"))} ${iVoted ? " • ✅ " + escapeHtml(t("movieYouVoted")) : ""}</small>
          <div class="movieActions">
            <button class="movieVoteBtn" type="button" data-vote="${m.id}">👍 Vote</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (movieStatusEl) movieStatusEl.textContent = "";
}

movieGridEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-vote]");
  if (!btn) return;

  const id = Number(btn.getAttribute("data-vote"));
  const movie = (window.__hh_movies || []).find(x => x.id === id);
  if (!movie) return;

  try {
    await toggleMovieVote(movie);
  } catch (err) {
    alert("Movie vote error: " + (err?.message || String(err)));
  }
});

movieReloadBtn?.addEventListener("click", async () => {
  playSound("tap");
  await loadMoviesAndRender(true);
});

movieExportBtn?.addEventListener("click", async () => {
  playSound("tap");
  const movies = window.__hh_movies || [];
  const votes = window.__hh_movieVotes || [];
  const { byMovie } = buildVoteMap(votes);

  let best = null;
  for (const m of movies) {
    const c = byMovie[m.id] || 0;
    if (!best || c > best.count) best = { movie: m, count: c };
  }

  const lines = [];
  lines.push(`🍿 Movie Night — Room ${room}`);
  lines.push(`Date: ${todayISODate()}`);
  lines.push("");
  if (best && best.count > 0) {
    lines.push(`Top pick: ${best.movie.title} (👍 ${best.count})`);
  } else {
    lines.push(LANG==="ru" ? "Пока нет голосов — выберите фильм 🙂" : "No votes yet — pick a movie 🙂");
  }
  lines.push("");
  lines.push(LANG==="ru" ? "Голоса:" : "Votes:");
  const ranking = movies
    .map(m => ({ m, c: byMovie[m.id] || 0 }))
    .filter(x => x.c > 0)
    .sort((a,b)=>b.c-a.c)
    .slice(0, 6);

  if (!ranking.length) lines.push(LANG==="ru" ? "—" : "—");
  for (const r of ranking) lines.push(`• ${r.m.title} — 👍 ${r.c}`);

  const txt = lines.join("\n");
  try {
    await navigator.clipboard.writeText(txt);
    alert(t("movieExport"));
  } catch {
    alert(txt);
  }
});

async function loadMoviesAndRender(forceRefetch = false) {
  try {
    if (forceRefetch || !window.__hh_movies || !window.__hh_movies.length) {
      const movies = await fetchTrendingMovies();
      window.__hh_movies = movies;
    }
    const votes = await loadMovieVotesToday();
    window.__hh_movieVotes = votes;

    renderTopPick(window.__hh_movies, votes);
    renderMovies(window.__hh_movies, votes);
  } catch (err) {
    if (movieStatusEl) movieStatusEl.textContent = "Movie error: " + (err?.message || String(err));
  }
}

// ==========================
// Load + render (no blinking)
// ==========================
let lastRenderKey = "";

async function loadAll() {
  try {
    const today = todayISODate();
    const todayStr = new Date().toDateString();

    const [memRes, chkRes, reactRes, sigRes] = await Promise.all([
      supa.from("memories").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(80),
      supa.from("checkins").select("*").eq("room_code", room).eq("checkin_date", today).order("created_at", { ascending: false }).limit(80),
      supa.from("reactions").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(600),
      supa.from("signals").select("*").eq("room_code", room).eq("type", "pause").order("created_at", { ascending: false }).limit(1),
    ]);

    if (memRes.error) throw memRes.error;
    if (chkRes.error) throw chkRes.error;
    if (reactRes.error) throw reactRes.error;
    if (sigRes.error) throw sigRes.error;

    const memories = memRes.data || [];
    const checkinsToday = chkRes.data || [];
    const reactions = reactRes.data || [];
    const pauseSignal = (sigRes.data && sigRes.data[0]) ? sigRes.data[0] : null;

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
    updateAwards(memories, reactionsByMemory);

    loadMyMoodSelection(checkinsToday);
    renderMission();

    renderMOTD(memories, reactionsByMemory);
    renderPauseBanner(pauseSignal);

    // Recap modal mirrors current values
    recapModalKpis.innerHTML = recapOut.innerHTML;
    recapModalMotd.innerHTML = motdOut.innerHTML;
    recapModalAwards.innerHTML = awardsOut.innerHTML;

    // Render memories only when changed
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
            <small> — ${escapeHtml(fmtLocal(m.created_at))}</small>
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

    // Movies (separate load)
    await loadMoviesAndRender(false);

    debug("✅ Connected. Data loaded.");
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

// Start
applyLanguage();
loadAll();
setInterval(loadAll, 6000);
