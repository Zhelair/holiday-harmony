// ==========================
// Holiday Harmony — app.js (FULL)
// Includes: Memories + Reactions + MOTD + Awards + Dashboard + Vibe Bar + Pause
// Mission + Activity + Chores + Reset Moment
// Sound + Party ambience, EN/RU, Recap modal, Export card
// Quick Tips replaced with Family Bingo (shared via signals)
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

// Export
const exportBtn = document.getElementById("exportBtn");
const exportWrap = document.getElementById("exportWrap");
const exportCard = document.getElementById("exportCard");
const closeExportBtn = document.getElementById("closeExportBtn");
const downloadCardBtn = document.getElementById("downloadCardBtn");
const exportRoomEl = document.getElementById("exportRoom");
const exportDateEl = document.getElementById("exportDate");
const exportSubEl = document.getElementById("exportSub");
const exportKpisEl = document.getElementById("exportKpis");
const exportMotdEl = document.getElementById("exportMotd");
const exportAwardsEl = document.getElementById("exportAwards");

// Bingo
const bingoTitle = document.getElementById("bingoTitle");
const bingoHint = document.getElementById("bingoHint");
const bingoResetBtn = document.getElementById("bingoResetBtn");
const bingoStatus = document.getElementById("bingoStatus");
const bingoGrid = document.getElementById("bingoGrid");
const bingoWin = document.getElementById("bingoWin");

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
function (ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2,"0");
  const ss = String(s % 60)).padStart(2,"0");
  return `${mm}:${ss}`;
}

// --- Fix small typo if any browser chokes:
function msToMmSs(ms){
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2,"0");
  const ss = String(s % 60).padStart(2,"0");
  return `${mm}:${ss}`;
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
// Language (EN/RU)
// ==========================
const i18n = {
  en: {
    soundLabel:"🔊 Sound",
    recapBtn:"📸 Recap",
    exportBtn:"🖼 Export",
    motdTitle:"⭐ Memory of the Day",
    motdHint:"Most loved memory today (by reactions).",
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

    recapTitleInline:"Today recap:",
    recapMem:"Memories",
    recapReact:"Reactions",
    recapCheck:"Check-ins",
    recapFooter:"Vibe meter is… surprisingly accurate 😄",

    moodBoardEmpty:"No one checked in yet. Want to start? 🙂",
    awardsNone:"No awards yet.",
    motdEmpty:"No memories yet today. Add the first warm moment ✨",

    badMemoryId:"Bad memory id (not a number): ",
    reactSelectErr:"REACTION SELECT ERROR:\n",
    reactInsertErr:"REACTION INSERT ERROR:\n",
    reactDeleteErr:"REACTION DELETE ERROR:\n",

    bingoTitle:"🎯 Family Bingo",
    bingoHint:"Tap squares together. Complete a line = Bingo!",
    bingoNew:"🔄 New card (today)",
    bingoDoneBy:"Done by",
    bingoWinner:"🎉 BINGO!",
    bingoWinnerText:"Line completed. Screenshot-worthy moment.",
    bingoLoading:"Loading Bingo…",
  },
  ru: {
    soundLabel:"🔊 Звук",
    recapBtn:"📸 Итог",
    exportBtn:"🖼 Экспорт",
    motdTitle:"⭐ Момент дня",
    motdHint:"Самый любимый момент сегодня (по реакциям).",
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
    motdEmpty:"Сегодня ещё нет моментов. Добавьте первый тёплый момент ✨",

    badMemoryId:"Плохой id (не число): ",
    reactSelectErr:"ОШИБКА SELECT реакций:\n",
    reactInsertErr:"ОШИБКА INSERT реакций:\n",
    reactDeleteErr:"ОШИБКА DELETE реакций:\n",

    bingoTitle:"🎯 Семейное Бинго",
    bingoHint:"Отмечайте вместе. Линия = БИНГО!",
    bingoNew:"🔄 Новая карточка (сегодня)",
    bingoDoneBy:"Отметил(а)",
    bingoWinner:"🎉 БИНГО!",
    bingoWinnerText:"Линия собрана. Самое время для скриншота.",
    bingoLoading:"Загружаю бинго…",
  }
};

function getLang(){ return localStorage.getItem("hh_lang") || "en"; }
function setLang(v){ localStorage.setItem("hh_lang", v); }
let LANG = getLang();
function t(key){ return (i18n[LANG] && i18n[LANG][key]) || i18n.en[key] || key; }

function applyLanguage(){
  document.getElementById("soundLabel").textContent = t("soundLabel");
  recapBtn.textContent = t("recapBtn");
  exportBtn.textContent = t("exportBtn");
  document.getElementById("motdTitle").textContent = t("motdTitle");
  document.getElementById("motdHint").textContent = t("motdHint");
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

  // Bingo
  bingoTitle.textContent = t("bingoTitle");
  bingoHint.textContent = t("bingoHint");
  bingoResetBtn.textContent = t("bingoNew");

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
      ],
      bingo: [
        "Сказать искренний комплимент",
        "Сделать чай/кофе кому-то",
        "Сфоткаться вместе (хоть селфи)",
        "Посмеяться над семейной историей",
        "10 минут прогулки",
        "Помочь на кухне",
        "Поставить музыку и подпеть",
        "Спросить: «Как ты реально?»",
        "Посмотреть 10 минут старых фото",
        "Сказать «Спасибо» (вслух)",
        "Сделать маленькую уборку 5 минут",
        "Дать кому-то выиграть спор 😄",
        "Обнять/пожать руку (по желанию)",
        "Сыграть в мини-игру",
        "Сказать «Я рад(а), что мы вместе»",
        "Не обсуждать тяжёлые темы 30 минут",
        "Вместе выбрать фильм",
        "Похвалить еду",
        "Сделать смешную семейную фразу дня",
        "Принести перекус/фрукт",
        "Поделиться приятным воспоминанием",
        "Сделать добро молча",
        "Сказать «Давай без напряжения»",
        "Сфоткать уютный момент",
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
    ],
    bingo: [
      "Give a sincere compliment",
      "Make tea/coffee for someone",
      "Take a group photo (even a selfie)",
      "Laugh at a family story",
      "10-minute walk",
      "Help in the kitchen",
      "Play a song and sing along",
      "Ask: “How are you really?”",
      "Look at old photos for 10 min",
      "Say “Thank you” out loud",
      "5-minute tidy sprint",
      "Let someone win an argument 😄",
      "Hug/handshake (optional)",
      "Play a tiny game",
      "Say “I’m glad we’re together”",
      "No heavy topics for 30 min",
      "Pick a movie together",
      "Compliment the food",
      "Create a funny phrase of the day",
      "Bring a snack/fruit",
      "Share one warm memory",
      "Do a kind thing quietly",
      "Say “let’s keep it light”",
      "Snap a cozy moment",
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

// ==========================
// Memory of the Day (most reactions today)
// ==========================
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

// ==========================
// Pause banner rendering
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
// Export Card (PNG)
// ==========================
function exportDateLabel() {
  try { return new Date().toLocaleDateString(); } catch { return todayISODate(); }
}
function stripHeavy(html) {
  return String(html || "")
    .replace(/<button[\s\S]*?<\/button>/g, "");
}
function openExportCard() {
  playSound("tap");
  exportRoomEl.textContent = "🏠 " + room;
  exportDateEl.textContent = exportDateLabel();
  exportSubEl.textContent = (LANG === "ru") ? "Итог дня (карточка)" : "Today recap (card)";

  exportKpisEl.innerHTML = stripHeavy(recapOut.innerHTML);
  exportMotdEl.innerHTML = stripHeavy(motdOut.innerHTML);
  exportAwardsEl.innerHTML = stripHeavy(awardsOut.innerHTML);

  exportWrap.style.display = "flex";
}
function closeExportCard() {
  exportWrap.style.display = "none";
}
exportBtn?.addEventListener("click", openExportCard);
closeExportBtn?.addEventListener("click", closeExportCard);
exportWrap?.addEventListener("click", (e) => {
  if (e.target === exportWrap) closeExportCard();
});
downloadCardBtn?.addEventListener("click", async () => {
  playSound("tap");
  if (!window.html2canvas) {
    alert("html2canvas not loaded.");
    return;
  }
  const scale = Math.min(2, window.devicePixelRatio || 1);

  const canvas = await window.html2canvas(exportCard, {
    backgroundColor: "#ffffff",
    scale,
    useCORS: true
  });

  const link = document.createElement("a");
  link.download = `holiday-harmony-${room}-${todayISODate()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  playSound("success");
});

// ==========================
// Bingo (shared via signals)
// ==========================
function seededShuffle(arr, seedStr) {
  const a = [...arr];
  let seed = hashStringToInt(seedStr) || 1;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function bingoStorageKey() {
  return `hh_bingo_seed_${room}_${todayISODate()}`;
}
function getBingoSeed() {
  return localStorage.getItem(bingoStorageKey()) || "";
}
function setBingoSeed(v) {
  localStorage.setItem(bingoStorageKey(), v);
}
function buildBingoCard() {
  const { bingo } = pools();
  const seed = getBingoSeed() || `${room}|${todayISODate()}|base`;
  const picked = seededShuffle(bingo, seed).slice(0, 24);
  const card = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) card.push({ key: "free", text: (LANG === "ru") ? "⭐ СВОБОДНО" : "⭐ FREE", free: true });
    else {
      const idx = i < 12 ? i : i - 1;
      card.push({ key: `b${idx}`, text: picked[idx], free: false });
    }
  }
  return card;
}
async function pushBingoToggle(tileKey, done) {
  const name = ((nameEl?.value || getSavedName()) || "Someone").trim() || "Someone";
  const payload = {
    date: todayISODate(),
    key: tileKey,
    done: !!done,
    by: name
  };
  const { error } = await supa.from("signals").insert([{
    room_code: room,
    type: "bingo",
    payload: JSON.stringify(payload)
  }]);
  if (error) throw error;
}
function parseBingoSignals(signals) {
  const state = {};
  for (const s of (signals || [])) {
    let p = null;
    try { p = JSON.parse(s.payload || "{}"); } catch { p = null; }
    if (!p || p.date !== todayISODate() || !p.key) continue;
    const ts = new Date(s.created_at).getTime();
    if (!state[p.key] || ts > state[p.key].ts) {
      state[p.key] = { done: !!p.done, by: p.by || "", ts };
    }
  }
  state["free"] = { done: true, by: "", ts: Date.now() };
  return state;
}
function computeBingoWin(doneMap) {
  const idxToKey = (n) => (n === 12) ? "free" : `b${n < 12 ? n : n - 1}`;
  const lines = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) row.push(idxToKey(r * 5 + c));
    lines.push(row);
  }
  for (let c = 0; c < 5; c++) {
    const col = [];
    for (let r = 0; r < 5; r++) col.push(idxToKey(r * 5 + c));
    lines.push(col);
  }
  lines.push([idxToKey(0), idxToKey(6), idxToKey(12), idxToKey(18), idxToKey(24)]);
  lines.push([idxToKey(4), idxToKey(8), idxToKey(12), idxToKey(16), idxToKey(20)]);
  for (const line of lines) {
    if (line.every(k => doneMap[k] === true)) return true;
  }
  return false;
}
function microConfetti() {
  const emojis = ["🎉","✨","⭐","🎊","💛"];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.setProperty("--dx", `${(Math.random() * 240 - 120).toFixed(0)}px`);
    el.style.setProperty("--dy", `${(Math.random() * 120).toFixed(0)}px`);
    el.style.setProperty("--rot", `${(Math.random() * 120 - 60).toFixed(0)}deg`);
    el.style.left = `${(Math.random() * 70 + 15).toFixed(0)}%`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}
let lastBingoWon = false;
function renderBingo(card, state) {
  if (!bingoGrid) return;

  const doneMap = {};
  for (const k in state) doneMap[k] = !!state[k].done;

  const won = computeBingoWin(doneMap);

  bingoGrid.innerHTML = card.map(tile => {
    const st = state[tile.key];
    const done = tile.free ? true : !!st?.done;
    const by = st?.by ? ` • ${t("bingoDoneBy")}: ${escapeHtml(st.by)}` : "";
    const cls = `bingoTile ${done ? "bingoDone" : ""} ${tile.free ? "bingoFree" : ""}`;

    return `
      <div class="${cls}" data-bkey="${tile.key}">
        <div>
          <div>${escapeHtml(tile.text)}</div>
          <small style="opacity:.7;">${done && !tile.free ? by : ""}</small>
        </div>
      </div>
    `;
  }).join("");

  if (won) {
    bingoWin.innerHTML = `
      <div class="bingoWinBox">
        <b>${escapeHtml(t("bingoWinner"))}</b><br>
        <small>${escapeHtml(t("bingoWinnerText"))}</small>
      </div>
    `;
    if (!lastBingoWon) microConfetti();
  } else {
    bingoWin.innerHTML = "";
  }
  lastBingoWon = won;
}
bingoResetBtn?.addEventListener("click", () => {
  playSound("tap");
  setBingoSeed(`${room}|${todayISODate()}|${Math.random().toString(16).slice(2)}`);
  playSound("success");
  loadAll();
});
bingoGrid?.addEventListener("click", async (e) => {
  const tile = e.target.closest(".bingoTile");
  if (!tile) return;
  const key = tile.getAttribute("data-bkey");
  if (!key || key === "free") return;

  const name = (nameEl.value || "").trim();
  if (!name) return alert(t("pleaseName"));

  try {
    playSound("tap");
    bingoStatus.textContent = t("saving");
    const isDone = tile.classList.contains("bingoDone");
    await pushBingoToggle(key, !isDone);
    playSound("success");
    bingoStatus.textContent = "";
    await loadAll();
  } catch (err) {
    bingoStatus.textContent = "Error: " + (err?.message || String(err));
  }
});

// ==========================
// Load + render (no blinking)
// ==========================
let lastRenderKey = "";

async function loadAll() {
  try {
    const today = todayISODate();
    const todayStr = new Date().toDateString();

    const [memRes, chkRes, reactRes, pauseRes, bingoRes] = await Promise.all([
      supa.from("memories").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(80),
      supa.from("checkins").select("*").eq("room_code", room).eq("checkin_date", today).order("created_at", { ascending: false }).limit(80),
      supa.from("reactions").select("*").eq("room_code", room).order("created_at", { ascending: false }).limit(600),
      supa.from("signals").select("*").eq("room_code", room).eq("type", "pause").order("created_at", { ascending: false }).limit(1),
      supa.from("signals").select("*").eq("room_code", room).eq("type", "bingo").order("created_at", { ascending: false }).limit(500),
    ]);

    if (memRes.error) throw memRes.error;
    if (chkRes.error) throw chkRes.error;
    if (reactRes.error) throw reactRes.error;
    if (pauseRes.error) throw pauseRes.error;
    if (bingoRes.error) throw bingoRes.error;

    const memories = memRes.data || [];
    const checkinsToday = chkRes.data || [];
    const reactions = reactRes.data || [];
    const pauseSignal = (pauseRes.data && pauseRes.data[0]) ? pauseRes.data[0] : null;

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

    // Recap modal content
    recapModalKpis.innerHTML = recapOut.innerHTML;
    recapModalMotd.innerHTML = motdOut.innerHTML;
    recapModalAwards.innerHTML = awardsOut.innerHTML;

    // Bingo render
    bingoStatus.textContent = t("bingoLoading");
    const card = buildBingoCard();
    const bingoState = parseBingoSignals(bingoRes.data || []);
    renderBingo(card, bingoState);
    bingoStatus.textContent = "";

    // Render memories only when changed (prevents flashing)
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

    debug("✅ Connected. Data loaded.");
  } catch (err) {
    debug("❌ Load error: " + (err?.message || String(err)));
  }
}

// Start
applyLanguage();
setInterval(() => loadAll(), 5000);
loadAll();
