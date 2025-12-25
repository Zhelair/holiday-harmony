// ==========================
// Holiday Harmony — app.js
// Keeps ALL your working features
// Adds: Lookback (date history) + Micro-confetti on post
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

// ✅ PASTE REAL VALUES
const SUPABASE_URL = "https://ubthnjsdxuhjyjnrxube.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGhuanNkeHVoanlqbnJ4dWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njc1OTIsImV4cCI6MjA4MjE0MzU5Mn0.zOUuQErKK2sOhIbmG2OVbwBkuUe3TfrEEGBlH7-dE_g";

const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY);

// ---- room
const params = new URLSearchParams(location.search);
const room = (params.get("room") || "").trim();
if (!room) {
  alert("No room code found. Go back and enter a room code.");
  location.href = "index.html";
}
document.getElementById("roomLabel").textContent = room;

// ---- share link (keep simple)
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

const motdOut = document.getElementById("motdOut");

const pauseBanner = document.getElementById("pauseBanner");

const recapBtn = document.getElementById("recapBtn");
const modalBack = document.getElementById("modalBack");
const closeRecapBtn = document.getElementById("closeRecapBtn");
const recapModalKpis = document.getElementById("recapModalKpis");
const recapModalMotd = document.getElementById("recapModalMotd");
const recapModalAwards = document.getElementById("recapModalAwards");

// ---- Lookback DOM
const btnToday = document.getElementById("btnToday");
const btnYesterday = document.getElementById("btnYesterday");
const btn7 = document.getElementById("btn7");
const btn30 = document.getElementById("btn30");
const historyDateEl = document.getElementById("historyDate");
const historyStatusEl = document.getElementById("historyStatus");

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
function addDaysISO(baseISO, delta) {
  const d = new Date(`${baseISO}T00:00:00`);
  d.setDate(d.getDate() + delta);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function fmtLocal(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}
function isSameLocalDay(isoOrTs, isoDate) {
  const d = new Date(isoOrTs);
  return d.toDateString() === new Date(`${isoDate}T00:00:00`).toDateString();
}
function isoToStartEnd(isoDate) {
  const start = new Date(`${isoDate}T00:00:00`);
  const end = new Date(`${isoDate}T23:59:59.999`);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ---- Sound
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
// Lookback state (NEW)
// ==========================
let SELECTED_DATE = (params.get("date") || "").trim() || todayISODate();
if (historyDateEl) historyDateEl.value = SELECTED_DATE;

function viewingToday() {
  return SELECTED_DATE === todayISODate();
}
function setReadOnlyUI() {
  const ro = !viewingToday();
  const msg = ro
    ? "🔒 Viewing past date. Posting + mood + pause are disabled."
    : "";
  if (historyStatusEl) historyStatusEl.textContent = msg;

  // disable actions that change DB
  document.getElementById("postBtn")?.toggleAttribute("disabled", ro);
  document.getElementById("moodGood")?.toggleAttribute("disabled", ro);
  document.getElementById("moodOk")?.toggleAttribute("disabled", ro);
  document.getElementById("moodBad")?.toggleAttribute("disabled", ro);
  pauseBtn?.toggleAttribute("disabled", ro);
}
function setSelectedDate(iso) {
  SELECTED_DATE = iso;
  if (historyDateEl) historyDateEl.value = iso;

  const url = new URL(location.href);
  url.searchParams.set("room", room);
  url.searchParams.set("date", iso);
  history.replaceState({}, "", url.toString());

  setReadOnlyUI();
  loadAll();
}

btnToday?.addEventListener("click", () => setSelectedDate(todayISODate()));
btnYesterday?.addEventListener("click", () => setSelectedDate(addDaysISO(todayISODate(), -1)));
btn7?.addEventListener("click", () => setSelectedDate(addDaysISO(todayISODate(), -6)));
btn30?.addEventListener("click", () => setSelectedDate(addDaysISO(todayISODate(), -29)));
historyDateEl?.addEventListener("change", () => {
  const iso = (historyDateEl.value || "").trim();
  if (iso) setSelectedDate(iso);
});

// ==========================
// Micro-confetti (NEW)
// ==========================
function microConfetti() {
  const count = 18;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = (window.innerWidth * 0.5 + (Math.random() * 240 - 120)) + "px";
    el.style.top = (window.innerHeight * 0.18 + (Math.random() * 20 - 10)) + "px";
    el.style.background = `hsl(${Math.floor(Math.random() * 360)}, 90%, 75%)`;
    el.style.animationDelay = (Math.random() * 80) + "ms";
    el.style.width = (8 + Math.random() * 8) + "px";
    el.style.height = (10 + Math.random() * 10) + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

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

    tagFood:"🍽 Food",
    tagFunny:"😂 Funny",
    tagMovie:"🎬 Movie",
    tagTea:"☕ Tea",
    tagGifts:"🎁 Gifts",
    tagKids:"🧸 Kids",
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

    recapTitleInline:"Day recap:",
    recapMem:"Memories",
    recapReact:"Reactions",
    recapCheck:"Check-ins",
    recapFooter:"Vibe meter is… surprisingly accurate 😄",

    moodBoardEmpty:"No one checked in yet. Want to start? 🙂",
    awardsNone:"No awards yet.",
    motdEmpty:"No memories on this day yet. Add the first warm moment ✨",

    badMemoryId:"Bad memory id (not a number): ",
    reactSelectErr:"REACTION SELECT ERROR:\n",
    reactInsertErr:"REACTION INSERT ERROR:\n",
    reactDeleteErr:"REACTION DELETE ERROR:\n",
  },
  ru: {
    soundLabel:"🔊 Звук",
    motdTitle:"⭐ Момент дня",
    motdHint:"Самый любимый момент (по реакциям).",
    recapBtn:"📸 Итог",
    recapTitle:"📸 Итог дня",
    recapHowto:"Как поделиться:",
    recapHowtoText:"Сделайте скриншот и отправьте в семейный чат 🙂",
    recapFooterHint:"Подсказка: на телефоне скрин получается лучше.",

    pauseBtn:"🧘 Нужна пауза",
    pauseBannerTitle:"🧘 Пауза",
    pauseBannerText:"10 минут. Чай/вода. Без тяжёлых тем. Мы одна команда.",
    pauseRemaining:"Осталось",

    tagFood:"🍽 Еда",
    tagFunny:"😂 Смешно",
    tagMovie:"🎬 Фильм",
    tagTea:"☕ Чай",
    tagGifts:"🎁 Подарки",
    tagKids:"🧸 Дети",
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
    motdEmpty:"В этот день ещё нет моментов. Добавьте первый тёплый момент ✨",

    badMemoryId:"Плохой id (не число): ",
    reactSelectErr:"ОШИБКА SELECT реакций:\n",
    reactInsertErr:"ОШИБКА INSERT реакций:\n",
    reactDeleteErr:"ОШИБКА DELETE реакций:\n",
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
  tagSelect.options[0].textContent = t("tagNone");
  tagSelect.options[1].textContent = t("tagFood");
  tagSelect.options[2].textContent = t("tagFunny");
  tagSelect.options[3].textContent = t("tagMovie");
  tagSelect.options[4].textContent = t("tagTea");
  tagSelect.options[5].textContent = t("tagGifts");
  tagSelect.options[6].textContent = t("tagKids");

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
// Pools
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
// Mission (local) — still TODAY-based on purpose
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
  if (!viewingToday()) return;
  const name = (nameEl.value || "").trim();
  if (!name) return alert(t("pleaseName"));
  localStorage.setItem(missionDoneKey(), "1");
  renderMission();
  playSound("success");
});
missionNewBtn?.addEventListener("click", () => {
  playSound("tap");
  if (!viewingToday()) return;
  const { missions } = pools();
  localStorage.setItem(myMissionOverrideKey(), String(Math.floor(Math.random() * missions.length)));
  renderMission();
  playSound("success");
});
renderMission();

// ==========================
// Activity / Reset / Chores (works anytime)
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
// Pause (shared via Supabase signals) — today only
// ==========================
function msToMmSs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2,"0");
  const ss = String(s % 60)).padStart(2,"0");
  return `${mm}:${ss}`;
}

async function sendPause() {
  if (!viewingToday()) return;
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
pauseBtn?.addEventListener("click", () => { sendPause(); });

// ==========================
// Mood check-in — today only
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
  await loadAll();
}
moodButtons.good?.addEventListener("click", () => setMood("good"));
moodButtons.ok?.addEventListener("click", () => setMood("ok"));
moodButtons.bad?.addEventListener("click", () => setMood("bad"));

function loadMyMoodSelection(checkinsForSelectedDate) {
  const name = (nameEl.value || "").trim();
  if (!name) return;

  const mine = checkinsForSelectedDate.find(c => c.name === name);
  clearMoodSelection();
  if (!mine) return;

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

  if (selErr) { alert(t("reactSelectErr") + selErr.message); return; }

  if (existing && existing.length) {
    const { error: delErr } = await supa.from("reactions").delete().eq("id", existing[0].id);
    if (delErr) { alert(t("reactDeleteErr") + delErr.message); return; }
  } else {
    const { error: insErr } = await supa.from("reactions").insert([{
      room_code: room, memory_id: memIdNum, emoji, name, device_id: DEVICE_ID
    }]);
    if (insErr) { alert(t("reactInsertErr") + insErr.message); return; }
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
// Tips
// ==========================
function pickRandom(arr, count = 3) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < count) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}
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
function buildTipsPool(memoriesCount, checkins) {
  const { counts } = summarizeMood(checkins);
  const tips = [];
  if (LANG === "ru") {
    if (checkins.length === 0) tips.push("✅ Попросите всех отметиться — один тап улучшает атмосферу.");
    if (memoriesCount === 0) tips.push("✨ Добавьте один тёплый момент. «Хороший чай» тоже считается.");
    if (counts.bad >= 2) tips.push("🧯 Если перегруз: чай/прогулка часто спасают вечер.");
    tips.push("🫶 Круг комплиментов: по одному искреннему предложению.");
    tips.push("🎬 Выбор фильма: каждый предлагает по одному — потом голосование.");
    tips.push("🍵 Правило чая: без «разборов» во время чая.");
    tips.push("😂 «А помнишь…» — лучший семейный клей.");
    tips.push("⭐ Ставьте реакции — вайб растёт быстрее.");
    return tips;
  }
  if (checkins.length === 0) tips.push("✅ Ask everyone to check in. One tap = better vibe.");
  if (memoriesCount === 0) tips.push("✨ Post one tiny happy moment. ‘Good tea’ counts.");
  if (counts.bad >= 2) tips.push("🧯 If someone is overloaded: tea/walk mode can save the evening.");
  tips.push("🫶 Compliment round: one sincere sentence each.");
  tips.push("🎬 Movie decision: everyone suggests 1 title, then vote.");
  tips.push("🍵 Tea break rule: no problem-solving during tea.");
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
// Post memory (with TAG prefix) — today only + confetti
// ==========================
async function postMemory() {
  if (!viewingToday()) return;

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
  microConfetti();
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
  vibeBarEls
  .style.backgroundSize = "200% 100%";

  if (lastVibePercent === null || Math.abs(p - lastVibePercent) >= 3) {
    pulseVibe();
    lastVibePercent = p;
  }
}

function updateMoodBoard(checkins) {
  if (!moodBoardEl) return;
  if (checkins.length === 0) {
    moodBoardEl.innerHTML = `<small>${escapeHtml(t("moodBoardEmpty"))}</small>`;
    return;
  }
  const moodEmoji = (m) => m === "good" ? "😇" : m === "ok" ? "😐" : "😤";
  moodBoardEl.innerHTML = `
    <b style="display:block; margin-bottom:8px;">🧾 ${escapeHtml(LANG==="ru" ? "Доска настроения" : "Mood Board")}</b>
    ${checkins
      .sort((a,b) => a.name.localeCompare(b.name))
      .map(c => `
        <div style="padding:10px 12px; border:1px solid #e7e7ef; border-radius:14px; margin:8px 0; background:#fff;">
          <b>${escapeHtml(c.name)}</b> — ${moodEmoji(c.mood)}
        </div>
      `).join("")}
  `;
}

function updateAwards(memories, checkins, reactionsByMemory) {
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

function updateDashboard(memoriesCount, checkins, reactionsCount) {
  const { counts, vibe } = summarizeMood(checkins);

  kpiMemoriesEl.textContent = String(memoriesCount);
  kpiCheckinsEl.textContent = String(checkins.length);
  kpiMoodEl.textContent = vibe;
  kpiReactsEl.textContent = String(reactionsCount);

  const el = document.getElementById("happinessLevel");

  let label = t("cozyStart");
  let note = t("cozyNote");
  if (memoriesCount >= 2 || checkins.length >= 2) { label = t("goodVibes"); note = t("goodNote"); }
  if (memoriesCount >= 4 && counts.bad === 0) { label = t("greatDay"); note = t("greatNote"); }
  if (counts.bad >= 2 && checkins.length >= 3) { label = t("gentleReset"); note = t("resetNote"); }

  el.innerHTML = `<b>${escapeHtml(label)}</b><br><small>${escapeHtml(note)}</small>`;

  const badCount = (checkins || []).filter(c => c.mood === "bad").length;
  const scoreRaw = (memoriesCount * 12) + (reactionsCount * 3) + (checkins.length * 8) - (badCount * 12);
  const score = Math.max(0, Math.min(100, scoreRaw));
  setVibeBar(score, vibe);

  recapOut.innerHTML = `
    <b>${escapeHtml(t("recapTitleInline"))}</b><br>
    • ${escapeHtml(t("recapMem"))}: <b>${memoriesCount}</b> • ${escapeHtml(t("recapReact"))}: <b>${reactionsCount}</b><br>
    • ${escapeHtml(t("recapCheck"))}: 😇 <b>${counts.good}</b> / 😐 <b>${counts.ok}</b> / 😤 <b>${counts.bad}</b><br>
    <small>${escapeHtml(t("recapFooter"))}</small>
  `;
}

// ==========================
// Memory of the Day (most reactions in SELECTED_DATE)
// ==========================
function renderMOTD(memories, reactionsByMemory) {
  const dayMems = memories; // already filtered by selected date
  if (!dayMems.length) {
    motdOut.innerHTML = `<small>${escapeHtml(t("motdEmpty"))}</small>`;
    return { motd: null };
  }

  let best = null;
  for (const m of dayMems) {
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

// ==========================
// Pause banner rendering (show only if within 10m of latest pause signal)
// ==========================
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
// Load + render (no blinking) — NOW DATE-AWARE
// ==========================
let lastRenderKey = "";

async function loadAll() {
  try {
    const { start, end } = isoToStartEnd(SELECTED_DATE);

    const [memRes, chkRes, reactRes, sigRes] = await Promise.all([
      supa.from("memories").select("*")
        .eq("room_code", room)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false })
        .limit(120),

      supa.from("checkins").select("*")
        .eq("room_code", room)
        .eq("checkin_date", SELECTED_DATE)
        .order("created_at", { ascending: false })
        .limit(120),

      supa.from("reactions").select("*")
        .eq("room_code", room)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false })
        .limit(1200),

      supa.from("signals").select("*")
        .eq("room_code", room)
        .eq("type", "pause")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    if (memRes.error) throw memRes.error;
    if (chkRes.error) throw chkRes.error;
    if (reactRes.error) throw reactRes.error;
    if (sigRes.error) throw sigRes.error;

    const memories = memRes.data || [];
    const checkins = chkRes.data || [];
    const reactions = reactRes.data || [];
    const pauseSignal = (sigRes.data && sigRes.data[0]) ? sigRes.data[0] : null;

    const memoriesCount = memories.length;

    const reactionsByMemory = {};
    const reactionsCount = reactions.length;

    for (const r of reactions) {
      const memId = String(r.memory_id);
      if (!reactionsByMemory[memId]) reactionsByMemory[memId] = { "❤️": 0, "😂": 0, "⭐": 0, total: 0 };
      if (reactionsByMemory[memId][r.emoji] !== undefined) reactionsByMemory[memId][r.emoji] += 1;
      reactionsByMemory[memId].total += 1;
    }

    updateDashboard(memoriesCount, checkins, reactionsCount);
    updateMoodBoard(checkins);
    updateAwards(memories, checkins, reactionsByMemory);

    lastTipsPool = buildTipsPool(memoriesCount, checkins);
    if (tipsOut && tipsOut.textContent.includes("Loading")) {
      tipsOut.innerHTML = pickRandom(lastTipsPool, 3).map(tip => `<div style="margin:10px 0;">${escapeHtml(tip)}</div>`).join("");
    }

    loadMyMoodSelection(checkins);
    renderMission();

    const { motd } = renderMOTD(memories, reactionsByMemory);
    renderPauseBanner(pauseSignal);

    recapModalKpis.innerHTML = recapOut.innerHTML;
    recapModalMotd.innerHTML = motdOut.innerHTML;
    recapModalAwards.innerHTML = awardsOut.innerHTML;

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

    debug(`✅ Loaded ${SELECTED_DATE}.`);
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

// Start
applyLanguage();
setReadOnlyUI();
setInterval(() => {
  loadAll();
}, 5000);
loadAll();
