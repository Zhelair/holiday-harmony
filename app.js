// ==========================
// Holiday Harmony — app.js
// EN/RU toggle + Vibe pulse animation
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

const vibeWrapEl = document.getElementById("vibeWrap");
const vibeBarEl = document.getElementById("vibeBar");

const langBtn = document.getElementById("langBtn");

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
    ambienceAudio.volume = 0.85;
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
// Language (EN / RU)
// ==========================
const i18n = {
  en: {
    roomTitle: "🏠 Room:",
    appTitle: "Holiday Harmony",
    appSubtitle: "Co-op family mini-game: collect good moments, keep the vibe warm.",

    soundLabel: "🔊 Sound",
    party: "🎉 Party",

    missionTitle: "🎯 Today’s Gentle Challenge",
    missionDone: "✅ I did it",
    missionNew: "🎲 New (just for me)",
    missionHint: "Shared daily challenge + personal reroll option.",

    dashTitle: "📊 Family Dashboard",
    kpiMemoriesLabel: "Happy moments today",
    kpiCheckinsLabel: "Mood check-ins today",
    kpiMoodLabel: "Today’s vibe",
    kpiReactsLabel: "Reactions today",

    checkinTitle: "✅ Daily Mood Check-in",
    namePh: "Your name",
    checkinHint: "Pick your mood for today (you can change it later).",
    calm: "Calm",
    okay: "Okay",
    overloaded: "Overloaded",
    resetMoment: "🧯 Reset Moment",
    choreRoulette: "🎡 Chore Roulette",

    awardsTitle: "🏆 Awards Preview",
    awardsHint: "Friendly awards only. No roasting. 😄",

    activityTitle: "🎲 Activity Generator",
    activityBtn: "Give us something fun",
    activityHint: "Instant “what do we do now?” rescue button.",

    boardTitle: "🧾 Today’s Mood Board",
    boardHint: "Shows who checked in today.",

    vaultTitle: "✨ Memory Vault",
    momentPh: "Happy moment (e.g. We laughed together at breakfast)",
    post: "Post memory",
    reactionsLabel: "Reactions:",
    reactionsHint: "Tap ❤️ 😂 ⭐ on any memory (tap again to undo).",

    tipsTitle: "📌 Quick Tips",
    tipBtn: "Give me a tip",
    tipsHint: "Short prompts to keep the vibe warm.",

    pleaseName: "Please enter your name first 🙂",
    saving: "Saving…",
    checkedIn: "Checked in ✅",
    posted: "Posted ✅",
    fillNameMoment: "Please fill your name + the moment.",

    vibeNoCheckins: "No check-ins yet",
    vibeCalm: "😇 Calm",
    vibeOkay: "😐 Okay",
    vibeOver: "😤 Overloaded",

    cozyStart: "🙂 Cozy start",
    goodVibes: "🙂 Good vibes",
    greatDay: "😄 Great day together",
    gentleReset: "🧯 Gentle reset",

    cozyNote: "Post one happy moment (even a tiny one).",
    goodNote: "Nice. The warm timeline is growing.",
    greatNote: "Food, laughs, and a little rest. Perfect.",
    resetNote: "Tea/walk mode can save the evening.",

    recapTitle: "Today recap:",
    recapMem: "Memories",
    recapReact: "Reactions",
    recapCheck: "Check-ins",
    recapFooter: "Vibe meter is… surprisingly accurate 😄",

    moodBoardEmpty: "No one checked in yet. Want to start? 🙂",
    awardsNone: "No awards yet.",

    reactSelectErr: "REACTION SELECT ERROR:\n",
    reactInsertErr: "REACTION INSERT ERROR:\n",
    reactDeleteErr: "REACTION DELETE ERROR:\n",
    badMemoryId: "Bad memory id (not a number): "
  },

  ru: {
    roomTitle: "🏠 Комната:",
    appTitle: "Holiday Harmony",
    appSubtitle: "Семейная мини-игра: собираем тёплые моменты и держим атмосферу.",

    soundLabel: "🔊 Звук",
    party: "🎉 Пати",

    missionTitle: "🎯 Мягкий вызов на сегодня",
    missionDone: "✅ Сделано",
    missionNew: "🎲 Новый (только мне)",
    missionHint: "Общий вызов дня + личный «переброс».",

    dashTitle: "📊 Семейная панель",
    kpiMemoriesLabel: "Тёплых моментов сегодня",
    kpiCheckinsLabel: "Чек-ины настроения сегодня",
    kpiMoodLabel: "Вайб дня",
    kpiReactsLabel: "Реакций сегодня",

    checkinTitle: "✅ Чек-ин настроения",
    namePh: "Ваше имя",
    checkinHint: "Выберите настроение (можно менять позже).",
    calm: "Спокойно",
    okay: "Норм",
    overloaded: "Перегруз",
    resetMoment: "🧯 Пауза-перезагрузка",
    choreRoulette: "🎡 Рулетка дел",

    awardsTitle: "🏆 Награды",
    awardsHint: "Только добрые награды. Без подколов 😄",

    activityTitle: "🎲 Генератор активности",
    activityBtn: "Дай идею",
    activityHint: "Кнопка спасения: «что делаем?»",

    boardTitle: "🧾 Доска настроения",
    boardHint: "Кто как отметился сегодня.",

    vaultTitle: "✨ Копилка моментов",
    momentPh: "Тёплый момент (например: посмеялись за завтраком)",
    post: "Добавить момент",
    reactionsLabel: "Реакции:",
    reactionsHint: "Нажмите ❤️ 😂 ⭐ на любом моменте (повторно — убрать).",

    tipsTitle: "📌 Быстрые подсказки",
    tipBtn: "Дай подсказку",
    tipsHint: "Короткие идеи, чтобы сохранить тепло.",

    pleaseName: "Сначала введите имя 🙂",
    saving: "Сохраняю…",
    checkedIn: "Отмечено ✅",
    posted: "Добавлено ✅",
    fillNameMoment: "Введите имя и текст момента.",

    vibeNoCheckins: "Пока нет чек-инов",
    vibeCalm: "😇 Спокойно",
    vibeOkay: "😐 Норм",
    vibeOver: "😤 Перегруз",

    cozyStart: "🙂 Разогреваемся",
    goodVibes: "🙂 Хороший вайб",
    greatDay: "😄 Прям тепло пошло",
    gentleReset: "🧯 Нужна мягкая пауза",

    cozyNote: "Добавьте один тёплый момент (даже маленький).",
    goodNote: "Класс. Лента тепла растёт.",
    greatNote: "Еда, смех и чуть отдыха — идеально.",
    resetNote: "Чай/прогулка часто спасают вечер.",

    recapTitle: "Итог дня:",
    recapMem: "Моменты",
    recapReact: "Реакции",
    recapCheck: "Чек-ины",
    recapFooter: "Шкала вайба… подозрительно точная 😄",

    moodBoardEmpty: "Пока никто не отметился. Начнём? 🙂",
    awardsNone: "Пока нет наград.",

    reactSelectErr: "ОШИБКА SELECT реакций:\n",
    reactInsertErr: "ОШИБКА INSERT реакций:\n",
    reactDeleteErr: "ОШИБКА DELETE реакций:\n",
    badMemoryId: "Плохой id момента (не число): "
  }
};

function getLang() { return localStorage.getItem("hh_lang") || "en"; }
function setLang(v) { localStorage.setItem("hh_lang", v); }
let LANG = getLang();

function t(key) {
  return (i18n[LANG] && i18n[LANG][key]) || i18n.en[key] || key;
}

function applyLanguage() {
  // Static text
  document.getElementById("roomTitle").childNodes[0].textContent = t("roomTitle") + " ";
  document.getElementById("appTitle").textContent = t("appTitle");
  document.getElementById("appSubtitle").textContent = t("appSubtitle");

  document.getElementById("soundLabel").textContent = t("soundLabel");
  partyBtn.textContent = t("party");

  document.getElementById("missionTitle").textContent = t("missionTitle");
  missionDoneBtn.textContent = t("missionDone");
  missionNewBtn.textContent = t("missionNew");
  document.getElementById("missionHint").textContent = t("missionHint");

  document.getElementById("dashTitle").textContent = t("dashTitle");
  document.getElementById("kpiMemoriesLabel").textContent = t("kpiMemoriesLabel");
  document.getElementById("kpiCheckinsLabel").textContent = t("kpiCheckinsLabel");
  document.getElementById("kpiMoodLabel").textContent = t("kpiMoodLabel");
  document.getElementById("kpiReactsLabel").textContent = t("kpiReactsLabel");

  document.getElementById("checkinTitle").textContent = t("checkinTitle");
  nameEl.placeholder = t("namePh");
  document.getElementById("checkinHint").textContent = t("checkinHint");

  document.getElementById("moodGoodLabel").textContent = t("calm");
  document.getElementById("moodOkLabel").textContent = t("okay");
  document.getElementById("moodBadLabel").textContent = t("overloaded");

  defuseBtn.textContent = t("resetMoment");
  choreBtn.textContent = t("choreRoulette");

  document.getElementById("awardsTitle").textContent = t("awardsTitle");
  document.getElementById("awardsHint").textContent = t("awardsHint");

  document.getElementById("activityTitle").textContent = t("activityTitle");
  document.getElementById("activityBtn").textContent = t("activityBtn");
  document.getElementById("activityHint").textContent = t("activityHint");

  document.getElementById("boardTitle").textContent = t("boardTitle");
  document.getElementById("boardHint").textContent = t("boardHint");

  document.getElementById("vaultTitle").textContent = t("vaultTitle");
  momentEl.placeholder = t("momentPh");
  document.getElementById("postBtn").textContent = t("post");
  document.getElementById("reactionsLabel").textContent = t("reactionsLabel");
  document.getElementById("reactionsHint").textContent = t("reactionsHint");

  document.getElementById("tipsTitle").textContent = t("tipsTitle");
  newTipBtn.textContent = t("tipBtn");
  document.getElementById("tipsHint").textContent = t("tipsHint");

  // Re-render dynamic sections in new language
  renderMission();
  // tips will refresh on next loadAll; we also refresh immediately
  loadAll();
}

langBtn?.addEventListener("click", () => {
  playSound("tap");
  LANG = (LANG === "en") ? "ru" : "en";
  setLang(LANG);
  applyLanguage();
});

// ==========================
// Content pools (EN & RU)
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
        "Каждый рассказывает одну смешную историю из детства.",
        "Сделайте что-то на кухне вместе.",
        "Сделайте одну смешную семейную фотку.",
        "Каждый предлагает фильм — потом голосуем."
      ],
      activities: [
        "«Две правды и одна ложь» — по кругу",
        "Выбор фильма: каждый предлагает один вариант, потом голосуем",
        "10 минут прогулки (без тяжёлых тем)",
        "Чай + сладкое: каждый говорит одно хорошее за день",
        "Фото-челлендж: повторить старое семейное фото",
        "Мини-викторина: «кто это сказал?» (семейные фразы)",
        "Пазл/настолка на 20 минут",
        "Командная кухня: один режет, один мешает, один пробует",
        "5 минут уборки под музыку",
        "История дня: каждый делится одним тёплым воспоминанием"
      ],
      defuse: [
        "Пауза: 3 медленных вдоха. Потом — мягче голос 🙂",
        "Мини-перерыв: вода + улыбка. Команда «семья» снова онлайн.",
        "Сменить сцену: чай/прогулка/уютная активность на 10 минут.",
        "Круг комплиментов: по одному искреннему предложению.",
        "Режим юмора: скажите претензию как злодей из мультфильма.",
        "Мирная взятка: принесите перекус. Перекус решает многое.",
        "Сначала доброта, потом правота. Работает странно хорошо."
      ],
      chores: [
        "Ты моешь посуду 🫧",
        "Ты вытираешь посуду 🍽️",
        "Ты накрываешь на стол 🧂",
        "Ты выбираешь музыку 🎵",
        "Ты делаешь чай ☕",
        "Ты 5 минут убираешься 🧹",
        "Ты отдыхаешь — заслужил(а) 😌",
        "Ты выбираешь фильм 🎬"
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
      "Everyone shares one funny childhood memory.",
      "Kitchen teamwork: make one thing together.",
      "Photo moment: take a goofy group selfie.",
      "Movie vote: everyone suggests 1 title, then vote."
    ],
    activities: [
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
    ],
    defuse: [
      "Reset moment: 3 slow breaths. Then softer voices. 🙂",
      "Quick pause: water + a small smile. Team ‘family’ is back online.",
      "Switch scene: tea, a short walk, or a cozy activity. Keep it light for 10 minutes.",
      "Compliment round: one sincere sentence each.",
      "Humor mode: say your complaint like a Disney villain.",
      "Peace offering: bring a snack. Snacks solve many mysteries.",
      "Kind first, correct later. Works weirdly well."
    ],
    chores: [
      "You wash dishes 🫧",
      "You dry dishes 🍽️",
      "You set the table 🧂",
      "You choose music 🎵",
      "You make tea ☕",
      "You do a 5-minute tidy sprint 🧹",
      "You rest — you earned it 😌",
      "You pick the movie 🎬"
    ]
  };
}

// ==========================
// Today’s Mission (no DB)
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

function getTodaysMissionIndex(missionList) {
  const baseSeed = `${room}|${todayISODate()}`;
  return hashStringToInt(baseSeed) % missionList.length;
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
// Buttons: Activity / Reset / Chores
// ==========================
document.getElementById("activityBtn")?.addEventListener("click", () => {
  playSound("tap");
  const { activities } = pools();
  const pick = activities[Math.floor(Math.random() * activities.length)];
  document.getElementById("activityOut").innerHTML = `<div style="margin-top:10px"><b>${escapeHtml(pick)}</b></div>`;
});

defuseBtn?.addEventListener("click", () => {
  playSound("tap");
  const { defuse } = pools();
  const pick = defuse[Math.floor(Math.random() * defuse.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>${escapeHtml(pick)}</b>
    </div>`;
});

choreBtn?.addEventListener("click", () => {
  playSound("tap");
  const { chores } = pools();
  const pick = chores[Math.floor(Math.random() * chores.length)];
  defuseOut.innerHTML = `
    <div style="margin-top:10px; border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      <b>${escapeHtml(pick)}</b>
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
// Reactions
// ==========================
async function toggleReaction(memoryIdRaw, emoji) {
  const name = ((nameEl.value || getSavedName()) || "Someone").trim();
  const memIdNum = Number(memoryIdRaw);

  if (!Number.isFinite(memIdNum)) {
    alert(t("badMemoryId") + memoryIdRaw);
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

  if (selErr) {
    alert(t("reactSelectErr") + selErr.message);
    debug("❌ Reaction SELECT error: " + selErr.message);
    return;
  }

  if (existing && existing.length) {
    const { error: delErr } = await supa
      .from("reactions")
      .delete()
      .eq("id", existing[0].id);

    if (delErr) {
      alert(t("reactDeleteErr") + delErr.message);
      debug("❌ Reaction DELETE error: " + delErr.message);
      return;
    }
  } else {
    const { error: insErr } = await supa
      .from("reactions")
      .insert([{ room_code: room, memory_id: memIdNum, emoji, name, device_id: DEVICE_ID }]);

    if (insErr) {
      alert(t("reactInsertErr") + insErr.message);
      debug("❌ Reaction INSERT error: " + insErr.message);
      return;
    }
  }

  playSound("success");
  await loadAll();
}

listEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".reactBtn");
  if (!btn) return;
  const mid = btn.getAttribute("data-mid");
  const emo = btn.getAttribute("data-emo");
  await toggleReaction(mid, emo);
});

// ==========================
// Tips (language-aware)
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

  if (LANG === "ru") {
    if (checkinsToday.length === 0) tips.push("✅ Попросите всех отметиться — один тап улучшает атмосферу.");
    if (memoriesTodayCount === 0) tips.push("✨ Добавьте один тёплый момент. «Хороший чай» тоже считается.");
    if (counts.bad >= 2) tips.push("🧯 Если перегруз: чай/прогулка часто спасают вечер.");

    tips.push("🫶 Круг комплиментов: по одному искреннему предложению.");
    tips.push("🎬 Выбор фильма: каждый предлагает по одному — потом голосование.");
    tips.push("🧹 5 минут уборки под музыку = быстрый ресет.");
    tips.push("🍵 Правило чая: без «разборов» во время чая.");
    tips.push("🎲 Когда разговор вязнет — жмите «Генератор активности».");
    tips.push("😂 «А помнишь…» — лучший семейный клей.");
    tips.push("⭐ Ставьте реакции — вайб растёт быстрее.");
    return tips;
  }

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
  tipsOut.innerHTML = pickRandom(lastTipsPool, 3).map(tip => `<div style="margin:10px 0;">${escapeHtml(tip)}</div>`).join("");
});

// ==========================
// Post memory
// ==========================
async function postMemory() {
  statusEl.textContent = "";
  const name = (nameEl.value || "").trim();
  const moment = (momentEl.value || "").trim();

  if (!name || !moment) {
    statusEl.textContent = t("fillNameMoment");
    return;
  }

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
// Dashboard + vibe bar (with pulse animation)
// ==========================
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

let lastVibePercent = null;

function pulseVibe() {
  if (!vibeWrapEl) return;
  vibeWrapEl.classList.remove("vibePulse");
  // force reflow so animation can retrigger
  void vibeWrapEl.offsetWidth;
  vibeWrapEl.classList.add("vibePulse");
}

function setVibeBar(percent, vibeText) {
  if (!vibeBarEl) return;
  const p = Math.max(0, Math.min(100, percent));
  vibeBarEl.style.width = p + "%";

  // Color set based on vibe
  if (String(vibeText).includes("Перегруз") || String(vibeText).includes("Overloaded")) {
    vibeBarEl.style.background = "linear-gradient(90deg, #ffb3b3, #ffd1d1)";
  } else if (String(vibeText).includes("Спокой") || String(vibeText).includes("Calm")) {
    vibeBarEl.style.background = "linear-gradient(90deg, #b8f0d0, #d6ffe9)";
  } else {
    vibeBarEl.style.background = "linear-gradient(90deg, #ffe7b3, #fff2d6)";
  }
  vibeBarEl.style.backgroundSize = "200% 100%";

  // Pulse only if changed noticeably (prevents constant pulsing)
  if (lastVibePercent === null || Math.abs(p - lastVibePercent) >= 3) {
    pulseVibe();
    lastVibePercent = p;
  }
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
    <b>${escapeHtml(t("recapTitle"))}</b><br>
    • ${escapeHtml(t("recapMem"))}: <b>${memoriesTodayCount}</b> • ${escapeHtml(t("recapReact"))}: <b>${reactionsTodayCount}</b><br>
    • ${escapeHtml(t("recapCheck"))}: 😇 <b>${counts.good}</b> / 😐 <b>${counts.ok}</b> / 😤 <b>${counts.bad}</b><br>
    <small>${escapeHtml(t("recapFooter"))}</small>
  `;
}

function updateMoodBoard(checkinsToday) {
  if (!moodBoardEl) return;
  if (checkinsToday.length === 0) {
    moodBoardEl.innerHTML = `<small>${escapeHtml(t("moodBoardEmpty"))}</small>`;
    return;
  }

  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";
  const moodLabel = (m) => {
    if (LANG === "ru") return m === "good" ? "спокойно" : m === "ok" ? "норм" : "перегруз";
    return m === "good" ? "calm" : m === "ok" ? "ok" : "overloaded";
  };

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
    const cnt = reactionsByMemory[String(m.id)]?.total || 0;
    if (!topMemory || cnt > topMemory.cnt) topMemory = { cnt, name: m.name };
  }

  const moodNames = { good: [], ok: [], bad: [] };
  for (const c of checkinsToday) moodNames[c.mood]?.push(c.name);

  const awards = [];
  const awardName = (en, ru) => LANG === "ru" ? ru : en;

  if (mostMemories) awards.push(`✨ <b>${awardName("Memory Maker", "Главный хранитель моментов")}</b>: ${escapeHtml(mostMemories.name)} (${mostMemories.val})`);
  if (moodNames.good?.[0]) awards.push(`🕊 <b>${awardName("Calm Star", "Спокойная звезда")}</b>: ${escapeHtml(moodNames.good[0])}`);
  if (moodNames.ok?.[0]) awards.push(`🙂 <b>${awardName("Steady Support", "Опора дня")}</b>: ${escapeHtml(moodNames.ok[0])}`);
  if (moodNames.bad?.[0]) awards.push(`🫶 <b>${awardName("Needs a Hug", "Нужна обнимашка")}</b>: ${escapeHtml(moodNames.bad[0])}`);
  if (topMemory && topMemory.cnt > 0) awards.push(`⭐ <b>${awardName("Most Loved Moment", "Самый любимый момент")}</b>: ${escapeHtml(topMemory.name)} (${topMemory.cnt})`);

  awardsOut.innerHTML = `
    <div style="border:1px solid #e7e7ef; border-radius:14px; padding:12px; background:#fff;">
      ${awards.length ? awards.map(a => `<div style="margin:8px 0;">${a}</div>`).join("") : `<small>${escapeHtml(t("awardsNone"))}</small>`}
    </div>`;
}

// ==========================
// Load + render (no blinking)
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
      tipsOut.innerHTML = pickRandom(lastTipsPool, 3).map(tip => `<div style="margin:10px 0;">${escapeHtml(tip)}</div>`).join("");
    }

    loadMyMoodSelection(checkinsToday);
    renderMission();

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

// Start: apply saved language
applyLanguage();
setInterval(loadAll, 5000);
loadAll();
