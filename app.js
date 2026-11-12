/* ============================================================
   CALISTHENIX — Bodyweight RPG
   Logique applicative : quêtes, XP, niveaux, succès, sauvegarde
   ============================================================ */
"use strict";

/* ------------------------------------------------------------
   1. CONSTANTES
   ------------------------------------------------------------ */
const STORAGE_KEY = "calisthenix.v1";
const VIEWS = ["dashboard", "quests", "library", "profile"];

const LEVELS = {
  debutant: { label: "Débutant", short: "DÉBUTANT", color: "#35ffb0" },
  intermediaire: { label: "Intermédiaire", short: "INTER", color: "#35e0ff" },
  pro: { label: "Pro", short: "PRO", color: "#ff5c86" },
};
const LEVEL_ORDER = ["debutant", "intermediaire", "pro"];

const CLASS_BY_RANK = {
  Recrue: "E", Novice: "D", "Athlète": "C", Guerrier: "B",
  "Maître": "A", "Légende": "S", Mythique: "SS",
};
const rankClass = (rank) => CLASS_BY_RANK[rank] || "E";

const MUSCLES = ["Full body", "Pectoraux", "Dos", "Jambes", "Gainage", "Triceps", "Épaules", "Cardio"];

const XP_BASE = { debutant: 10, intermediaire: 17, pro: 28 };

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`;
const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M10 11v5M14 11v5"/></svg>`;
const LOCK_SVG = `<span class="lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>`;
const SEARCH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>`;
const CLOSE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;

const TONES = {
  lime: "#35e0ff",
  rust: "#ff5c86",
  danger: "#ff2e63",
  neutral: "#7c93a8",
  amber: "#ffc857",
  gold: "#ffc857",
  violet: "#8b5cf6",
  cyan: "#35e0ff",
  olive: "#35ffb0",
};

/* ------------------------------------------------------------
   1 bis. LORE — L'ORDRE DES PORTEURS
   ------------------------------------------------------------ */
const ORDER = {
  name: "Ordre des Porteurs",
  motto: "Poids. Souffle. Silence.",
};

const CHAPTERS = [
  { n: "I", level: 1, title: "L'Éveil du Porteur", quote: "Le premier appui ne porte pas le corps : il réveille la pierre." },
  { n: "II", level: 3, title: "La Garde Basse", quote: "Ce qui plie sans rompre dure plus longtemps que ce qui résiste." },
  { n: "III", level: 5, title: "Le Souffle Compté", quote: "La répétition se gagne à l'expiration, jamais à l'élan." },
  { n: "IV", level: 7, title: "La Colonne", quote: "Un dos droit porte plus qu'un bras fort." },
  { n: "V", level: 9, title: "Le Serment de Fer", quote: "Ce que tu promets au matin, tu le dois au soir." },
  { n: "VI", level: 11, title: "La Garde Haute", quote: "Le corps devient l'arme ; l'esprit, la garde." },
  { n: "VII", level: 13, title: "Le Silence des Salles", quote: "Les maîtres ne crient pas. Ils répètent." },
  { n: "VIII", level: 15, title: "La Marque du Mythique", quote: "On ne voit plus ton travail. On voit ce que tu as bâti." },
];

const RANK_NOTES = {
  Recrue: "Le seuil",
  Novice: "Première garde",
  Athlète: "Le corps répond",
  Guerrier: "La pierre cède",
  Maître: "Le geste juste",
  Légende: "La salle se tait",
  Mythique: "Hors du temps",
};

const BOSSES = [
  {
    name: "La Rouille",
    epithet: "celle qui mange les articulations",
    lore: "Elle s'installe dans les jours sans geste. Chaque quête validée lui retire une écaille.",
  },
  {
    name: "Le Plomb",
    epithet: "le poids que l'on porte sans le savoir",
    lore: "Il se pose sur les épaules au troisième jour d'inaction. Secoue-le avant qu'il ne durcisse.",
  },
  {
    name: "L'Étau",
    epithet: "le silence des salles vides",
    lore: "Il serre les côtes et raccourcit le souffle. On le brise en respirant juste.",
  },
  {
    name: "La Gangue",
    epithet: "la croûte des habitudes mortes",
    lore: "Elle se forme autour du corps qui répète sans progresser. Une quête pro la fend.",
  },
  {
    name: "Le Sédiment",
    epithet: "tout ce qui n'a pas été fait",
    lore: "Il s'accumule doucement, jour après jour. Le geste quotidien le remue.",
  },
  {
    name: "La Cendre",
    epithet: "la fatigue qui se donne des airs de repos",
    lore: "Elle recouvre les braises. Une seule répétition suffit à rallumer.",
  },
];

const OATHS = [
  {
    id: "constance", title: "La Constance", vow: "Douze quêtes cette semaine.",
    metric: "quests", target: 12,
    lore: "Douze gestes, pas un de moins. La constance vaut mieux que l'élan.",
  },
  {
    id: "trois-jours", title: "Les Trois Jours", vow: "Trois jours d'entraînement.",
    metric: "days", target: 3,
    lore: "Trois jours suffisent à faire d'un geste une habitude.",
  },
  {
    id: "volume", title: "Le Volume", vow: "Six cents répétitions.",
    metric: "volume", target: 600,
    lore: "Le corps ne compte pas les jours. Il compte ce qu'on lui donne.",
  },
  {
    id: "garde-haute", title: "La Garde Haute", vow: "Deux quêtes de niveau pro.",
    metric: "pro", target: 2,
    lore: "Deux fois tu iras chercher la pierre là où elle résiste.",
  },
];

const SEALS = [
  { glyph: "I", title: "Le Premier Appui", test: (p) => p.questsDone >= 1 },
  { glyph: "II", title: "Le Jour Parfait", test: (p) => p.perfectDays >= 1 },
  { glyph: "III", title: "La Semaine de Fer", test: (p) => p.bestStreak >= 7 },
  { glyph: "IV", title: "Six Muscles Éveillés", test: (p) => Object.keys(p.musclesDone || {}).length >= 6 },
  { glyph: "V", title: "La Rouille Brisée", test: (p) => p.bossWins >= 1 },
  { glyph: "VI", title: "Le Serment Tenu", test: (p) => p.oathsKept >= 1 },
  { glyph: "VII", title: "Le Millier", test: (p) => p.volume >= 1000 },
  { glyph: "VIII", title: "La Marque", test: (p) => levelInfo(p.xp).level >= 10 },
];

/* ------------------------------------------------------------
   2. BIBLIOTHÈQUE D'EXERCICES (poids du corps)
   ------------------------------------------------------------ */
const LIBRARY = [
  /* --- Débutant --- */
  {
    id: "pompes-inclinees", name: "Pompes inclinées", level: "debutant", muscle: "Pectoraux",
    sets: 3, reps: 8, unit: "reps",
    tip: "Mains sur un support surélevé, corps gainé. La porte d'entrée vers la pompe classique.",
  },
  {
    id: "tractions-australiennes", name: "Tractions australiennes", level: "debutant", muscle: "Dos",
    sets: 3, reps: 8, unit: "reps",
    tip: "Barre basse, corps aligné, tire la poitrine vers la barre sans casser la ligne.",
  },
  {
    id: "squats-chaise", name: "Squats sur chaise", level: "debutant", muscle: "Jambes",
    sets: 3, reps: 12, unit: "reps",
    tip: "Assieds-toi à peine puis relève-toi sans élan. Contrôle la descente.",
  },
  {
    id: "mollets-debout", name: "Mollets debout", level: "debutant", muscle: "Jambes",
    sets: 3, reps: 15, unit: "reps",
    tip: "Monte sur la pointe des pieds, marque une pause en haut, redescends lentement.",
  },
  {
    id: "planche-genoux", name: "Planche sur genoux", level: "debutant", muscle: "Gainage",
    sets: 3, reps: 20, unit: "sec",
    tip: "Genoux au sol, corps droit des épaules aux genoux, nombril rentré.",
  },
  {
    id: "dips-banc", name: "Dips sur banc", level: "debutant", muscle: "Triceps",
    sets: 3, reps: 8, unit: "reps",
    tip: "Mains au bord du banc, coudes vers l'arrière, descends sans forcer les épaules.",
  },
  {
    id: "superman", name: "Superhéros", level: "debutant", muscle: "Dos",
    sets: 3, reps: 12, unit: "reps",
    tip: "Allongé sur le ventre, décolle bras et jambes, tiens 2 secondes en haut.",
  },

  /* --- Intermédiaire --- */
  {
    id: "pompes-classiques", name: "Pompes classiques", level: "intermediaire", muscle: "Pectoraux",
    sets: 4, reps: 12, unit: "reps",
    tip: "Corps en planche, coudes à 45°, la poitrine frôle le sol à chaque rep.",
  },
  {
    id: "tractions-pronation", name: "Tractions pronation", level: "intermediaire", muscle: "Dos",
    sets: 4, reps: 6, unit: "reps",
    tip: "Prise large, menton au-dessus de la barre, sans balancier ni élan.",
  },
  {
    id: "squats-libres", name: "Squats au poids du corps", level: "intermediaire", muscle: "Jambes",
    sets: 4, reps: 20, unit: "reps",
    tip: "Cuisses parallèles au sol, talons ancrés, dos droit, souffle maîtrisé.",
  },
  {
    id: "fentes-avant", name: "Fentes avant", level: "intermediaire", muscle: "Jambes",
    sets: 3, reps: 12, unit: "reps",
    tip: "Grand pas devant, genou arrière vers le sol, buste droit. Alterne les jambes.",
  },
  {
    id: "planche", name: "Planche", level: "intermediaire", muscle: "Gainage",
    sets: 3, reps: 45, unit: "sec",
    tip: "Avant-bras au sol, fessiers serrés, une ligne parfaite des talons à la tête.",
  },
  {
    id: "hollow-body", name: "Hollow body hold", level: "intermediaire", muscle: "Gainage",
    sets: 3, reps: 20, unit: "sec",
    tip: "Bas du dos plaqué au sol, bras et jambes tendus, creuse le ventre sans cambrer.",
  },
  {
    id: "dips-barres", name: "Dips entre barres", level: "intermediaire", muscle: "Triceps",
    sets: 3, reps: 10, unit: "reps",
    tip: "Épaules basses, descente contrôlée, remonte sans verrouiller brutalement.",
  },
  {
    id: "mountain-climbers", name: "Mountain climbers", level: "intermediaire", muscle: "Cardio",
    sets: 4, reps: 30, unit: "sec",
    tip: "Genoux vers la poitrine, rythme rapide, bassin stable et dos plat.",
  },

  /* --- Pro --- */
  {
    id: "pompes-archer", name: "Pompes archer", level: "pro", muscle: "Pectoraux",
    sets: 4, reps: 8, unit: "reps",
    tip: "Un bras fléchi, l'autre tendu : transfère la charge d'un côté puis de l'autre.",
  },
  {
    id: "tractions-lestees", name: "Tractions lestées", level: "pro", muscle: "Dos",
    sets: 4, reps: 5, unit: "reps",
    tip: "Ajoute du poids, garde une amplitude complète et une gaine de béton.",
  },
  {
    id: "pistol-squats", name: "Pistol squats", level: "pro", muscle: "Jambes",
    sets: 3, reps: 6, unit: "reps",
    tip: "Une jambe tendue devant, descente lente. Travaille la cheville et l'équilibre.",
  },
  {
    id: "dragon-flag", name: "Dragon flag", level: "pro", muscle: "Gainage",
    sets: 3, reps: 5, unit: "reps",
    tip: "Corps rigide, descente en un seul bloc depuis les épaules. Contrôle total.",
  },
  {
    id: "muscle-up", name: "Muscle-up", level: "pro", muscle: "Dos",
    sets: 4, reps: 3, unit: "reps",
    tip: "Traction explosive puis passage au-dessus de la barre, les épaules en premier.",
  },
  {
    id: "handstand-pushup", name: "Handstand push-up", level: "pro", muscle: "Épaules",
    sets: 3, reps: 5, unit: "reps",
    tip: "En poirier contre un mur, descends la tête au sol et pousse sans cambrer.",
  },
];

/* ------------------------------------------------------------
   2 bis. PROGRAMME HEBDOMADAIRE
   Sept jours, trois paliers : chaque mouvement s'adapte au niveau.
   ------------------------------------------------------------ */
const PROGRAM = [
  {
    id: "lundi", label: "Lundi", title: "Poussée", kicker: "HAUT DU CORPS",
    lore: "La semaine s'ouvre par la poussée.",
    slots: [
      { variants: ["pompes-inclinees", "pompes-classiques", "pompes-archer"] },
      { variants: ["dips-banc", "dips-barres", "dips-barres"] },
      { variants: ["planche-genoux", "planche", "dragon-flag"] },
    ],
  },
  {
    id: "mardi", label: "Mardi", title: "Tirage", kicker: "DOS & POSTURE",
    lore: "Tire la Porte vers toi avant qu'elle ne t'aspire.",
    slots: [
      { variants: ["tractions-australiennes", "tractions-pronation", "tractions-lestees"] },
      { variants: ["superman", "superman", "superman"] },
      { variants: ["planche-genoux", "hollow-body", "dragon-flag"] },
    ],
  },
  {
    id: "mercredi", label: "Mercredi", title: "Récupération", kicker: "SOUPLESSE & SOUFFLE",
    lore: "Le corps apprend dans le calme. Reste souple.",
    slots: [
      { variants: ["planche-genoux", "planche", "planche"] },
      { variants: ["mountain-climbers", "mountain-climbers", "mountain-climbers"] },
      { variants: ["superman", "hollow-body", "hollow-body"] },
    ],
  },
  {
    id: "jeudi", label: "Jeudi", title: "Bas du corps", kicker: "JAMBES",
    lore: "Les fondations portent tout le reste.",
    slots: [
      { variants: ["squats-chaise", "squats-libres", "pistol-squats"] },
      { variants: ["fentes-avant", "fentes-avant", "fentes-avant"] },
      { variants: ["mollets-debout", "mollets-debout", "mollets-debout"] },
    ],
  },
  {
    id: "vendredi", label: "Vendredi", title: "Force totale", kicker: "FULL BODY",
    lore: "Tout le corps répond, ou rien ne tient.",
    slots: [
      { variants: ["pompes-inclinees", "pompes-classiques", "pompes-archer"] },
      { variants: ["tractions-australiennes", "tractions-pronation", "tractions-lestees"] },
      { variants: ["squats-chaise", "squats-libres", "pistol-squats"] },
      { variants: ["planche-genoux", "planche", "dragon-flag"] },
    ],
  },
  {
    id: "samedi", label: "Samedi", title: "Conditionnement", kicker: "RYTHME",
    lore: "Le souffle court, la garde haute.",
    slots: [
      { variants: ["mountain-climbers", "mountain-climbers", "mountain-climbers"] },
      { variants: ["squats-chaise", "squats-libres", "squats-libres"] },
      { variants: ["dips-banc", "dips-barres", "dips-barres"] },
      { variants: ["planche-genoux", "hollow-body", "hollow-body"] },
    ],
  },
  {
    id: "dimanche", label: "Dimanche", title: "Repos", kicker: "PORTE FERMÉE",
    lore: "La Porte reste close. Marche, étire, respire.",
    slots: [],
  },
];

function programTierIndex() {
  const level = levelInfo(state.profile.xp).level;
  if (level >= 9) return 2;
  if (level >= 4) return 1;
  return 0;
}

function programTierLabel() {
  return ["Débutant", "Intermédiaire", "Pro"][programTierIndex()];
}

function programDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

function programDayPlan(dayIndex) {
  const day = PROGRAM[clamp(parseInt(dayIndex, 10) || 0, 0, PROGRAM.length - 1)];
  const tier = programTierIndex();
  const items = day.slots
    .map((slot) => LIBRARY.find((ex) => ex.id === (slot.variants[tier] || slot.variants[0])))
    .filter(Boolean);
  return { ...day, index: dayIndex, items, xp: items.reduce((sum, ex) => sum + exerciseXp(ex), 0) };
}

function programToday() {
  return programDayPlan(programDayIndex());
}

function programLoadedIds() {
  return new Set(state.tasks.map((task) => task.exerciseId).filter(Boolean));
}

function loadProgramDay(dayIndex) {
  const plan = programDayPlan(dayIndex);
  if (!plan.items.length) {
    showToast({
      icon: "clock",
      title: "Repos planifié",
      desc: "Aucun exercice aujourd'hui. Marche, étire, respire.",
      tone: "neutral",
      duration: 3000,
    });
    return;
  }

  const existing = programLoadedIds();
  const missing = plan.items.filter((ex) => !existing.has(ex.id));
  if (!missing.length) {
    showToast({
      icon: "check",
      title: "Programme déjà chargé",
      desc: `${plan.title} · ${plan.items.length} exercices dans tes quêtes.`,
      tone: "neutral",
      duration: 2800,
    });
    return;
  }

  state.tasks.unshift(...missing.map((ex) => taskFromExercise(ex)));
  save();
  renderAll();
  showToast({
    icon: "route",
    title: "Programme chargé",
    desc: `${plan.title} · ${missing.length} exercice${missing.length > 1 ? "s" : ""} ajouté${missing.length > 1 ? "s" : ""} · +${plan.xp} XP à portée.`,
    tone: "lime",
    duration: 3800,
  });
  beep("add");
}

/* ------------------------------------------------------------
   3. SUCCÈS
   ------------------------------------------------------------ */
const ACHIEVEMENTS = [
  {
    id: "first-sweat", title: "Première sueur",
    desc: "Termine ta toute première quête.", goal: 1,
    value: (p) => p.questsDone,
  },
  {
    id: "streak-3", title: "En feu",
    desc: "Maintiens une série de 3 jours.", goal: 3,
    value: (p) => p.bestStreak,
  },
  {
    id: "streak-7", title: "Semaine de fer",
    desc: "Maintiens une série de 7 jours.", goal: 7,
    value: (p) => p.bestStreak,
  },
  {
    id: "volume-100", title: "Centurion",
    desc: "Cumule 100 répétitions ou secondes.", goal: 100,
    value: (p) => p.volume,
  },
  {
    id: "volume-500", title: "Bête de fer",
    desc: "Cumule 500 répétitions ou secondes.", goal: 500,
    value: (p) => p.volume,
  },
  {
    id: "volume-1500", title: "Titan",
    desc: "Cumule 1 500 répétitions ou secondes.", goal: 1500,
    value: (p) => p.volume,
  },
  {
    id: "level-5", title: "Vétéran",
    desc: "Atteins le niveau 5.", goal: 5,
    value: (p) => levelInfo(p.xp).level,
  },
  {
    id: "level-10", title: "Maître",
    desc: "Atteins le niveau 10.", goal: 10,
    value: (p) => levelInfo(p.xp).level,
  },
  {
    id: "triple-threat", title: "Polyvalent",
    desc: "Termine une quête de chaque niveau.", goal: 3,
    value: (p) => LEVEL_ORDER.filter((l) => p.levelsDone && p.levelsDone[l]).length,
  },
  {
    id: "perfect-day", title: "Journée parfaite",
    desc: "Termine toutes tes quêtes en une journée.", goal: 1,
    value: (p) => p.perfectDays,
  },
  {
    id: "quests-25", title: "Chasseur de quêtes",
    desc: "Termine 25 quêtes au total.", goal: 25,
    value: (p) => p.questsDone,
  },
];

/* ------------------------------------------------------------
   4. UTILITAIRES
   ------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, "0");
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const prefersReduced = () =>
  Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const numberFmt = new Intl.NumberFormat("fr-FR");
const formatNumber = (n) => numberFmt.format(Math.round(Number(n) || 0));

/* Iconographie maison — jamais d'emoji dans le rendu. */
function cxIcon(name, options) {
  return window.CX && typeof CX.icon === "function" ? CX.icon(name, options) : "";
}
function cxSeal(glyph, options) {
  return window.CX && typeof CX.seal === "function" ? CX.seal(glyph, options) : escapeHtml(glyph);
}
function cxMuscle(muscle) {
  return window.CX && typeof CX.muscleIcon === "function" ? CX.muscleIcon(muscle) : "muscle";
}

const ACHIEVEMENT_ICONS = {
  "first-sweat": "spark",
  "streak-3": "flame",
  "streak-7": "flame",
  "volume-100": "muscle",
  "volume-500": "muscle",
  "volume-1500": "crown",
  "level-5": "seal",
  "level-10": "crown",
  "triple-threat": "route",
  "perfect-day": "target",
  "quests-25": "quests",
};

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
function parseKey(key) {
  const [y, m, d] = String(key).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function shiftKey(key, delta) {
  const d = parseKey(key);
  d.setDate(d.getDate() + delta);
  return dayKey(d);
}
function last7Keys() {
  const out = [];
  const base = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function deburr(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function calcXp(level, sets, reps) {
  const base = XP_BASE[level] || 10;
  return base + Math.min(14, Math.round((Number(sets) || 0) * (Number(reps) || 0) / 25));
}

function rankFor(level) {
  if (level >= 15) return "Mythique";
  if (level >= 11) return "Légende";
  if (level >= 9) return "Maître";
  if (level >= 7) return "Guerrier";
  if (level >= 5) return "Athlète";
  if (level >= 3) return "Novice";
  return "Recrue";
}

function levelInfo(totalXp) {
  let level = 1;
  let remaining = Math.max(0, Math.floor(Number(totalXp) || 0));
  let need = 100;
  while (remaining >= need && level < 60) {
    remaining -= need;
    level += 1;
    need = 100 + (level - 1) * 50;
  }
  return {
    level,
    current: remaining,
    need,
    pct: clamp((remaining / need) * 100, 0, 100),
    toNext: Math.max(0, need - remaining),
    rank: rankFor(level),
  };
}

function displayStreak() {
  const p = state.profile;
  if (!p.lastCompletionDay) return 0;
  const today = dayKey();
  if (p.lastCompletionDay === today || p.lastCompletionDay === shiftKey(today, -1)) return p.streak || 0;
  return 0;
}

function exerciseXp(ex) {
  return calcXp(ex.level, ex.sets, ex.reps);
}

/* ------------------------------------------------------------
   4 bis. SEMAINE, LORE ET MÉCANIQUES DE JEU
   ------------------------------------------------------------ */
function weekStartKey(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - offset);
  return dayKey(d);
}

function weekKeys() {
  const start = weekStartKey();
  const today = dayKey();
  const out = [];
  for (let i = 0; i < 7; i++) {
    const key = shiftKey(start, i);
    if (key <= today) out.push(key);
  }
  return out;
}

function weekNumber() {
  return Math.floor(parseKey(weekStartKey()).getTime() / 604800000);
}

/* Numéro de semaine ISO 8601 (1–53), pour l'affichage seulement.
   weekNumber() reste le germe de rotation des serments. */
function isoWeekNumber(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset + 3); // jeudi de la semaine
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstOffset = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstOffset + 3);
  return 1 + Math.round((d - firstThursday) / 604800000);
}

function hashString(value) {
  let hash = 2166136261;
  const str = String(value);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function weekLabel() {
  const start = parseKey(weekStartKey());
  const end = parseKey(shiftKey(weekStartKey(), 6));
  const month = end.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  return `${start.getDate()}–${end.getDate()} ${month}`;
}

function weekStats() {
  return weekKeys().reduce((acc, key) => {
    const entry = state.history[key];
    if (!entry) return acc;
    acc.xp += Number(entry.xp) || 0;
    acc.quests += Number(entry.tasks) || 0;
    acc.volume += Number(entry.volume) || 0;
    if ((Number(entry.tasks) || 0) > 0) acc.days += 1;
    if (entry.levels) acc.pro += Number(entry.levels.pro) || 0;
    return acc;
  }, { xp: 0, quests: 0, volume: 0, days: 0, pro: 0 });
}

function currentChapter(level = levelInfo(state.profile.xp).level) {
  const unlocked = CHAPTERS.filter((chapter) => chapter.level <= level);
  return unlocked[unlocked.length - 1] || CHAPTERS[0];
}

function nextChapter(level) {
  return CHAPTERS.find((chapter) => chapter.level > level) || null;
}

function currentBoss() {
  const p = state.profile;
  const level = levelInfo(p.xp).level;
  const weekKey = weekStartKey();
  const seed = hashString("rouille-" + weekKey);
  const base = BOSSES[seed % BOSSES.length];
  const maxHp = Math.round((240 + level * 45) / 10) * 10;
  const stats = weekStats();
  const claimed = Boolean(p.weekClaims[weekKey] && p.weekClaims[weekKey].boss);
  const defeated = stats.xp >= maxHp;
  return {
    ...base,
    weekKey,
    maxHp,
    damage: stats.xp,
    pct: clamp(Math.round((stats.xp / maxHp) * 100), 0, 100),
    claimed,
    defeated,
    daysLeft: 6 - ((new Date().getDay() + 6) % 7),
    bonus: Math.round((45 + level * 6) / 5) * 5,
  };
}

function oathChoices() {
  const start = weekNumber() % OATHS.length;
  return [OATHS[start], OATHS[(start + 1) % OATHS.length], OATHS[(start + 2) % OATHS.length]];
}

function activeOath() {
  const p = state.profile;
  const week = weekStartKey();
  if (!p.oath || p.oath.week !== week || !p.oath.id) return null;
  return OATHS.find((oath) => oath.id === p.oath.id) || null;
}

function oathProgress(oath) {
  const stats = weekStats();
  return clamp(Number(stats[oath.metric]) || 0, 0, oath.target);
}

function attributeTier(value) {
  if (value >= 100) return "Sceau d'or";
  if (value >= 75) return "Maître";
  if (value >= 50) return "Aguerri";
  if (value >= 25) return "Confirmé";
  if (value > 0) return "Apprenti";
  return "Intact";
}

function attributes() {
  const p = state.profile;
  const trainedDays = Object.keys(state.history || {})
    .filter((key) => (Number(state.history[key] && state.history[key].tasks) || 0) > 0).length;
  const muscles = Object.keys(p.musclesDone || {}).length;
  const list = [
    { id: "force", name: "Force", raw: p.volume / 15, note: `${formatNumber(p.volume)} répétition${p.volume > 1 ? "s" : ""} gravée${p.volume > 1 ? "s" : ""}` },
    { id: "souffle", name: "Souffle", raw: (p.bestStreak || 0) * 9 + (p.perfectDays || 0) * 5, note: `Série record : ${p.bestStreak || 0} jour${(p.bestStreak || 0) > 1 ? "s" : ""}` },
    { id: "souplesse", name: "Souplesse", raw: muscles * 12, note: `${muscles} / ${MUSCLES.length} muscles éveillés` },
    { id: "discipline", name: "Discipline", raw: trainedDays * 1.6, note: `${trainedDays} jour${trainedDays > 1 ? "s" : ""} de pratique` },
  ];
  return list.map((attr) => {
    const value = clamp(Math.round(attr.raw), 0, 100);
    return { ...attr, value, tier: attributeTier(value) };
  });
}

function resolveWeeklyRewards() {
  const p = state.profile;
  const weekKey = weekStartKey();
  if (!p.weekClaims[weekKey]) p.weekClaims[weekKey] = {};
  const claims = p.weekClaims[weekKey];
  const rewards = [];

  const boss = currentBoss();
  if (boss.defeated && !claims.boss) {
    claims.boss = true;
    p.xp += boss.bonus;
    p.bossWins = (p.bossWins || 0) + 1;
    rewards.push({
      icon: "spark",
      title: `${boss.name} brisée`,
      desc: `Butin de la bête : +${boss.bonus} XP. Un sceau rejoint le codex.`,
      tone: "rust",
      duration: 6200,
    });
  }

  const oath = activeOath();
  if (oath && oathProgress(oath) >= oath.target && !claims.oath) {
    claims.oath = true;
    const bonus = Math.round((35 + levelInfo(p.xp).level * 5) / 5) * 5;
    p.xp += bonus;
    p.oathsKept = (p.oathsKept || 0) + 1;
    rewards.push({
      icon: "seal",
      title: "Serment tenu",
      desc: `« ${oath.vow} » — +${bonus} XP. Le codex s'en souviendra.`,
      tone: "gold",
      duration: 6400,
    });
  }

  const keys = Object.keys(p.weekClaims).sort();
  if (keys.length > 8) keys.slice(0, keys.length - 8).forEach((key) => { delete p.weekClaims[key]; });

  if (rewards.length) save();
  return rewards;
}

function takeOath(id) {
  if (activeOath()) return;
  const choice = oathChoices().find((oath) => oath.id === id);
  if (!choice) return;
  state.profile.oath = { week: weekStartKey(), id };
  save();
  const rewards = resolveWeeklyRewards();
  renderAll();
  showToast({ icon: "seal", title: "Serment prêté", desc: `${choice.vow} Le codex veille.`, tone: "gold", duration: 4600 });
  beep("achievement");
  rewards.forEach((reward, index) => {
    window.setTimeout(() => {
      showToast(reward);
      beep("achievement");
    }, 600 + index * 700);
  });
}

function floatXp(amount, position) {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!position || state.settings.reducedFx || reduceMotion) return;
  const el = document.createElement("span");
  el.className = "xp-float";
  el.textContent = `+${amount} XP`;
  el.style.left = `${position.x}px`;
  el.style.top = `${position.y}px`;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 1100);
}

function pulseBoss() {
  const panel = document.querySelector(".dock-threat");
  if (!panel) return;
  panel.classList.remove("is-hit");
  /* force le redémarrage de l'animation */
  void panel.offsetWidth;
  panel.classList.add("is-hit");
  window.setTimeout(() => panel.classList.remove("is-hit"), 620);
}

/* ------------------------------------------------------------
   4 ter. CHASSE — COMBAT DE BÊTE
   ------------------------------------------------------------ */
let huntState = null;
const huntTimers = [];

function huntClearTimers() {
  while (huntTimers.length) window.clearTimeout(huntTimers.pop());
}

function huntLater(fn, delay) {
  const id = window.setTimeout(() => {
    const index = huntTimers.indexOf(id);
    if (index >= 0) huntTimers.splice(index, 1);
    fn();
  }, delay);
  huntTimers.push(id);
  return id;
}

function threatLabel(maxHp) {
  return ["I", "II", "III", "IV", "V"][clamp(Math.ceil(maxHp / 260), 1, 5) - 1];
}

function beastSVG() {
  return `
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <circle class="bs-vein" cx="160" cy="160" r="152"/>
      <circle class="bs-vein" cx="160" cy="160" r="140" stroke-dasharray="1 9"/>
      <path class="bs-spike-fill" opacity=".26" d="M160 16 186 62 208 44 202 82 246 76 224 116 262 130 226 152 250 184 212 186 226 224 196 204 196 246 168 214 160 258 152 214 124 246 124 204 94 224 108 186 70 184 94 152 58 130 96 116 74 76 118 82 112 44 134 62Z"/>
      <path class="bs-limb" d="M108 214c-24 14-38 34-42 60"/>
      <path class="bs-limb" d="M212 214c24 14 38 34 42 60"/>
      <path class="bs-limb" d="M120 96c-18-18-30-38-32-62"/>
      <path class="bs-limb" d="M200 96c18-18 30-38 32-62"/>
      <path class="bs-body" d="M160 58 238 100 254 172 214 248 160 276 106 248 66 172 82 100Z"/>
      <path class="bs-spike-fill" d="M160 40 176 78 160 92 144 78Z"/>
      <path class="bs-spike-fill" d="M92 108 108 126 88 138 78 122Z"/>
      <path class="bs-spike-fill" d="M228 108 212 126 232 138 242 122Z"/>
      <path class="bs-eye-glow" d="M104 142 146 132 138 158 108 160Z"/>
      <path class="bs-eye-glow" d="M216 142 174 132 182 158 212 160Z"/>
      <path class="bs-vein" d="M160 92v44M160 136l-22 18 14 20-10 24M160 136l24 20-12 22 10 26"/>
      <path class="bs-vein" d="M84 176l28 6 12-10 18 10M236 176l-28 6-12-10-18 10"/>
      <path class="bs-vein" d="M126 244l12-26 22 12 22-12 12 26"/>
      <circle class="bs-heart" cx="160" cy="196" r="6"/>
    </svg>
  `;
}

function huntCalloutHTML() {
  if (!huntState) return "";
  const { boss, phase } = huntState;
  if (phase === "scan") {
    return "<b>Analyse de la menace</b><span>Lecture des motifs de la Porte…</span>";
  }
  if (phase === "shatter") {
    return "<b>Brisure</b><span>La Porte se referme. Le sceau se grave.</span>";
  }
  if (boss.defeated) {
    return "<b>La bête est à terre</b><span>Porte le coup final — trois frappes pour sceller la Porte.</span>";
  }
  const remaining = Math.max(0, boss.maxHp - boss.damage);
  return `<b>Il reste ${formatNumber(remaining)} dégâts</b><span>Termine tes quêtes de la semaine pour briser la bête.</span>`;
}

function huntActionsHTML() {
  if (!huntState) return "";
  if (huntState.phase === "scan") {
    return `<button class="btn btn-ghost" type="button" data-action="hunt-close">Interrompre le scan</button>`;
  }
  if (huntState.phase !== "assault") return "";
  if (huntState.boss.defeated) {
    return `
      <button class="btn btn-lime" type="button" data-action="hunt-strike">${cxIcon("blade")}<span>Frapper</span></button>
      <button class="btn btn-ghost" type="button" data-action="hunt-close">Reculer</button>
    `;
  }
  return `
    <button class="btn btn-lime" type="button" data-action="hunt-quests">Retourner aux quêtes</button>
    <button class="btn btn-ghost" type="button" data-action="hunt-close">Reculer</button>
  `;
}

function huntStripHTML(boss) {
  return `
    <div class="hunt-grid" aria-hidden="true"></div>
    <span class="hunt-corner hunt-corner--tl" aria-hidden="true"></span>
    <span class="hunt-corner hunt-corner--tr" aria-hidden="true"></span>
    <span class="hunt-corner hunt-corner--bl" aria-hidden="true"></span>
    <span class="hunt-corner hunt-corner--br" aria-hidden="true"></span>
    <button class="hunt-quit" type="button" data-action="hunt-close" aria-label="Quitter le combat">${CLOSE_SVG}</button>
    <div class="hunt-top">
      <div>
        <span class="hunt-code">PORTE // ${escapeHtml(boss.weekKey)} // SECTEUR 07</span>
        <span class="hunt-kicker"><i></i> ${boss.defeated ? "BÊTE BRISÉE" : "COMBAT EN COURS"}</span>
        <h2 class="hunt-title" id="huntTitle">${escapeHtml(boss.name)}</h2>
        <p class="hunt-epithet">${escapeHtml(boss.epithet)}</p>
      </div>
      <div class="hunt-threat">
        <span>MENACE</span>
        <b>${threatLabel(boss.maxHp)}</b>
      </div>
    </div>
    <div class="hunt-stage" id="huntStage">
      <span class="beast-floor" aria-hidden="true"></span>
      <div class="hunt-beast" id="huntBeast">${beastSVG()}</div>
      <div class="hunt-scanbeam" aria-hidden="true"></div>
      <div class="hunt-callout" id="huntCallout">${huntCalloutHTML()}</div>
      <div class="hunt-flash" id="huntFlash" aria-hidden="true"></div>
    </div>
    <div class="hunt-bottom">
      <div class="hunt-hpwrap">
        <span class="hunt-hp-label">${boss.defeated ? "VITALITÉ // REPLAY" : "VITALITÉ RESTANTE"}</span>
        <div class="hunt-hpbar" id="huntHpbar" role="progressbar" aria-valuemin="0" aria-valuemax="${boss.maxHp}"
          aria-valuenow="${Math.max(0, boss.maxHp - boss.damage)}" aria-label="Vitalité de ${escapeHtml(boss.name)}">
          <i id="huntHpFill"></i>
        </div>
        <span class="hunt-hp-value" id="huntHpValue"></span>
      </div>
      <div class="hunt-actions" id="huntActions">${huntActionsHTML()}</div>
      <p class="hunt-note">Chaque quête validée frappe la bête · <b>une seule bête par semaine</b></p>
    </div>
  `;
}

function renderHunt() {
  const frame = $("huntFrame");
  if (!frame || !huntState) return;
  frame.innerHTML = huntStripHTML(huntState.boss);
  frame.classList.toggle("hunt-scanning", huntState.phase === "scan");
  frame.classList.toggle("is-shaking", false);
  updateHuntBars();
}

function updateHuntBars() {
  if (!huntState) return;
  const pct = huntState.maxHp > 0 ? clamp((huntState.hp / huntState.maxHp) * 100, 0, 100) : 0;
  const fill = $("huntHpFill");
  const value = $("huntHpValue");
  const bar = $("huntHpbar");
  if (fill) fill.style.setProperty("--pct", `${pct.toFixed(1)}%`);
  if (value) value.textContent = `${formatNumber(huntState.hp)} / ${formatNumber(huntState.maxHp)}`;
  if (bar) bar.setAttribute("aria-valuenow", String(Math.round(huntState.hp)));
}

function huntDamagePop(amount, crit) {
  const stage = $("huntStage");
  if (!stage) return;
  const pop = document.createElement("span");
  pop.className = `hunt-damage${crit ? " crit" : ""}`;
  pop.textContent = `−${formatNumber(amount)}`;
  pop.style.left = "50%";
  pop.style.top = "30%";
  stage.appendChild(pop);
  window.setTimeout(() => pop.remove(), 1150);
}

function huntShatter() {
  if (!huntState) return;
  huntState.phase = "shatter";
  const frame = $("huntFrame");
  const stage = $("huntStage");
  const beast = $("huntBeast");
  const flash = $("huntFlash");
  const callout = $("huntCallout");
  const actions = $("huntActions");

  if (frame) {
    frame.classList.remove("hunt-scanning");
    frame.classList.add("is-shaking");
    window.setTimeout(() => frame.classList.remove("is-shaking"), 300);
  }
  if (beast) beast.classList.add("is-shattered");
  if (flash) {
    flash.classList.remove("is-on");
    void flash.offsetWidth;
    flash.classList.add("is-on");
  }
  if (callout) callout.innerHTML = huntCalloutHTML();
  if (actions) actions.innerHTML = "";

  if (stage && !prefersReduced()) {
    const colors = ["#ff8aa8", "#ff2e63", "#ffc857", "#8bf2ff", "#8b5cf6"];
    for (let i = 0; i < 20; i++) {
      const shard = document.createElement("i");
      shard.className = "shard";
      shard.style.setProperty("--w", `${4 + Math.random() * 8}px`);
      shard.style.setProperty("--h", `${8 + Math.random() * 16}px`);
      shard.style.setProperty("--tx", `${-180 + Math.random() * 360}px`);
      shard.style.setProperty("--ty", `${-170 + Math.random() * 300}px`);
      shard.style.setProperty("--rot", `${-240 + Math.random() * 480}deg`);
      shard.style.background = `linear-gradient(160deg, ${colors[i % colors.length]}, #ff2e63)`;
      stage.appendChild(shard);
      window.setTimeout(() => shard.remove(), 1250);
    }
  }

  beep("shatter");
  huntLater(() => {
    if (!huntState) return;
    huntState.phase = "loot";
    renderHuntLoot();
  }, prefersReduced() ? 320 : 1150);
}

function renderHuntLoot() {
  const frame = $("huntFrame");
  if (!frame || !huntState) return;
  const boss = huntState.boss;
  const rewards = resolveWeeklyRewards();
  huntState.rewards = rewards;
  const claimedNow = rewards.some((reward) => String(reward.title).includes(boss.name));
  const sealUnlocked = (state.profile.bossWins || 0) > 0;
  const loot = document.createElement("div");
  loot.className = "hunt-loot";
  loot.innerHTML = `
    <div class="hunt-loot-card">
      <span class="hunt-loot-kicker">PORTE SCELLÉE // BUTIN</span>
      <h3>Bête brisée</h3>
      <p class="hunt-loot-sub">${escapeHtml(boss.name)} — ${escapeHtml(boss.epithet)}</p>
      <div class="hunt-loot-grid">
        <div class="hunt-loot-item"><span>XP</span><b>+${formatNumber(boss.bonus)}</b></div>
        <div class="hunt-loot-item"><span>SCEAU</span><b>${sealUnlocked ? "I" : "—"}</b></div>
        <div class="hunt-loot-item"><span>DÉGÂTS</span><b>${formatNumber(boss.damage)}</b></div>
      </div>
      <p class="hunt-loot-sub">${claimedNow
        ? "Butin versé au codex."
        : "Butin déjà versé cette semaine · une seule bête par semaine."}</p>
      <button class="btn btn-lime" type="button" data-action="hunt-close">Retour au QG</button>
    </div>
  `;
  frame.appendChild(loot);
  beep("achievement");
  const focusTarget = loot.querySelector("[data-action='hunt-close']");
  if (focusTarget) window.setTimeout(() => focusTarget.focus(), 120);
}

function openHunt() {
  const boss = currentBoss();
  if (!boss) return;
  huntClearTimers();
  const startHp = boss.defeated ? boss.maxHp : Math.max(0, boss.maxHp - boss.damage);
  huntState = { boss, phase: "scan", hp: startHp, maxHp: boss.maxHp, rewards: [] };

  const overlay = $("hunt");
  if (!overlay) return;
  rememberOverlayFocus("hunt");
  overlay.hidden = false;
  document.body.classList.add("no-scroll");
  syncModalState();
  renderHunt();
  beep("scan");
  huntLater(() => {
    if (!huntState) return;
    huntState.phase = "assault";
    renderHunt();
    beep("engage");
    const firstAction = overlay.querySelector("#huntActions .btn");
    if (firstAction) firstAction.focus({ preventScroll: true });
  }, prefersReduced() ? 320 : 1700);

  const quit = overlay.querySelector(".hunt-quit");
  if (quit) window.setTimeout(() => quit.focus(), 140);
}

function closeHunt() {
  const overlay = $("hunt");
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  const frame = $("huntFrame");
  if (frame) frame.innerHTML = "";
  huntClearTimers();
  const rewards = huntState && Array.isArray(huntState.rewards) ? huntState.rewards : [];
  huntState = null;
  if ($("levelUp") && !$("levelUp").hidden) {
    // le splash de niveau gère encore le verrou de défilement
  } else {
    document.body.classList.remove("no-scroll");
  }
  renderAll();
  syncModalState();
  restoreOverlayFocus("hunt");
  rewards.forEach((reward, index) => {
    window.setTimeout(() => {
      showToast(reward);
      beep("achievement");
    }, 320 + index * 650);
  });
}

function huntStrike() {
  if (!huntState || huntState.phase !== "assault" || !huntState.boss.defeated) return;
  const chunk = Math.max(1, Math.ceil(huntState.maxHp / 3));
  huntState.hp = Math.max(0, huntState.hp - chunk);

  const frame = $("huntFrame");
  const beast = $("huntBeast");
  const flash = $("huntFlash");
  if (beast) {
    beast.classList.remove("is-hit");
    void beast.offsetWidth;
    beast.classList.add("is-hit");
  }
  if (frame) {
    frame.classList.add("is-shaking");
    window.setTimeout(() => frame.classList.remove("is-shaking"), 260);
  }
  if (flash) {
    flash.classList.remove("is-on");
    void flash.offsetWidth;
    flash.classList.add("is-on");
  }
  huntDamagePop(chunk, huntState.hp === 0);
  updateHuntBars();
  beep("hit");

  if (huntState.hp <= 0) huntShatter();
}

/* ------------------------------------------------------------
   4 ter. JOURNAL DE SÉANCES, RECORDS
   ------------------------------------------------------------ */
const SESSION_LOG_MAX = 60;

function recordKey(task) {
  if (task.exerciseId) return task.exerciseId;
  const slug = String(task.name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `n:${slug || "quete"}`;
}

function updateRecords(task) {
  if (!state.records || typeof state.records !== "object" || Array.isArray(state.records)) state.records = {};
  const key = recordKey(task);
  const today = dayKey();
  const volume = task.sets * task.reps;
  const unit = task.unit === "sec" ? "sec" : "reps";
  const rec = state.records[key] || (state.records[key] = {
    name: task.name,
    unit,
    bestReps: 0,
    bestSets: 0,
    bestVolume: 0,
    volumeReps: 0,
    volumeSets: 0,
    count: 0,
    firstDay: today,
    lastDay: today,
  });
  rec.name = task.name;
  rec.unit = unit;
  rec.count = (rec.count || 0) + 1;
  rec.lastDay = today;
  if (!rec.firstDay) rec.firstDay = today;
  if (task.reps > (rec.bestReps || 0)) rec.bestReps = task.reps;
  if (task.sets > (rec.bestSets || 0)) rec.bestSets = task.sets;
  if (volume > (rec.bestVolume || 0)) {
    rec.bestVolume = volume;
    rec.volumeReps = task.reps;
    rec.volumeSets = task.sets;
  }
}

function recordList() {
  const records = state.records && typeof state.records === "object" ? state.records : {};
  return Object.keys(records)
    .map((key) => ({ key, ...records[key] }))
    .sort((a, b) => (b.bestVolume || 0) - (a.bestVolume || 0));
}

function sessionLogEntry(info, items) {
  const endedAt = Date.now();
  const startedAt = sessionState ? sessionState.startedAt : endedAt;
  return {
    id: uid(),
    day: dayKey(),
    startedAt,
    endedAt,
    duration: Math.max(0, Math.round((endedAt - startedAt) / 1000)),
    xp: info.xp,
    quests: info.quests,
    sets: info.sets,
    items,
  };
}

function formatMinutes(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  if (total < 60) return `${total} s`;
  const min = Math.round(total / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${h} h ${pad2(rest)}` : `${h} h`;
}

function shortDay(key) {
  if (typeof key !== "string" || key.length < 10) return "—";
  const [, m, d] = key.split("-");
  return `${d}.${m}`;
}

/* ------------------------------------------------------------
   4 quater. SÉANCE GUIDÉE — SÉRIES ET MINUTEUR DE REPOS
   ------------------------------------------------------------ */
const SESSION_RING_C = 2 * Math.PI * 54;
let sessionState = null;
let sessionTimer = null;

function sessionRestSeconds() {
  return clamp(parseInt(state.settings.rest, 10) || 60, 15, 300);
}

function sessionQueue() {
  const today = dayKey();
  return state.tasks.filter((task) => task.doneDate !== today);
}

function sessionTask() {
  if (!sessionState) return null;
  return state.tasks.find((task) => task.id === sessionState.queue[sessionState.index]) || null;
}

function sessionDurationLabel(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${pad2(total % 60)}`;
}

function sessionPhaseLabel() {
  if (!sessionState) return "";
  return {
    work: "EFFORT EN COURS",
    rest: "RÉCUPÉRATION",
    questDone: "OBJECTIF ATTEINT",
    summary: "SÉANCE CLOSE",
  }[sessionState.phase] || "SÉANCE";
}

function sessionTopHTML() {
  const total = sessionState.queue.length;
  const done = clamp(sessionState.quests, 0, total);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `
    <div class="session-grid" aria-hidden="true"></div>
    <span class="session-corner session-corner--tl" aria-hidden="true"></span>
    <span class="session-corner session-corner--tr" aria-hidden="true"></span>
    <span class="session-corner session-corner--bl" aria-hidden="true"></span>
    <span class="session-corner session-corner--br" aria-hidden="true"></span>
    <button class="session-quit" type="button" data-action="session-quit" aria-label="Quitter la séance">${CLOSE_SVG}</button>
    <header class="session-top">
      <div class="session-top-l">
        <span class="session-code">SÉANCE // ${dayKey()} // SECTEUR 07</span>
        <span class="session-phase"><i></i> ${sessionPhaseLabel()}</span>
      </div>
      <div class="session-progress-wrap">
        <span class="session-progress-label">OBJECTIFS <b>${done} / ${total}</b></span>
        <span class="session-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
          <i style="width:${pct}%"></i>
        </span>
      </div>
    </header>
  `;
}

function sessionFootHTML() {
  if (!sessionTask()) return "";
  return `
    <footer class="session-foot">
      <span>XP <b>+${formatNumber(sessionState.xp)}</b></span>
      <span>SÉRIES <b>${sessionState.doneSets} / ${sessionState.totalSets}</b></span>
      <span>REPOS <b>${sessionRestSeconds()} s</b></span>
    </footer>
  `;
}

function sessionDotsHTML(task) {
  const dots = Array.from({ length: task.sets }, (_, i) => {
    const state = i < sessionState.setIndex ? "is-done" : i === sessionState.setIndex ? "is-now" : "";
    return `<i class="${state}"></i>`;
  }).join("");
  return `<div class="session-sets" aria-label="Série ${sessionState.setIndex + 1} sur ${task.sets}">${dots}</div>`;
}

function sessionWorkHTML(task) {
  const cfg = LEVELS[task.level] || LEVELS.debutant;
  return `
    <div class="session-head">
      <span class="session-kicker"><i></i> EFFORT // SÉRIE ${sessionState.setIndex + 1} / ${task.sets}</span>
      <h2 class="session-title" id="sessionTitle">${escapeHtml(task.name)}</h2>
      <p class="session-sub"><span class="session-muscle">${cxIcon(cxMuscle(task.muscle))}</span> ${escapeHtml(task.muscle || "Full body")} · ${cfg.label} · +${task.xp} XP</p>
    </div>
    <div class="session-core">
      <div class="session-reps">
        <span>${task.unit === "sec" ? "TENIR" : "RÉPÉTITIONS"}</span>
        <b>${task.reps}</b>
        <em>${task.unit === "sec" ? "secondes par série" : "par série"}</em>
      </div>
      ${sessionDotsHTML(task)}
    </div>
    <div class="session-actions">
      <button class="btn btn-lime" type="button" data-action="session-set">${cxIcon("check", { stroke: 2.2 })}<span>Série terminée</span></button>
      <button class="btn btn-ghost" type="button" data-action="session-skip">Passer cette quête</button>
    </div>
    <p class="session-tip">Espace pour valider · Échap pour quitter</p>
  `;
}

function sessionRestHTML(task) {
  return `
    <div class="session-head">
      <span class="session-kicker"><i></i> RÉCUPÉRATION // SÉRIE ${sessionState.setIndex + 1} / ${task.sets}</span>
      <h2 class="session-title" id="sessionTitle">${escapeHtml(task.name)}</h2>
      <p class="session-sub">La prochaine série arrive. Respire, garde le rythme.</p>
    </div>
    <div class="session-rest">
      <div class="session-ring" id="sessionRing" style="--pct:100%">
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <circle class="sr-track" cx="64" cy="64" r="54"/>
          <circle class="sr-fill" id="sessionRestRing" cx="64" cy="64" r="54"
            stroke-dasharray="${SESSION_RING_C.toFixed(2)}" stroke-dashoffset="0"/>
        </svg>
        <span class="session-rest-count" id="sessionRestCount" role="timer" aria-live="off">${sessionRestSeconds()}</span>
        <span class="session-rest-unit">SEC</span>
      </div>
      ${sessionDotsHTML(task)}
      <p class="session-rest-next">Prochaine série : <b>${task.reps} ${task.unit === "sec" ? "s" : "réps"}</b></p>
    </div>
    <div class="session-actions">
      <button class="btn btn-lime" type="button" data-action="session-rest-skip">Passer le repos</button>
      <div class="session-rest-tune">
        <button class="btn btn-ghost btn-sm" type="button" data-action="session-rest-minus" aria-label="Réduire le repos de 15 secondes">−15 s</button>
        <button class="btn btn-ghost btn-sm" type="button" data-action="session-rest-plus" aria-label="Augmenter le repos de 15 secondes">+15 s</button>
      </div>
    </div>
    <p class="session-tip">Le repos est un outil, pas une pause. Reprends dès que le souffle revient.</p>
  `;
}

function sessionQuestDoneHTML(task) {
  const remaining = Math.max(0, sessionState.queue.length - sessionState.index - 1);
  return `
    <div class="session-done">
      <span class="session-done-kicker">QUÊTE VALIDÉE // SCEAU ENREGISTRÉ</span>
      <div class="session-done-icon" aria-hidden="true">${cxIcon(cxMuscle(task.muscle))}</div>
      <h2 class="session-title" id="sessionTitle">${escapeHtml(task.name)}</h2>
      <p class="session-done-xp">+${task.xp} XP</p>
      <p class="session-done-sub">${remaining > 0
        ? `${remaining} quête${remaining > 1 ? "s" : ""} encore dans la séance.`
        : "Dernière quête de la séance. La bête a encaissé chaque geste."}</p>
    </div>
    <div class="session-actions">
      <button class="btn btn-lime" type="button" data-action="session-next">${remaining > 0 ? "Exercice suivant" : "Voir le bilan"}</button>
      <button class="btn btn-ghost" type="button" data-action="session-quit">Arrêter ici</button>
    </div>
  `;
}

function sessionSummaryHTML() {
  return `
    <div class="session-done">
      <span class="session-done-kicker">SÉANCE CLOSE // BILAN</span>
      <h2 class="session-title" id="sessionTitle">Séance terminée</h2>
      <p class="session-done-sub">Chaque série validée a blessé la bête de la semaine. La séance est consignée dans ton codex.</p>
      <div class="session-summary-grid">
        <div><span>XP GAGNÉ</span><b>+${formatNumber(sessionState.xp)}</b></div>
        <div><span>QUÊTES</span><b>${sessionState.quests} / ${sessionState.queue.length}</b></div>
        <div><span>SÉRIES</span><b>${sessionState.doneSets}</b></div>
        <div><span>DURÉE</span><b>${sessionDurationLabel(Date.now() - sessionState.startedAt)}</b></div>
      </div>
    </div>
    <div class="session-actions">
      <button class="btn btn-lime" type="button" data-action="session-quit">Retour au QG</button>
      <button class="btn btn-ghost" type="button" data-action="session-quests">Voir les quêtes</button>
    </div>
  `;
}

function renderSession() {
  const frame = $("sessionFrame");
  if (!frame || !sessionState) return;
  const task = sessionTask();
  if (!task && sessionState.phase !== "summary") sessionState.phase = "summary";

  let body;
  if (sessionState.phase === "summary") body = sessionSummaryHTML();
  else if (sessionState.phase === "questDone") body = sessionQuestDoneHTML(task);
  else if (sessionState.phase === "rest") body = sessionRestHTML(task);
  else body = sessionWorkHTML(task);

  frame.innerHTML = `${sessionTopHTML()}<main class="session-main">${body}</main>${sessionFootHTML()}`;
  frame.dataset.phase = sessionState.phase;
  if (sessionState.phase === "rest") {
    updateSessionRestUI(Math.max(0, sessionState.restEndsAt - Date.now()));
  }
}

function focusSessionPrimary() {
  const target = document.querySelector("#sessionFrame .session-actions .btn-lime")
    || document.querySelector("#sessionFrame .session-quit");
  if (target) target.focus({ preventScroll: true });
}

function updateSessionRestUI(msLeft) {
  if (!sessionState) return;
  const totalMs = Math.max(1, sessionState.restTotal * 1000);
  const pct = clamp(msLeft / totalMs, 0, 1);
  const left = Math.max(0, Math.ceil(msLeft / 1000));
  const count = $("sessionRestCount");
  const ring = $("sessionRestRing");
  const wrap = $("sessionRing");
  if (count) count.textContent = left;
  if (ring) ring.style.strokeDashoffset = String((1 - pct) * SESSION_RING_C);
  if (wrap) wrap.style.setProperty("--pct", `${(pct * 100).toFixed(1)}%`);
}

function sessionStopTimer() {
  if (sessionTimer) {
    window.clearInterval(sessionTimer);
    sessionTimer = null;
  }
}

function sessionStartTimer() {
  sessionStopTimer();
  sessionTimer = window.setInterval(() => {
    if (!sessionState || sessionState.phase !== "rest") {
      sessionStopTimer();
      return;
    }
    const msLeft = sessionState.restEndsAt - Date.now();
    updateSessionRestUI(msLeft);
    if (msLeft <= 0) {
      sessionStopTimer();
      sessionState.phase = "work";
      renderSession();
      beep("restEnd");
      focusSessionPrimary();
    }
  }, 150);
}

function openSession() {
  if (sessionState) return;
  const overlay = $("session");
  if (!overlay) return;
  const queue = sessionQueue();
  if (!queue.length) {
    showToast({
      icon: "check",
      title: "Séance déjà close",
      desc: "Toutes tes quêtes sont validées. La bête encaisse déjà tes coups.",
      tone: "lime",
      duration: 3600,
    });
    beep("complete");
    return;
  }

  sessionState = {
    queue: queue.map((task) => task.id),
    index: 0,
    setIndex: 0,
    phase: "work",
    startedAt: Date.now(),
    restEndsAt: 0,
    restTotal: sessionRestSeconds(),
    xp: 0,
    quests: 0,
    doneSets: 0,
    items: [],
    totalSets: queue.reduce((sum, task) => sum + task.sets, 0),
  };

  rememberOverlayFocus("session");
  overlay.hidden = false;
  document.body.classList.add("no-scroll");
  syncModalState();
  renderSession();
  beep("engage");
  window.setTimeout(focusSessionPrimary, 120);
}

function sessionStartRest() {
  if (!sessionState) return;
  sessionState.phase = "rest";
  sessionState.restTotal = sessionRestSeconds();
  sessionState.restEndsAt = Date.now() + sessionState.restTotal * 1000;
  renderSession();
  beep("rest");
  sessionStartTimer();
}

function sessionFinishSet() {
  if (!sessionState || sessionState.phase !== "work") return;
  const task = sessionTask();
  if (!task) return;

  sessionState.doneSets = Math.min(sessionState.totalSets, sessionState.doneSets + 1);
  const alreadyDone = task.doneDate === dayKey();
  const isLastSet = sessionState.setIndex + 1 >= task.sets;

  if (isLastSet && !alreadyDone) {
    sessionState.xp += task.xp;
    sessionState.quests += 1;
    sessionState.items.push({
      name: task.name,
      level: task.level,
      muscle: task.muscle,
      sets: task.sets,
      reps: task.reps,
      unit: task.unit,
      xp: task.xp,
    });
    toggleTask(task.id, { x: window.innerWidth / 2, y: window.innerHeight * 0.42 });
    sessionState.phase = "questDone";
    renderSession();
    focusSessionPrimary();
    return;
  }

  if (isLastSet) {
    sessionNextQuest();
    return;
  }

  sessionState.setIndex += 1;
  sessionStartRest();
}

function sessionNextQuest() {
  if (!sessionState) return;
  sessionState.index += 1;
  sessionState.setIndex = 0;
  if (sessionState.index >= sessionState.queue.length) {
    sessionState.phase = "summary";
    renderSession();
    beep("achievement");
    focusSessionPrimary();
    return;
  }
  sessionState.phase = "work";
  renderSession();
  focusSessionPrimary();
}

function sessionSkipQuest() {
  if (!sessionState || sessionState.phase !== "work") return;
  const task = sessionTask();
  if (!task) return;
  const remainingSets = Math.max(0, task.sets - sessionState.setIndex);
  sessionState.totalSets = Math.max(sessionState.doneSets, sessionState.totalSets - remainingSets);
  sessionNextQuest();
}

function sessionSkipRest() {
  if (!sessionState || sessionState.phase !== "rest") return;
  sessionStopTimer();
  sessionState.phase = "work";
  renderSession();
  beep("restEnd");
  focusSessionPrimary();
}

function sessionAdjustRest(delta) {
  if (!sessionState) return;
  const next = clamp(sessionRestSeconds() + delta, 15, 300);
  state.settings.rest = next;
  save();
  if (sessionState.phase === "rest") {
    const msLeft = Math.max(0, sessionState.restEndsAt - Date.now());
    const nextMs = Math.max(1000, msLeft + delta * 1000);
    sessionState.restEndsAt = Date.now() + nextMs;
    sessionState.restTotal = Math.max(1, Math.round(nextMs / 1000));
    updateSessionRestUI(nextMs);
  }
  renderSession();
  updateSessionRestUI(Math.max(0, sessionState.restEndsAt - Date.now()));
  focusSessionPrimary();
}

function closeSession(showFeedback = true) {
  const overlay = $("session");
  if (!overlay || overlay.hidden) return;
  const info = sessionState
    ? {
      xp: sessionState.xp,
      quests: sessionState.quests,
      sets: sessionState.doneSets,
      items: sessionState.items.slice(),
    }
    : { xp: 0, quests: 0, sets: 0, items: [] };

  if (sessionState && info.sets > 0) {
    const entry = sessionLogEntry(info, info.items);
    state.sessions = [entry, ...(Array.isArray(state.sessions) ? state.sessions : [])].slice(0, SESSION_LOG_MAX);
  }

  if (sessionState && sessionState.quests > 0) {
    state.profile.sessions = (state.profile.sessions || 0) + 1;
    const today = dayKey();
    const entry = state.history[today] || (state.history[today] = { xp: 0, tasks: 0, volume: 0 });
    entry.sessions = (entry.sessions || 0) + 1;
  }
  if (sessionState) save();

  sessionStopTimer();
  overlay.hidden = true;
  const frame = $("sessionFrame");
  if (frame) frame.innerHTML = "";
  sessionState = null;

  const levelUp = $("levelUp");
  if (!huntState && (!levelUp || levelUp.hidden)) document.body.classList.remove("no-scroll");
  renderAll();
  syncModalState();
  restoreOverlayFocus("session");

  if (!showFeedback) return;
  if (info.quests > 0) {
    showToast({
      icon: "check",
      title: "Séance clôturée",
      desc: `${info.quests} quête${info.quests > 1 ? "s" : ""} validée${info.quests > 1 ? "s" : ""} · +${info.xp} XP`,
      tone: "lime",
      duration: 3200,
    });
  } else {
    showToast({
      icon: "close",
      title: "Séance interrompue",
      desc: "Rien n'a été validé. Tes quêtes t'attendent.",
      tone: "neutral",
      duration: 2800,
    });
  }
}

/* ------------------------------------------------------------
   5. ÉTAT & SAUVEGARDE
   ------------------------------------------------------------ */
function defaultState() {
  return {
    version: 3,
    profile: {
      name: "Athlète",
      xp: 0,
      questsDone: 0,
      volume: 0,
      streak: 0,
      bestStreak: 0,
      lastCompletionDay: null,
      levelsDone: {},
      perfectDays: 0,
      lastPerfectDay: null,
      achievements: [],
      musclesDone: {},
      bossWins: 0,
      oathsKept: 0,
      sessions: 0,
      weekClaims: {},
      oath: { week: null, id: null },
      createdAt: new Date().toISOString(),
    },
    tasks: [],
    history: {},
    sessions: [],
    records: {},
    settings: { sound: true, rest: 60 },
  };
}

function taskFromExercise(ex) {
  return {
    id: uid(),
    exerciseId: ex.id,
    name: ex.name,
    level: ex.level,
    muscle: ex.muscle,
    sets: ex.sets,
    reps: ex.reps,
    unit: ex.unit,
    icon: cxMuscle(ex.muscle),
    xp: exerciseXp(ex),
    doneDate: null,
    createdAt: Date.now(),
  };
}

function seedState() {
  const s = defaultState();
  const starter = ["pompes-inclinees", "squats-chaise", "planche"];
  s.tasks = starter.map((id, i) => {
    const ex = LIBRARY.find((e) => e.id === id);
    const t = taskFromExercise(ex);
    t.createdAt = Date.now() + i;
    return t;
  });
  return s;
}

function normalizeState(raw) {
  const base = defaultState();
  const merged = { ...base, ...raw };
  merged.profile = { ...base.profile, ...(raw && raw.profile ? raw.profile : {}) };
  delete merged.profile.avatar; // champ jamais rendu, retiré des sauvegardes
  merged.settings = { ...base.settings, ...(raw && raw.settings ? raw.settings : {}) };
  merged.history = raw && raw.history && typeof raw.history === "object" && !Array.isArray(raw.history) ? raw.history : {};
  const sourceTasks = raw && Array.isArray(raw.tasks) ? raw.tasks : [];

  merged.tasks = sourceTasks
    .filter((t) => t && typeof t.name === "string" && t.name.trim())
    .map((t) => {
      const level = LEVELS[t.level] ? t.level : "debutant";
      const sets = clamp(parseInt(t.sets, 10) || 3, 1, 20);
      const reps = clamp(parseInt(t.reps, 10) || 10, 1, 500);
      const muscle = typeof t.muscle === "string" ? t.muscle.slice(0, 30) : "Full body";
      return {
        id: t.id || uid(),
        exerciseId: t.exerciseId || null,
        name: String(t.name).slice(0, 60),
        level,
        muscle,

        sets,
        reps,
        unit: t.unit === "sec" ? "sec" : "reps",
        icon: window.CX && CX.hasIcon && CX.hasIcon(t.icon) ? t.icon : cxMuscle(muscle),
        xp: clamp(parseInt(t.xp, 10) || calcXp(level, sets, reps), 1, 500),
        doneDate: typeof t.doneDate === "string" ? t.doneDate : null,
        createdAt: Number(t.createdAt) || Date.now(),
      };
    });

  merged.profile.xp = Math.max(0, Number(merged.profile.xp) || 0);
  merged.profile.questsDone = Math.max(0, Number(merged.profile.questsDone) || 0);
  merged.profile.volume = Math.max(0, Number(merged.profile.volume) || 0);
  merged.profile.streak = Math.max(0, Number(merged.profile.streak) || 0);
  merged.profile.bestStreak = Math.max(0, Number(merged.profile.bestStreak) || 0);
  merged.profile.perfectDays = Math.max(0, Number(merged.profile.perfectDays) || 0);
  merged.profile.name = String(merged.profile.name || "Athlète").slice(0, 24) || "Athlète";
  merged.profile.levelsDone = merged.profile.levelsDone && typeof merged.profile.levelsDone === "object" && !Array.isArray(merged.profile.levelsDone)
    ? merged.profile.levelsDone
    : {};
  merged.profile.achievements = Array.isArray(merged.profile.achievements)
    ? merged.profile.achievements.filter((id) => ACHIEVEMENTS.some((a) => a.id === id))
    : [];
  merged.profile.musclesDone = merged.profile.musclesDone && typeof merged.profile.musclesDone === "object" && !Array.isArray(merged.profile.musclesDone)
    ? merged.profile.musclesDone
    : {};
  // Rétro-remplissage : les quêtes validées aujourd'hui avant la v2 n'ont pas laissé de muscle.
  const today = dayKey();
  merged.tasks.forEach((task) => {
    if (task.doneDate === today && task.muscle) merged.profile.musclesDone[task.muscle] = true;
  });
  merged.profile.bossWins = Math.max(0, Number(merged.profile.bossWins) || 0);
  merged.profile.oathsKept = Math.max(0, Number(merged.profile.oathsKept) || 0);
  merged.profile.sessions = Math.max(0, Number(merged.profile.sessions) || 0);
  merged.settings.rest = clamp(parseInt(merged.settings.rest, 10) || 60, 15, 300);
  merged.profile.weekClaims = merged.profile.weekClaims && typeof merged.profile.weekClaims === "object" && !Array.isArray(merged.profile.weekClaims)
    ? merged.profile.weekClaims
    : {};
  const oath = merged.profile.oath;
  merged.profile.oath = oath && typeof oath === "object" && typeof oath.week === "string" && typeof oath.id === "string"
    ? { week: oath.week, id: OATHS.some((o) => o.id === oath.id) ? oath.id : null }
    : { week: null, id: null };
  Object.keys(merged.history).forEach((key) => {
    const entry = merged.history[key];
    if (!entry || typeof entry !== "object") delete merged.history[key];
  });

  /* v3 — journal de séances et records personnels (migration douce) */
  merged.sessions = (Array.isArray(raw && raw.sessions) ? raw.sessions : [])
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : uid(),
      day: typeof entry.day === "string" ? entry.day : "",
      startedAt: Math.max(0, Number(entry.startedAt) || 0),
      endedAt: Math.max(0, Number(entry.endedAt) || 0),
      duration: Math.max(0, Math.round(Number(entry.duration) || 0)),
      xp: Math.max(0, Math.round(Number(entry.xp) || 0)),
      quests: Math.max(0, Math.round(Number(entry.quests) || 0)),
      sets: Math.max(0, Math.round(Number(entry.sets) || 0)),
      items: (Array.isArray(entry.items) ? entry.items : [])
        .filter((item) => item && typeof item.name === "string" && item.name.trim())
        .slice(0, 30)
        .map((item) => ({
          name: String(item.name).slice(0, 60),
          level: LEVELS[item.level] ? item.level : "debutant",
          muscle: typeof item.muscle === "string" ? item.muscle.slice(0, 30) : "Full body",
          sets: clamp(parseInt(item.sets, 10) || 1, 1, 20),
          reps: clamp(parseInt(item.reps, 10) || 1, 1, 500),
          unit: item.unit === "sec" ? "sec" : "reps",
          xp: Math.max(0, Math.round(Number(item.xp) || 0)),
        })),
    }))
    .filter((entry) => entry.quests > 0 || entry.sets > 0)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, SESSION_LOG_MAX);

  merged.records = {};
  const rawRecords = raw && raw.records && typeof raw.records === "object" && !Array.isArray(raw.records) ? raw.records : {};
  Object.keys(rawRecords).forEach((key) => {
    const rec = rawRecords[key];
    if (!rec || typeof rec !== "object" || typeof rec.name !== "string" || !rec.name.trim()) return;
    merged.records[key] = {
      name: String(rec.name).slice(0, 60),
      unit: rec.unit === "sec" ? "sec" : "reps",
      bestReps: clamp(parseInt(rec.bestReps, 10) || 0, 0, 500),
      bestSets: clamp(parseInt(rec.bestSets, 10) || 0, 0, 20),
      bestVolume: Math.max(0, Math.round(Number(rec.bestVolume) || 0)),
      volumeReps: clamp(parseInt(rec.volumeReps, 10) || 0, 0, 500),
      volumeSets: clamp(parseInt(rec.volumeSets, 10) || 0, 0, 20),
      count: Math.max(0, Math.round(Number(rec.count) || 0)),
      firstDay: typeof rec.firstDay === "string" ? rec.firstDay : null,
      lastDay: typeof rec.lastDay === "string" ? rec.lastDay : null,
    };
  });
  // Rétro-remplissage : les quêtes déjà validées méritent leur premier record.
  merged.tasks.forEach((task) => {
    if (!task.doneDate) return;
    const key = recordKey(task);
    if (merged.records[key]) return;
    const volume = task.sets * task.reps;
    merged.records[key] = {
      name: task.name,
      unit: task.unit === "sec" ? "sec" : "reps",
      bestReps: task.reps,
      bestSets: task.sets,
      bestVolume: volume,
      volumeReps: task.reps,
      volumeSets: task.sets,
      count: 1,
      firstDay: task.doneDate,
      lastDay: task.doneDate,
    };
  });

  merged.version = base.version;
  return merged;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    return normalizeState(JSON.parse(raw));
  } catch (err) {
    console.warn("[Calisthenix] Sauvegarde illisible, nouvelle partie.", err);
    return seedState();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (window.CX && CX.windows) CX.windows.pulseSave();
    return true;
  } catch (err) {
    console.warn("[Calisthenix] Impossible d'enregistrer les données.", err);
    return false;
  }
}

/* ------------------------------------------------------------
   6. ÉTAT GLOBAL + UI (non persisté)
   ------------------------------------------------------------ */
let state = loadState();

const ui = {
  view: "dashboard",
  questFilter: "all",
  libLevel: "all",
  libSearch: "",
  formLevel: "intermediaire",
  today: dayKey(),
};

let audioCtx = null;
let levelUpTimer = null;

/* ------------------------------------------------------------
   7. SON
   ------------------------------------------------------------ */
function beep(kind = "complete") {
  if (!state.settings.sound) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const notes = {
      complete: [660, 880],
      add: [523.25],
      achievement: [784, 988, 1175],
      levelup: [523.25, 659.25, 783.99, 1046.5],
      undo: [330, 247],
      error: [220, 185],
      scan: [880, 1174.66, 1567.98],
      engage: [196, 293.66, 392],
      hit: [146.83, 110, 73.42],
      shatter: [220, 146.83, 98, 55],
      rest: [523.25, 392],
      restEnd: [659.25, 880, 1046.5],
    }[kind] || [440];
    const wave = kind === "hit" || kind === "shatter" ? "sawtooth"
      : kind === "scan" ? "triangle"
        : "sine";
    const peak = kind === "hit" ? 0.1 : kind === "shatter" ? 0.09 : 0.075;
    const now = audioCtx.currentTime;
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      const start = now + i * (kind === "hit" ? 0.035 : 0.075);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(kind === "undo" ? 0.045 : peak, start + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (kind === "shatter" ? 0.42 : 0.24));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + (kind === "shatter" ? 0.46 : 0.26));
    });
  } catch (err) {
    /* Le son est un bonus : on ignore les erreurs audio. */
  }
}

/* ------------------------------------------------------------
   8. TOASTS
   ------------------------------------------------------------ */
function toastIcon(icon, title, tone) {
  if (!window.CX || typeof CX.icon !== "function") return escapeHtml(icon);
  if (CX.hasIcon(icon)) return CX.icon(icon);

  const text = String(title || "").toLowerCase();
  const rules = [
    [/export/, "download"],
    [/import|sauvegarde|restaur/, "upload"],
    [/serment/, "seal"],
    [/succès|sceau|niveau|rang|chapitre|titan|maître/, "crown"],
    [/quête|journal|programme|arsenal/, "quests"],
    [/séance|repos|minuteur|interrompue/, "clock"],
    [/nom|profil|porteur/, "user"],
    [/annul|impossible|trop court|invalide|bloqu/, "shield"],
    [/série|feu|flamme/, "flame"],
    [/xp|butin|récompense|chasse/, "bolt"],
  ];
  for (const [pattern, name] of rules) {
    if (pattern.test(text)) return CX.icon(name);
  }
  const byTone = {
    danger: "shield",
    amber: "clock",
    gold: "seal",
    violet: "spark",
    neutral: "spark",
    lime: "bolt",
    cyan: "bolt",
  };
  return CX.icon(byTone[tone] || "bolt");
}

function showToast({ icon = "bolt", title = "", desc = "", tone = "lime", action = null, duration = 4000 }) {
  const stack = $("toastStack");
  if (!stack) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.style.setProperty("--toast-color", TONES[tone] || TONES.lime);
  el.innerHTML = `
    <div class="toast-icon">${toastIcon(icon, title, tone)}</div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${desc ? `<div class="toast-desc">${escapeHtml(desc)}</div>` : ""}
      ${action ? `<button class="toast-action" type="button">${escapeHtml(action.label)}</button>` : ""}
    </div>
    <button class="toast-close" type="button" aria-label="Fermer">${CLOSE_SVG}</button>
  `;
  stack.appendChild(el);

  const dismiss = () => {
    if (!el.isConnected) return;
    el.classList.add("out");
    window.setTimeout(() => el.remove(), 300);
  };
  const timer = window.setTimeout(dismiss, duration);

  el.querySelector(".toast-close").addEventListener("click", () => {
    window.clearTimeout(timer);
    dismiss();
  });
  if (action) {
    el.querySelector(".toast-action").addEventListener("click", () => {
      window.clearTimeout(timer);
      dismiss();
      action.onClick();
    });
  }
}

/* ------------------------------------------------------------
   9. NIVEAU SUPÉRIEUR
   ------------------------------------------------------------ */
function showLevelUp(info) {
  const overlay = $("levelUp");
  if (!overlay) return;
  const cls = rankClass(info.rank);
  $("luLevel").textContent = info.level;
  $("levelUpTitle").textContent = info.rank;
  const chapter = currentChapter(info.level);
  const kicker = $("luKicker");
  const rankLine = $("luRank");
  const quote = $("luQuote");
  const classEl = $("luClass");
  if (kicker) kicker.textContent = `NIVEAU ${info.level} · ${ORDER.name.toUpperCase()}`;
  if (classEl) classEl.textContent = `CLASSE ${cls}`;
  if (rankLine) rankLine.textContent = `Chapitre ${chapter.n} — ${chapter.title}`;
  if (quote) quote.textContent = chapter.quote;

  const stats = $("luStats");
  if (stats) {
    stats.innerHTML = attributes().map((attr) => `
      <div class="lu-stat">
        <span>${escapeHtml(attr.name)}</span>
        <b>${attr.value}</b>
      </div>
    `).join("");
  }

  const confetti = $("confetti");
  confetti.innerHTML = "";
  const colors = ["#8bf2ff", "#35e0ff", "#2b7fff", "#8b5cf6", "#ffc857", "#eafcff"];
  for (let i = 0; i < 32; i++) {
    const piece = document.createElement("i");
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--c", colors[i % colors.length]);
    piece.style.setProperty("--d", `${1.5 + Math.random() * 1.7}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.55}s`);
    piece.style.setProperty("--drift", `${-60 + Math.random() * 120}px`);
    piece.style.setProperty("--rot", `${360 + Math.random() * 720}deg`);
    confetti.appendChild(piece);
  }

  rememberOverlayFocus("levelUp");
  overlay.hidden = false;
  document.body.classList.add("no-scroll");
  syncModalState();
  beep("levelup");
  window.clearTimeout(levelUpTimer);
  levelUpTimer = window.setTimeout(closeLevelUp, 9000);

  const focusTarget = overlay.querySelector("[data-close-levelup]");
  if (focusTarget) window.setTimeout(() => focusTarget.focus(), 80);
}

function closeLevelUp() {
  const overlay = $("levelUp");
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  if (!huntState && !sessionState) document.body.classList.remove("no-scroll");
  window.clearTimeout(levelUpTimer);
  syncModalState();
  restoreOverlayFocus("levelUp");
}

/* ------------------------------------------------------------
   9 bis. FOCUS DES OVERLAYS
   Piège de tabulation, focus initial et retour au déclencheur.
   ------------------------------------------------------------ */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const overlayFocusReturn = new Map();

function activeOverlay() {
  return ["levelUp", "hunt", "session"]
    .map((id) => $(id))
    .find((el) => el && !el.hidden) || null;
}

function overlayFocusables(overlay) {
  if (!overlay) return [];
  return Array.from(overlay.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((el) => !el.hidden && el.getClientRects().length > 0);
}

function syncModalState() {
  const open = !!activeOverlay();
  const shell = document.querySelector(".app");
  const skip = document.querySelector(".skip");
  if (shell) shell.inert = open;
  if (skip) skip.inert = open;
}

function rememberOverlayFocus(id) {
  const overlay = $(id);
  if (!overlay || !overlay.hidden) return;
  const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  overlayFocusReturn.set(id, {
    el: trigger,
    action: trigger && trigger.dataset ? trigger.dataset.action || null : null,
    nav: trigger && trigger.dataset ? trigger.dataset.nav || null : null,
  });
}

function restoreOverlayFocus(id) {
  const record = overlayFocusReturn.get(id);
  overlayFocusReturn.delete(id);
  const open = activeOverlay();
  let target = record && record.el && document.contains(record.el) ? record.el : null;
  if (target && target.closest("[inert]")) target = null;
  if (!target && record && record.action) {
    target = document.querySelector(`[data-action="${record.action}"]`);
  }
  if (!target && record && record.nav) {
    target = document.querySelector(`[data-nav="${record.nav}"]`);
  }
  if (target && target.closest("[inert]")) target = null;
  if (!target) target = open ? overlayFocusables(open)[0] : $("main");
  if (target && typeof target.focus === "function") target.focus({ preventScroll: true });
}

function trapOverlayTab(event) {
  const overlay = activeOverlay();
  if (!overlay || event.key !== "Tab") return false;
  const items = overlayFocusables(overlay);
  if (!items.length) {
    event.preventDefault();
    return true;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (!overlay.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus({ preventScroll: true });
    return true;
  }
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
    return true;
  }
  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return true;
  }
  return false;
}

/* ------------------------------------------------------------
   10. SUCCÈS
   ------------------------------------------------------------ */
function checkAchievements() {
  const p = state.profile;
  const unlockedNow = [];
  ACHIEVEMENTS.forEach((a) => {
    if (p.achievements.includes(a.id)) return;
    if (Number(a.value(p)) >= a.goal) {
      p.achievements.push(a.id);
      unlockedNow.push(a);
    }
  });
  if (unlockedNow.length) save();
  return unlockedNow;
}

/* ------------------------------------------------------------
   11. COMPOSANTS DE RENDU
   ------------------------------------------------------------ */
function emptyBlock(iconName, title, text, action) {
  return `
    <div class="empty">
      <span class="empty-icon">${cxIcon(iconName)}</span>
      <div class="empty-title">${escapeHtml(title)}</div>
      <div class="empty-text">${escapeHtml(text)}</div>
      ${action ? `<button class="btn btn-lime btn-sm" type="button" data-nav="${action.view}">${escapeHtml(action.label)}</button>` : ""}
    </div>
  `;
}

function questRow(task) {
  const done = task.doneDate === dayKey();
  const cfg = LEVELS[task.level] || LEVELS.debutant;
  const volumeLabel = task.unit === "sec" ? `${task.reps} s` : `${task.reps}`;
  return `
    <div class="quest ${done ? "is-done" : ""}" style="--lvl:${cfg.color}">
      <button class="quest-check" type="button" data-action="toggle-task" data-id="${escapeHtml(task.id)}"
        aria-pressed="${done}" aria-label="${done ? "Annuler la quête" : "Valider la quête"} : ${escapeHtml(task.name)}">
        ${CHECK_SVG}
      </button>
      <span class="quest-glyph" aria-hidden="true">${cxIcon(cxMuscle(task.muscle))}</span>
      <div class="quest-body">
        <div class="quest-title"><span class="quest-name">${escapeHtml(task.name)}</span>${done ? `<span class="done-tag">FAIT</span>` : ""}</div>
        <div class="quest-meta">
          <span class="chip chip-level">${cfg.short}</span>
          <span class="chip">${task.sets} × ${volumeLabel}</span>
          <span class="chip">${escapeHtml(task.muscle || "Full body")}</span>
        </div>
      </div>
      <span class="quest-xp">${done ? cxIcon("check", { stroke: 2.4 }) : `+${task.xp} XP`}</span>
      <button class="icon-btn quest-del" type="button" data-action="delete-task" data-id="${escapeHtml(task.id)}"
        aria-label="Supprimer ${escapeHtml(task.name)}">${TRASH_SVG}</button>
    </div>
  `;
}

/* ------------------------------------------------------------
   12. SIDEBAR + HEADER MOBILE
   ------------------------------------------------------------ */
function renderSidebar() {
  const p = state.profile;
  const info = levelInfo(p.xp);
  const streak = displayStreak();
  const cls = rankClass(info.rank);
  const sigil = window.CX && CX.sigil ? CX.sigil(p.name, { size: 42 }) : escapeHtml((p.name || "P").slice(0, 1));
  const flame = window.CX && CX.icon ? CX.icon("flame") : "";

  $("playerMini").innerHTML = `
    <div class="pm-top">
      <span class="pm-avatar" aria-hidden="true">${sigil}</span>
      <span class="pm-level"><b>Nv.${info.level}</b> · ${cls}</span>
    </div>
    <div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${info.need}" aria-valuenow="${info.current}" aria-label="Expérience : ${info.current} sur ${info.need}">
      <div class="xp-fill" style="width:${info.pct}%"></div>
    </div>
  `;

  $("streakMini").innerHTML = `
    <span class="flame" aria-hidden="true">${flame}</span>
    <span>Série</span>
    <strong>${streak} j</strong>
  `;

  $("mobileHeaderRight").innerHTML = `
    <span class="mh-streak" title="Série en cours">${flame}${streak}</span>
    <span class="mh-level" title="${escapeHtml(info.rank)} · ${info.current}/${info.need} XP">
      <b>${info.level}</b><span>${escapeHtml(info.rank.toUpperCase())} ${cls}</span>
    </span>
  `;
}

/* Les icônes de navigation sont posées une seule fois, depuis icons.js. */
function renderNavIcons() {
  if (!window.CX || typeof CX.icon !== "function") return;
  document.querySelectorAll("[data-icon]").forEach((el) => {
    if (el.firstElementChild) return;
    el.innerHTML = CX.icon(el.dataset.icon);
  });
}

/* ------------------------------------------------------------
   13. VUE QG (DASHBOARD)
   ------------------------------------------------------------ */
function hudStamp() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())} // ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
}

function renderDashboard() {
  if (window.CX && CX.hub && typeof CX.hub.render === "function") {
    CX.hub.render(hubModel());
    return;
  }
  const view = $("view-dashboard");
  if (!view) return;
  view.innerHTML = `
    <div class="view" style="padding:clamp(24px,4vw,60px)">
      <div class="card">
        <h2 class="card-title"><span class="dot"></span> Le Seuil</h2>
        <p class="page-sub">Le module du quartier général n'a pas pu être chargé. Vérifie que <code>js/hub.js</code> est présent, puis recharge la page.</p>
        <button class="btn btn-lime" type="button" onclick="location.reload()">Recharger</button>
      </div>
    </div>
  `;
}

/* Modèle transmis à la scène : uniquement des données, aucun accès DOM. */
function hubModel() {
  const p = state.profile;
  const info = levelInfo(p.xp);
  const level = info.level;
  const today = dayKey();
  const doneTasks = state.tasks.filter((task) => task.doneDate === today);
  const total = state.tasks.length;
  const chapter = currentChapter(level);
  const chapterIndex = Math.max(0, CHAPTERS.indexOf(chapter));
  const upcoming = nextChapter(level);
  const boss = currentBoss();
  const plan = programToday();
  const loadedIds = programLoadedIds();
  const loaded = plan.items.filter((ex) => loadedIds.has(ex.id)).length;
  const oath = activeOath();
  const oathTotal = oath ? oath.target : 0;
  const oathDone = oath ? oathProgress(oath) : 0;
  const cls = rankClass(info.rank);

  const quests = state.tasks
    .map((task) => ({
      id: task.id,
      name: task.name,
      xp: task.xp,
      done: task.doneDate === today,
    }))
    .sort((a, b) => Number(a.done) - Number(b.done));

  return {
    name: p.name,
    rank: info.rank,
    className: cls,
    level,
    levelPct: info.pct,
    xpCurrent: info.current,
    xpNeed: info.need,
    streak: displayStreak(),
    weekXp: last7Keys().reduce((sum, key) => sum + ((state.history[key] && state.history[key].xp) || 0), 0),
    volumeToday: doneTasks.reduce((sum, task) => sum + task.sets * task.reps, 0),
    questsDone: doneTasks.length,
    questsTotal: total,
    quests,
    chapter: {
      n: chapter.n,
      title: chapter.title,
      index: chapterIndex + 1,
      total: CHAPTERS.length,
      nextLevel: upcoming ? upcoming.level : null,
      nextN: upcoming ? upcoming.n : null,
    },
    boss: {
      name: boss.name,
      epithet: boss.epithet,
      damage: boss.damage,
      maxHp: boss.maxHp,
      pct: boss.pct,
      daysLeft: boss.daysLeft,
      defeated: boss.defeated,
      claimed: boss.claimed,
    },
    oath: oath
      ? {
          active: true,
          id: oath.id,
          title: oath.title,
          vow: oath.vow,
          progress: oathDone,
          target: oathTotal,
          pct: oathTotal ? Math.round((oathDone / oathTotal) * 100) : 0,
          done: oathDone >= oathTotal,
        }
      : {
          active: false,
          choices: oathChoices().map((choice) => ({ id: choice.id, title: choice.title, vow: choice.vow })),
        },
    weekLabel: `S.${pad2(isoWeekNumber())}`,
    program: {
      index: plan.index,
      title: plan.title || "Récupération",
      lore: plan.lore || "",
      items: plan.items.length,
      xp: plan.xp || 0,
      loaded,
      tier: programTierLabel(),
    },
  };
}

/* ------------------------------------------------------------
   14. VUE QUÊTES
   ------------------------------------------------------------ */
function renderQuests() {
  const today = dayKey();
  const total = state.tasks.length;
  const doneTasks = state.tasks.filter((t) => t.doneDate === today);
  const done = doneTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const rest = Math.max(0, total - done);
  const filter = ui.questFilter;

  const filtered = state.tasks.filter((t) => {
    if (filter === "todo") return t.doneDate !== today;
    if (filter === "done") return t.doneDate === today;
    return true;
  });

  const filters = [
    { id: "all", label: "Toutes", n: total },
    { id: "todo", label: "À faire", n: total - done },
    { id: "done", label: "Terminées", n: done },
  ];

  const plan = programToday();
  const loadedIds = programLoadedIds();
  const planChip = plan.items.length ? `${programTierLabel()} · +${plan.xp} XP` : "Repos planifié";
  const xpToday = doneTasks.reduce((sum, task) => sum + (Number(task.xp) || 0), 0);
  const volumeToday = doneTasks.reduce((sum, task) => sum + (Number(task.sets) || 0) * (Number(task.reps) || 0), 0);
  const dateLabel = capitalize(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
  const C = 2 * Math.PI * 52;

  $("view-quests").innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Journal de bord</span>
        <h1 class="page-title">Le <em>registre</em></h1>
        <p class="page-sub">${escapeHtml(dateLabel)}. Chaque quête validée entaille la bête de la semaine. Le registre se referme à minuit.</p>
      </div>
      <div class="head-actions">
        <button class="btn ${rest > 0 ? "btn-lime" : "btn-ghost"} btn-sm" type="button" data-action="open-session">
          ${rest > 0 ? cxIcon("play") : cxIcon("check")}<span>${rest > 0 ? "Lancer la séance" : "Séance close"}</span>
        </button>
        <button class="btn btn-ghost btn-sm" type="button" data-nav="library">
          ${cxIcon("plus")}<span>Depuis l'arsenal</span>
        </button>
      </div>
    </div>

    <section class="quest-hero" aria-label="Progression du jour">
      <div class="qh-dial">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="qh-track" cx="60" cy="60" r="52" stroke-width="1.4"/>
          <circle class="qh-arc" cx="60" cy="60" r="52" stroke-width="2.6"
            stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(2)}"/>
        </svg>
        <div class="qh-dial-in">
          <strong>${done}<span>/${total}</span></strong>
          <small>QUÊTES</small>
        </div>
      </div>
      <div class="qh-copy">
        <span class="qh-kicker">${done >= total && total > 0 ? "JOURNÉE CLOSE" : rest > 0 ? "REGISTRE OUVERT" : "AUCUNE QUÊTE ARMÉE"}</span>
        <h2 class="qh-title">${done >= total && total > 0 ? "Le registre est scellé" : rest > 0 ? `${rest} quête${rest > 1 ? "s" : ""} avant la bête` : "Arme une première quête"}</h2>
        <p class="qh-note">${total ? `${formatNumber(xpToday)} XP engagé · ${formatNumber(volumeToday)} répétitions validées` : "Pioche dans l'arsenal ou écris ta propre quête."}</p>
      </div>
      <div class="qh-metrics">
        <span><b>${formatNumber(xpToday)}</b><small>XP · JOUR</small></span>
        <span><b>${formatNumber(volumeToday)}</b><small>VOLUME · RÉPS</small></span>
        <span><b>${rest}</b><small>EN ATTENTE</small></span>
      </div>
    </section>

    <div class="quest-layout">
      <section class="card quest-register" aria-label="Liste des quêtes">
        <div class="card-head">
          <h2 class="card-title"><span class="dot"></span> Quêtes du jour</h2>
          <div class="quests-completion">
            <div class="progress" style="width:100px"><div class="progress-fill" style="width:${pct}%"></div></div>
            <span><strong>${done}</strong>/${total}</span>
          </div>
        </div>
        <div class="toolbar">
          <div class="filters">
            ${filters.map((f) => `
              <button class="filter-btn" type="button" data-action="quest-filter" data-filter="${f.id}"
                aria-pressed="${filter === f.id}">
                ${f.label}<span class="n">${f.n}</span>
              </button>`).join("")}
          </div>
        </div>
        ${filtered.length
          ? `<div class="quests-list">${filtered.map(questRow).join("")}</div>`
          : total === 0
            ? emptyBlock("codex", "Le registre est vide", "Ajoute une quête ci-contre ou pioche un exercice dans l'arsenal.", { view: "library", label: "Explorer l'arsenal" })
            : emptyBlock("route", "Rien par ici", filter === "done" ? "Valide une quête pour la retrouver ici." : "Toutes tes quêtes sont accomplies. Le registre peut se refermer.", null)}
      </section>

      <aside class="quest-aside">
        <section class="card quest-form-card">
          <div class="card-head">
            <h2 class="card-title"><span class="dot"></span> Nouvelle quête</h2>
            <span class="chip">+ XP à la validation</span>
          </div>
          <form class="quest-form" id="questForm" autocomplete="off">
            <label class="field">
              <span>Nom de la quête</span>
              <input class="input" id="qName" maxlength="40" placeholder="Ex. 50 pompes explosifs" required>
            </label>
            <label class="field">
              <span>Groupe musculaire</span>
              <select class="select" id="qMuscle">
                ${MUSCLES.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("")}
              </select>
            </label>
            <div class="field">
              <span>Niveau</span>
              <div class="segmented" role="group" aria-label="Niveau de difficulté">
                ${LEVEL_ORDER.map((l) => `
                  <button class="seg" type="button" data-action="pick-level" data-level="${l}"
                    aria-pressed="${ui.formLevel === l}" style="--lvl-color:${LEVELS[l].color}">
                    ${LEVELS[l].label}
                  </button>`).join("")}
              </div>
            </div>
            <div class="qf-row">
              <label class="field qf-num">
                <span>Séries</span>
                <input class="input" id="qSets" type="number" inputmode="numeric" min="1" max="20" value="3" required>
              </label>
              <label class="field qf-num">
                <span>Réps</span>
                <input class="input" id="qReps" type="number" inputmode="numeric" min="1" max="500" value="10" required>
              </label>
              <span class="xp-estimate" id="xpEstimate">+${calcXp(ui.formLevel, 3, 10)} XP</span>
            </div>
            <button class="btn btn-lime" type="submit">${cxIcon("plus")}<span>Ajouter au registre</span></button>
          </form>
        </section>

        <section class="card program-card">
          <div class="card-head">
            <h2 class="card-title"><span class="dot"></span> Programme</h2>
            <span class="chip">${escapeHtml(planChip)}</span>
          </div>
          <div class="program-list">
            ${PROGRAM.map((day, index) => {
              const dayPlan = programDayPlan(index);
              const isToday = index === programDayIndex();
              const loaded = dayPlan.items.filter((ex) => loadedIds.has(ex.id)).length;
              const complete = dayPlan.items.length > 0 && loaded >= dayPlan.items.length;
              return `
                <div class="program-row ${isToday ? "is-today" : ""} ${dayPlan.items.length ? "" : "is-rest"}">
                  <span class="program-day">${escapeHtml(day.label.slice(0, 3).toUpperCase())}</span>
                  <div class="program-main">
                    <span class="program-focus">${escapeHtml(day.title)}</span>
                    <span class="program-detail">${dayPlan.items.length
                      ? dayPlan.items.map((ex) => escapeHtml(ex.name)).join(" · ")
                      : escapeHtml(day.lore)}</span>
                  </div>
                  <div class="program-side">
                    ${isToday && dayPlan.items.length
                      ? `<button class="btn btn-sm ${complete ? "btn-ghost" : "btn-lime"}" type="button" data-action="load-program" data-id="${index}" ${complete ? "disabled" : ""}>${complete ? "Chargé" : "Charger"}</button>`
                      : `<span class="program-count">${dayPlan.items.length ? `${dayPlan.items.length} ex.` : "—"}</span>`}
                  </div>
                </div>`;
            }).join("")}
          </div>
          <p class="program-note">Charge la journée pour l'ajouter au registre. La séance guidée déroulera ensuite les exercices un par un, repos compris.</p>
        </section>
      </aside>
    </div>
  `;

  if (window.CX && CX.windows) CX.windows.decorate("quests");
}

/* ------------------------------------------------------------
   15. VUE ARSENAL
   ------------------------------------------------------------ */
function exerciseCard(ex) {
  const cfg = LEVELS[ex.level];
  const xp = exerciseXp(ex);
  const added = state.tasks.some((t) => t.exerciseId === ex.id);
  return `
    <article class="ex-card" style="--lvl:${cfg.color}">
      <div class="ex-head">
        <span class="ex-glyph" aria-hidden="true">${cxIcon(cxMuscle(ex.muscle))}</span>
        <span class="chip chip-level">${cfg.label}</span>
      </div>
      <h3 class="ex-name">${escapeHtml(ex.name)}</h3>
      <p class="ex-tip">${escapeHtml(ex.tip)}</p>
      <div class="ex-meta">
        <span>${ex.sets} × ${ex.reps}${ex.unit === "sec" ? " s" : ""}</span>
        <span>·</span>
        <span>${escapeHtml(ex.muscle)}</span>
      </div>
      <div class="ex-foot">
        <span class="xp-pill">+${xp} XP</span>
        ${added
          ? `<span class="ex-added">${cxIcon("check", { stroke: 2.2 })}<span>Au registre</span></span>`
          : `<button class="btn btn-sm btn-lime" type="button" data-action="add-exercise" data-id="${ex.id}">${cxIcon("plus")}<span>Ajouter</span></button>`}
      </div>
    </article>
  `;
}

function renderLibraryGrid() {
  const grid = $("exGrid");
  if (!grid) return;
  const query = deburr(ui.libSearch.trim());
  const items = LIBRARY.filter((ex) => {
    const okLevel = ui.libLevel === "all" || ex.level === ui.libLevel;
    const haystack = deburr(`${ex.name} ${ex.muscle} ${LEVELS[ex.level].label}`);
    return okLevel && (!query || haystack.includes(query));
  });

  const count = $("libCount");
  if (count) count.textContent = `${items.length} exercice${items.length > 1 ? "s" : ""}`;

  grid.innerHTML = items.length
    ? items.map(exerciseCard).join("")
    : `<div class="empty" style="grid-column:1/-1">
        <span class="empty-icon">${cxIcon("search")}</span>
        <div class="empty-title">Aucun exercice trouvé</div>
        <div class="empty-text">Essaie un autre mot-clé ou change de niveau.</div>
        <button class="btn btn-ghost btn-sm" type="button" data-action="reset-lib-filters">Tout afficher</button>
      </div>`;

  if (window.CX && CX.windows) CX.windows.refresh("library");
}

function renderLibrary() {
  const tabs = [{ id: "all", label: "Tous" }, ...LEVEL_ORDER.map((l) => ({ id: l, label: LEVELS[l].label }))];
  const tiers = LEVEL_ORDER.map((l) => ({ l, n: LIBRARY.filter((ex) => ex.level === l).length }));
  const muscles = new Set(LIBRARY.map((ex) => ex.muscle)).size;

  $("view-library").innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Arsenal · ${LIBRARY.length} mouvements</span>
        <h1 class="page-title">L'<em>arsenal</em></h1>
        <p class="page-sub">Du premier appui aux figures avancées. Chaque mouvement existe en trois paliers — choisis ta lame et ajoute-la au registre.</p>
      </div>
      <div class="lib-tally" aria-label="Répartition de l'arsenal">
        ${tiers.map((t) => `
          <span><i style="--lvl:${LEVELS[t.l].color}"></i><b>${t.n}</b><small>${LEVELS[t.l].short}</small></span>`).join("")}
        <span><b>${muscles}</b><small>GROUPES</small></span>
      </div>
    </div>

    <div class="lib-toolbar">
      <div class="lib-search">
        ${cxIcon("search")}
        <input class="input" id="libSearch" type="search" placeholder="Rechercher un exercice ou un muscle…"
          value="${escapeHtml(ui.libSearch)}" aria-label="Rechercher un exercice">
      </div>
      <div class="filters">
        ${tabs.map((t) => `
          <button class="filter-btn" type="button" data-action="lib-level" data-level="${t.id}"
            aria-pressed="${ui.libLevel === t.id}"
            style="${t.id === "all" ? "" : `--lvl:${LEVELS[t.id].color}`}">${t.label}</button>`).join("")}
      </div>
      <span class="lib-count" id="libCount"></span>
    </div>

    <div class="ex-grid" id="exGrid"></div>
  `;
  renderLibraryGrid();

  if (window.CX && CX.windows) CX.windows.decorate("library");
}

/* ------------------------------------------------------------
   16. VUE SUCCÈS / PROFIL
   ------------------------------------------------------------ */
function achCard(a, unlocked) {
  const p = state.profile;
  const raw = Math.max(0, Number(a.value(p)) || 0);
  const value = Math.min(raw, a.goal);
  const pct = Math.round((value / a.goal) * 100);
  const iconName = ACHIEVEMENT_ICONS[a.id] || "seal";
  return `
    <div class="ach-card ${unlocked ? "is-unlocked" : "is-locked"}">
      <div class="ach-icon" aria-hidden="true">
        ${cxIcon(iconName)}
        ${unlocked ? "" : `<span class="ach-lock">${LOCK_SVG}</span>`}
      </div>
      <div class="ach-body">
        <div class="ach-top">
          <span class="ach-name">${escapeHtml(a.title)}</span>
          ${unlocked ? `<span class="ach-tag">${cxIcon("check", { stroke: 2.4 })}DÉBLOQUÉ</span>` : ""}
        </div>
        <div class="ach-desc">${escapeHtml(a.desc)}</div>
        ${unlocked
          ? ""
          : `<div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
             <div class="ach-progress-text">${formatNumber(value)} / ${formatNumber(a.goal)}</div>`}
      </div>
    </div>
  `;
}

function renderProfile() {
  const p = state.profile;
  const info = levelInfo(p.xp);
  const cls = rankClass(info.rank);
  const unlocked = new Set(p.achievements);
  const chapter = currentChapter(info.level);
  const upcoming = nextChapter(info.level);
  const attrs = attributes();
  const seals = SEALS.map((seal) => ({ ...seal, unlocked: Boolean(seal.test(p)) }));
  const sealCount = seals.filter((seal) => seal.unlocked).length;
  const created = new Date(p.createdAt);
  const memberSince = Number.isNaN(created.getTime())
    ? "aujourd'hui"
    : capitalize(created.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));

  const records = recordList();
  const log = Array.isArray(state.sessions) ? state.sessions : [];
  const logTime = log.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const logSets = log.reduce((sum, entry) => sum + (entry.sets || 0), 0);
  const bestSession = log.reduce((best, entry) => (!best || entry.xp > best.xp ? entry : best), null);

  const bilan = [
    { icon: "quests", value: formatNumber(p.questsDone), label: "QUÊTES", foot: `${formatNumber(p.xp)} XP au total` },
    { icon: "muscle", value: formatNumber(p.volume), label: "VOLUME", foot: "répétitions cumulées" },
    { icon: "flame", value: `${p.bestStreak} j`, label: "MEILLEURE SÉRIE", foot: `${displayStreak()} j en cours` },
    { icon: "seal", value: `${unlocked.size}/${ACHIEVEMENTS.length}`, label: "TROPHÉES", foot: unlocked.size === ACHIEVEMENTS.length ? "collection complète" : `${ACHIEVEMENTS.length - unlocked.size} à sceller` },
  ];

  $("view-profile").innerHTML = `
    <div class="page-head">
      <div>
        <span class="eyebrow">Codex du Porteur</span>
        <h1 class="page-title">Le <em>codex</em></h1>
        <p class="page-sub">Le carnet garde la trace de ce que le corps a bâti. Chapitres, attributs et sceaux de cire — rien ne s'efface sans laisser de marque.</p>
      </div>
    </div>

    <section class="codex-hero">
      <div class="codex-sigil" aria-hidden="true">${window.CX && CX.sigil ? CX.sigil(p.name, { size: 76 }) : ""}</div>
      <div class="codex-id">
        <span class="codex-kicker">PORTEUR ENREGISTRÉ</span>
        <h2 class="id-name">${escapeHtml(p.name)}</h2>
        <p class="id-sub">Membre depuis ${escapeHtml(memberSince)} · ${formatNumber(p.sessions || 0)} séance${(p.sessions || 0) > 1 ? "s" : ""} · Chapitre ${chapter.n} — ${escapeHtml(chapter.title)}</p>
        <div class="name-field">
          <label for="playerName">Nom de joueur</label>
          <input class="name-input" id="playerName" maxlength="24" value="${escapeHtml(p.name)}"
            aria-label="Nom de joueur" autocomplete="off">
        </div>
      </div>
      <div class="codex-level">
        <span class="cx-level-rank">${escapeHtml(info.rank)} · CLASSE ${cls}</span>
        <div class="cx-level-num"><span>Nv.</span><strong>${info.level}</strong></div>
        <div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${info.need}" aria-valuenow="${info.current}" aria-label="Expérience">
          <div class="xp-fill" style="width:${info.pct}%"></div>
        </div>
        <span class="cx-level-xp">${formatNumber(info.current)} / ${formatNumber(info.need)} XP</span>
        <span class="cx-level-next">${formatNumber(info.toNext)} XP avant ${escapeHtml(rankFor(info.level + 1))}</span>
      </div>
    </section>

    <div class="bilan" aria-label="Bilan du porteur">
      ${bilan.map((m) => `
        <div class="bilan-cell">
          <span class="bilan-icon" aria-hidden="true">${cxIcon(m.icon)}</span>
          <div class="bilan-main">
            <b>${m.value}</b>
            <span>${m.label}</span>
          </div>
          <small>${m.foot}</small>
        </div>`).join("")}
    </div>

    <div class="section-head">
      <div>
        <span class="eyebrow">Mesure</span>
        <h2 class="section-title">Attributs</h2>
      </div>
      <p class="section-sub">Ce que le corps a gravé jusqu'ici</p>
    </div>
    <div class="attr-grid">
      ${attrs.map((attr) => `
        <div class="attr-card">
          <div class="attr-head">
            <span class="attr-name">${attr.name}</span>
            <span class="attr-tier">${attr.tier}</span>
          </div>
          <div class="attr-value">${attr.value}<small>/100</small></div>
          <div class="attr-bar"><div class="attr-fill" style="width:${attr.value}%"></div></div>
          <p class="attr-note">${escapeHtml(attr.note)}</p>
        </div>`).join("")}
    </div>

    <div class="section-head">
      <div>
        <span class="eyebrow">Cire</span>
        <h2 class="section-title">Sceaux</h2>
      </div>
      <p class="section-sub">${sealCount} / ${seals.length} sceaux gravés</p>
    </div>
    <div class="seal-grid">
      ${seals.map((seal) => `
        <div class="seal ${seal.unlocked ? "is-unlocked" : "is-locked"}">
          <span class="seal-glyph" aria-hidden="true">${seal.unlocked ? cxSeal(seal.glyph, { size: 15 }) : cxIcon("lock")}</span>
          <span class="seal-title">${escapeHtml(seal.title)}</span>
          <span class="seal-state">${seal.unlocked ? "GRAVÉ" : "SCELLÉ"}</span>
        </div>`).join("")}
    </div>

    <div class="section-head">
      <div>
        <span class="eyebrow">Marche</span>
        <h2 class="section-title">Chapitres</h2>
      </div>
      <p class="section-sub">${upcoming
        ? `Prochain chapitre au niveau ${upcoming.level}`
        : "Tous les chapitres sont ouverts"}</p>
    </div>
    <div class="chapter-list">
      ${CHAPTERS.map((item) => {
        const isUnlocked = info.level >= item.level;
        const isCurrent = chapter.n === item.n;
        return `
          <div class="chapter ${isUnlocked ? "" : "is-locked"} ${isCurrent ? "is-current" : ""}">
            <span class="chapter-num">${isUnlocked ? item.n : cxIcon("lock")}</span>
            <div class="chapter-body">
              <h3 class="chapter-title">${isUnlocked ? escapeHtml(item.title) : "Chapitre scellé"}</h3>
              <p class="chapter-quote">${isUnlocked
                ? `« ${escapeHtml(item.quote)} »`
                : `S'ouvrira au niveau ${item.level}. Le codex garde encore le silence.`}</p>
            </div>
            <span class="chapter-lock">${isCurrent ? "En cours" : isUnlocked ? "Ouvert" : `Nv. ${item.level}`}</span>
          </div>`;
      }).join("")}
    </div>

    <div class="section-head">
      <div>
        <span class="eyebrow">Effort</span>
        <h2 class="section-title">Séances</h2>
      </div>
      <p class="section-sub">${log.length
        ? `${log.length} séance${log.length > 1 ? "s" : ""} · ${formatMinutes(logTime)} cumulées`
        : "Aucune séance consignée"}</p>
    </div>
    <section class="card slog-card">
      <div class="slog-stats">
        <div><span>SÉANCES</span><b>${formatNumber(p.sessions || 0)}</b></div>
        <div><span>TEMPS TOTAL</span><b>${formatMinutes(logTime)}</b></div>
        <div><span>MEILLEURE</span><b>${bestSession ? `+${formatNumber(bestSession.xp)} XP` : "—"}</b></div>
        <div><span>SÉRIES</span><b>${formatNumber(logSets)}</b></div>
      </div>
      ${log.length ? `<ul class="slog-list">
        ${log.slice(0, 6).map((entry) => `
          <li class="slog-row">
            <span class="slog-day">${shortDay(entry.day)}</span>
            <div class="slog-main">
              <b>${formatMinutes(entry.duration)} · +${formatNumber(entry.xp)} XP</b>
              <span>${entry.quests} quête${entry.quests > 1 ? "s" : ""} · ${entry.sets} série${entry.sets > 1 ? "s" : ""}</span>
              <em>${entry.items.length ? entry.items.map((item) => escapeHtml(item.name)).join(" · ") : "Séance interrompue avant validation"}</em>
            </div>
          </li>`).join("")}
      </ul>` : `<p class="slog-empty">Lance une séance depuis le QG : chaque série terminée viendra s'inscrire ici, avec l'XP, la durée et les quêtes validées.</p>`}
    </section>

    <div class="section-head">
      <div>
        <span class="eyebrow">Marques</span>
        <h2 class="section-title">Records</h2>
      </div>
      <p class="section-sub">${records.length ? "Tes meilleures marques, exercice par exercice" : "Aucun record pour l'instant"}</p>
    </div>
    ${records.length ? `<div class="record-grid">
      ${records.slice(0, 6).map((rec) => `
        <div class="record-card">
          <div class="record-top">
            <span class="record-name">${escapeHtml(rec.name)}</span>
            <span class="record-count">${rec.count}×</span>
          </div>
          <div class="record-value">${rec.bestReps}<small>${rec.unit === "sec" ? " s" : " réps"}</small></div>
          <div class="record-meta">
            <span>Volume <b>${rec.volumeSets} × ${rec.volumeReps}</b></span>
            <span>Dernier <b>${shortDay(rec.lastDay)}</b></span>
          </div>
        </div>`).join("")}
    </div>` : `<div class="card"><p class="slog-empty">Valide une quête pour ouvrir ton premier record.</p></div>`}

    <div class="section-head">
      <div>
        <span class="eyebrow">Collection</span>
        <h2 class="section-title">Trophées</h2>
      </div>
      <p class="section-sub">${unlocked.size} / ${ACHIEVEMENTS.length} débloqués</p>
    </div>
    <div class="ach-grid">
      ${ACHIEVEMENTS.map((a) => achCard(a, unlocked.has(a.id))).join("")}
    </div>

    <div class="section-head">
      <div>
        <span class="eyebrow">Réglages</span>
        <h2 class="section-title">Le poste</h2>
      </div>
      <p class="section-sub">Personnalise l'expérience et protège ta progression.</p>
    </div>
    <section class="card settings-card">
      <div class="setting-row">
        <span class="setting-icon" aria-hidden="true">${cxIcon("clock")}</span>
        <div class="setting-info">
          <div class="setting-name">Repos entre séries</div>
          <div class="setting-desc">Durée par défaut du minuteur pendant une séance. Ajustable en direct avec −15 s / +15 s.</div>
        </div>
        <select class="select rest-select" id="restSetting" aria-label="Durée de repos par défaut">
          ${[30, 45, 60, 90, 120, 150, 180].map((sec) => `<option value="${sec}"${sessionRestSeconds() === sec ? " selected" : ""}>${sec} s</option>`).join("")}
        </select>
      </div>
      <div class="setting-row">
        <span class="setting-icon" aria-hidden="true">${cxIcon("sound")}</span>
        <div class="setting-info">
          <div class="setting-name">Effets sonores</div>
          <div class="setting-desc">Sons de validation, de montée de niveau et de succès.</div>
        </div>
        <button class="switch" type="button" role="switch" aria-checked="${state.settings.sound}"
          aria-label="Activer les effets sonores" data-action="toggle-sound"></button>
      </div>
      <div class="setting-row">
        <span class="setting-icon" aria-hidden="true">${cxIcon("download")}</span>
        <div class="setting-info">
          <div class="setting-name">Sauvegarde</div>
          <div class="setting-desc">Exporte un fichier JSON ou restaure une sauvegarde Calisthenix.</div>
        </div>
        <div class="setting-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-action="export-data">Exporter</button>
          <button class="btn btn-ghost btn-sm" type="button" data-action="import-data">Importer</button>
        </div>
      </div>
      <div class="setting-row">
        <span class="setting-icon is-danger" aria-hidden="true">${cxIcon("reset")}</span>
        <div class="setting-info">
          <div class="setting-name">Réinitialiser</div>
          <div class="setting-desc">Efface la progression, les sceaux et les serments, puis repart de zéro.</div>
        </div>
        <div class="setting-actions">
          <button class="btn btn-danger btn-sm" type="button" data-action="reset-data">Réinitialiser</button>
        </div>
      </div>
    </section>
    <div class="data-note">${cxIcon("shield")}<span>Tes données restent sur cet appareil (localStorage). Pense à exporter régulièrement une sauvegarde. « ${escapeHtml(ORDER.motto)} »</span></div>
    <input type="file" id="importFile" class="import-input" accept=".json,application/json" aria-hidden="true" tabindex="-1">
  `;

  if (window.CX && CX.windows) CX.windows.decorate("profile");
}

/* ------------------------------------------------------------
   17. RENDU GLOBAL / NAVIGATION
   ------------------------------------------------------------ */
function renderView(view) {
  if (view === "dashboard") renderDashboard();
  else if (view === "quests") renderQuests();
  else if (view === "library") renderLibrary();
  else if (view === "profile") renderProfile();
}

function renderAll() {
  renderSidebar();
  renderView(ui.view);
}

function syncNav() {
  document.querySelectorAll(".nav-item, .mn-item").forEach((btn) => {
    if (btn.dataset.nav === ui.view) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
}

function setView(view) {
  if (!VIEWS.includes(view)) view = "dashboard";
  ui.view = view;
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.view === view);
  });
  syncNav();
  renderView(view);
  if (window.CX && CX.hub && typeof CX.hub.setActive === "function") {
    CX.hub.setActive(view === "dashboard");
  }
  const titles = {
    dashboard: "QG · Calisthenix",
    quests: "Quêtes · Calisthenix",
    library: "Arsenal · Calisthenix",
    profile: "Codex · Calisthenix",
  };
  document.title = titles[view] || "Calisthenix";
  try {
    history.replaceState(null, "", "#" + view);
  } catch (err) { /* file:// peut bloquer replaceState sur certains navigateurs */ }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------------------------------------------
   18. ACTIONS MÉTIER
   ------------------------------------------------------------ */
function addTask(data) {
  state.tasks.unshift({
    id: uid(),
    exerciseId: data.exerciseId || null,
    name: data.name,
    level: data.level,
    muscle: data.muscle || "Full body",
    sets: data.sets,
    reps: data.reps,
    unit: data.unit || "reps",
    icon: window.CX && CX.hasIcon && CX.hasIcon(data.icon) ? data.icon : cxMuscle(data.muscle),
    xp: data.xp || calcXp(data.level, data.sets, data.reps),
    doneDate: null,
    createdAt: Date.now(),
  });
  save();
  renderAll();
}

function toggleTask(id, position) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  const p = state.profile;
  const today = dayKey();
  const isDone = task.doneDate === today;
  const before = levelInfo(p.xp);

  if (isDone) {
    task.doneDate = null;
    p.xp = Math.max(0, p.xp - task.xp);
    p.questsDone = Math.max(0, p.questsDone - 1);
    p.volume = Math.max(0, p.volume - task.sets * task.reps);
    const entry = state.history[today];
    if (entry) {
      entry.xp = Math.max(0, (entry.xp || 0) - task.xp);
      entry.tasks = Math.max(0, (entry.tasks || 0) - 1);
      entry.volume = Math.max(0, (entry.volume || 0) - task.sets * task.reps);
      if (entry.levels && entry.levels[task.level]) {
        entry.levels[task.level] = Math.max(0, entry.levels[task.level] - 1);
        if (!entry.levels[task.level]) delete entry.levels[task.level];
      }
    }
    save();
    renderAll();
    showToast({ icon: "reset", title: "Quête annulée", desc: `−${task.xp} XP · ${task.name}`, tone: "neutral" });
    beep("undo");
    return;
  }

  task.doneDate = today;
  p.xp += task.xp;
  p.questsDone += 1;
  p.volume += task.sets * task.reps;
  p.levelsDone[task.level] = true;
  p.musclesDone = p.musclesDone && typeof p.musclesDone === "object" ? p.musclesDone : {};
  if (task.muscle) p.musclesDone[task.muscle] = true;

  const yesterday = shiftKey(today, -1);
  if (p.lastCompletionDay !== today) {
    if (p.lastCompletionDay === yesterday) p.streak = (p.streak || 0) + 1;
    else p.streak = 1;
    p.lastCompletionDay = today;
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
  }

  const entry = state.history[today] || (state.history[today] = { xp: 0, tasks: 0, volume: 0 });
  entry.xp = (entry.xp || 0) + task.xp;
  entry.tasks = (entry.tasks || 0) + 1;
  entry.volume = (entry.volume || 0) + task.sets * task.reps;
  entry.levels = entry.levels && typeof entry.levels === "object" && !Array.isArray(entry.levels) ? entry.levels : {};
  entry.levels[task.level] = (entry.levels[task.level] || 0) + 1;

  if (state.tasks.length > 0 && state.tasks.every((t) => t.doneDate === today) && p.lastPerfectDay !== today) {
    p.lastPerfectDay = today;
    p.perfectDays = (p.perfectDays || 0) + 1;
    entry.perfect = true;
  }

  updateRecords(task);

  const rewards = resolveWeeklyRewards();
  const after = levelInfo(p.xp);
  const newlyUnlocked = checkAchievements();
  save();
  renderAll();

  floatXp(task.xp, position);
  pulseBoss();
  showToast({ icon: "bolt", title: `+${task.xp} XP`, desc: `${task.name} · ${task.sets} × ${task.reps}${task.unit === "sec" ? " s" : ""}`, tone: "lime" });
  beep("complete");

  if (after.level > before.level) window.setTimeout(() => showLevelUp(after), 360);

  newlyUnlocked.forEach((a, i) => {
    window.setTimeout(() => {
      showToast({ icon: ACHIEVEMENT_ICONS[a.id] || "seal", title: `Succès débloqué : ${a.title}`, desc: a.desc, tone: "violet", duration: 5200 });
      renderAll();
      beep("achievement");
    }, 620 + i * 700);
  });

  rewards.forEach((reward, i) => {
    window.setTimeout(() => {
      showToast(reward);
      renderAll();
      beep("achievement");
    }, 1100 + i * 850);
  });
}

function deleteTask(id) {
  const index = state.tasks.findIndex((t) => t.id === id);
  if (index === -1) return;
  const [task] = state.tasks.splice(index, 1);
  save();
  renderAll();
  showToast({
    icon: "trash",
    title: "Quête supprimée",
    desc: task.name,
    tone: "danger",
    duration: 6000,
    action: {
      label: "Annuler la suppression",
      onClick: () => {
        const position = Math.min(index, state.tasks.length);
        state.tasks.splice(position, 0, task);
        save();
        renderAll();
        showToast({ icon: "check", title: "Quête restaurée", desc: task.name, tone: "lime", duration: 2600 });
      },
    },
  });
}

function addExercise(id) {
  const ex = LIBRARY.find((e) => e.id === id);
  if (!ex) return;
  if (state.tasks.some((t) => t.exerciseId === ex.id)) {
    showToast({ icon: "spark", title: "Déjà dans tes quêtes", desc: ex.name, tone: "neutral", duration: 2400 });
    return;
  }
  const xp = exerciseXp(ex);
  addTask({
    exerciseId: ex.id,
    name: ex.name,
    level: ex.level,
    muscle: ex.muscle,
    sets: ex.sets,
    reps: ex.reps,
    unit: ex.unit,
    icon: cxMuscle(ex.muscle),
    xp,
  });
  showToast({ icon: "target", title: "Quête ajoutée", desc: `${ex.name} · +${xp} XP`, tone: "lime" });
  beep("add");
}

function pickFormLevel(level) {
  if (!LEVELS[level]) return;
  ui.formLevel = level;
  document.querySelectorAll("#questForm .seg").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.level === level));
  });
  updateEstimate();
}

function updateEstimate() {
  const sets = clamp(parseInt($("qSets") ? $("qSets").value : 3, 10) || 3, 1, 20);
  const reps = clamp(parseInt($("qReps") ? $("qReps").value : 10, 10) || 10, 1, 500);
  const el = $("xpEstimate");
  if (el) el.textContent = `+${calcXp(ui.formLevel, sets, reps)} XP estimé`;
}

function handleQuestSubmit(form) {
  const nameInput = $("qName");
  const setsInput = $("qSets");
  const repsInput = $("qReps");
  const muscleInput = $("qMuscle");
  if (!nameInput || !setsInput || !repsInput) return;

  const name = nameInput.value.trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    showToast({ icon: "blade", title: "Nom trop court", desc: "Donne un nom à ta quête (2 caractères minimum).", tone: "amber", duration: 2800 });
    nameInput.focus();
    return;
  }

  const sets = clamp(parseInt(setsInput.value, 10) || 3, 1, 20);
  const reps = clamp(parseInt(repsInput.value, 10) || 10, 1, 500);
  const muscle = muscleInput ? muscleInput.value : "Full body";
  const xp = calcXp(ui.formLevel, sets, reps);

  addTask({
    name,
    level: ui.formLevel,
    muscle,
    sets,
    reps,
    unit: "reps",
    icon: "seal",
    xp,
  });

  showToast({ icon: "quests", title: "Nouvelle quête ajoutée", desc: `${name} · +${xp} XP`, tone: "lime" });
  beep("add");
  updateEstimate();
}

function toggleSound() {
  state.settings.sound = !state.settings.sound;
  save();
  renderProfile();
  showToast({
    icon: state.settings.sound ? "sound" : "mute",
    title: state.settings.sound ? "Son activé" : "Son coupé",
    tone: "neutral",
    duration: 2000,
  });
  if (state.settings.sound) beep("add");
}

function exportData() {
  try {
    const payload = {
      app: "calisthenix",
      version: state.version || 2,
      exportedAt: new Date().toISOString(),
      state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calisthenix-${dayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast({ icon: "download", title: "Sauvegarde exportée", desc: "Garde ce fichier précieusement.", tone: "lime", duration: 3200 });
  } catch (err) {
    showToast({ icon: "shield", title: "Export impossible", desc: "Le navigateur a bloqué le téléchargement.", tone: "danger" });
  }
}

async function importData(file) {
  try {
    if (file.size > 2000000) throw new Error("fichier trop volumineux");
    const text = await file.text();
    const parsed = JSON.parse(text);
    const raw = parsed && parsed.state ? parsed.state : parsed;
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.tasks) || !raw.profile) {
      throw new Error("format inattendu");
    }
    state = normalizeState(raw);
    save();
    renderAll();
    showToast({
      icon: "upload",
      title: "Sauvegarde importée",
      desc: `${state.tasks.length} quête${state.tasks.length > 1 ? "s" : ""} restaurée${state.tasks.length > 1 ? "s" : ""} · ${formatNumber(state.profile.xp)} XP`,
      tone: "lime",
      duration: 4600,
    });
    beep("achievement");
  } catch (err) {
    showToast({ icon: "shield", title: "Import impossible", desc: "Fichier invalide. Utilise un export Calisthenix.", tone: "danger", duration: 4600 });
    beep("error");
  }
}

function resetData(button) {
  if (!button.dataset.armed) {
    button.dataset.armed = "1";
    button.textContent = "Clique à nouveau pour confirmer";
    window.setTimeout(() => {
      if (button.isConnected) {
        delete button.dataset.armed;
        button.textContent = "Réinitialiser";
      }
    }, 4000);
    return;
  }
  if (sessionState) closeSession(false);
  state = seedState();
  ui.questFilter = "all";
  ui.libLevel = "all";
  ui.libSearch = "";
  ui.formLevel = "intermediaire";
  save();
  renderAll();
  showToast({ icon: "spark", title: "Nouvelle partie", desc: "Ta progression a été réinitialisée.", tone: "neutral", duration: 3600 });
  beep("undo");
}

/* ------------------------------------------------------------
   19. ÉVÉNEMENTS
   ------------------------------------------------------------ */
document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    event.preventDefault();
    setView(nav.dataset.nav);
    return;
  }

  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const { action } = actionEl.dataset;
  const id = actionEl.dataset.id;

  switch (action) {
    case "open-hunt":
      openHunt();
      break;
    case "hunt-strike":
      huntStrike();
      break;
    case "hunt-quests":
      closeHunt();
      setView("quests");
      break;
    case "hunt-close":
      closeHunt();
      break;
    case "open-session":
      openSession();
      break;
    case "load-program":
      loadProgramDay(parseInt(actionEl.dataset.id, 10) || 0);
      break;
    case "session-set":
      sessionFinishSet();
      break;
    case "session-skip":
      sessionSkipQuest();
      break;
    case "session-rest-skip":
      sessionSkipRest();
      break;
    case "session-rest-minus":
      sessionAdjustRest(-15);
      break;
    case "session-rest-plus":
      sessionAdjustRest(15);
      break;
    case "session-next":
      sessionNextQuest();
      break;
    case "session-quests":
      closeSession(false);
      setView("quests");
      break;
    case "session-quit":
      closeSession();
      break;
    case "toggle-task": {
      const rect = actionEl.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      toggleTask(id, { x, y });
      break;
    }
    case "delete-task":
      deleteTask(id);
      break;
    case "add-exercise":
      addExercise(id);
      break;
    case "pick-level":
      pickFormLevel(actionEl.dataset.level);
      break;
    case "take-oath":
      takeOath(id);
      break;
    case "quest-filter":
      ui.questFilter = actionEl.dataset.filter || "all";
      renderQuests();
      break;
    case "lib-level":
      ui.libLevel = actionEl.dataset.level || "all";
      renderLibrary();
      break;
    case "reset-lib-filters":
      ui.libLevel = "all";
      ui.libSearch = "";
      renderLibrary();
      break;
    case "toggle-sound":
      toggleSound();
      break;
    case "export-data":
      exportData();
      break;
    case "import-data": {
      const input = $("importFile");
      if (input) input.click();
      break;
    }
    case "reset-data":
      resetData(actionEl);
      break;
    default:
      break;
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "questForm") return;
  event.preventDefault();
  handleQuestSubmit(event.target);
});

document.addEventListener("input", (event) => {
  if (event.target.id === "libSearch") {
    ui.libSearch = event.target.value;
    renderLibraryGrid();
    return;
  }
  if (event.target.id === "qSets" || event.target.id === "qReps") updateEstimate();
});

document.addEventListener("change", (event) => {
  if (event.target.id === "restSetting") {
    state.settings.rest = clamp(parseInt(event.target.value, 10) || 60, 15, 300);
    save();
    showToast({ icon: "clock", title: "Repos mis à jour", desc: `Minuteur de séance : ${state.settings.rest} s.`, tone: "neutral", duration: 2400 });
    return;
  }
  if (event.target.id === "playerName") {
    const name = event.target.value.trim().slice(0, 24);
    state.profile.name = name || "Athlète";
    save();
    renderAll();
    showToast({ icon: "blade", title: "Nom mis à jour", desc: state.profile.name, tone: "neutral", duration: 2200 });
    return;
  }
  if (event.target.id === "importFile") {
    const file = event.target.files && event.target.files[0];
    if (file) importData(file);
    event.target.value = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (trapOverlayTab(event)) return;
  if (event.key === "Escape") {
    const levelUp = $("levelUp");
    if (levelUp && !levelUp.hidden) {
      closeLevelUp();
      return;
    }
    if (huntState) {
      closeHunt();
      return;
    }
    if (sessionState) {
      closeSession();
      return;
    }
    return;
  }
  const tag = String((event.target && event.target.tagName) || "").toLowerCase();
  const typing = ["button", "input", "textarea", "select", "a"].includes(tag);
  if (event.key === " " && sessionState && !typing) {
    event.preventDefault();
    if (sessionState.phase === "work") sessionFinishSet();
    else if (sessionState.phase === "rest") sessionSkipRest();
    else if (sessionState.phase === "questDone") sessionNextQuest();
    return;
  }
  if (event.key === " " && huntState && huntState.phase === "assault" && huntState.boss.defeated) {
    if (typing) return;
    event.preventDefault();
    huntStrike();
  }
});

/* Parallaxe de la scène du QG */
let parallaxFrame = null;
document.addEventListener("pointermove", (event) => {
  if (prefersReduced() || parallaxFrame) return;
  parallaxFrame = window.requestAnimationFrame(() => {
    parallaxFrame = null;
    const stage = document.querySelector(".stage");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5, -1, 1);
    const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5, -1, 1);
    stage.style.setProperty("--mx", x.toFixed(3));
    stage.style.setProperty("--my", y.toFixed(3));
  });
});

/* Horloge du HUD */
window.setInterval(() => {
  document.querySelectorAll("[data-live-clock]").forEach((el) => {
    el.textContent = hudStamp();
  });
}, 20000);

const levelUpOverlay = $("levelUp");
if (levelUpOverlay) {
  levelUpOverlay.addEventListener("click", (event) => {
    if (event.target === levelUpOverlay || event.target.closest("[data-close-levelup]")) closeLevelUp();
  });
}

/* Vérifie le passage à minuit : les quêtes se réinitialisent visuellement. */
window.setInterval(() => {
  const today = dayKey();
  if (today !== ui.today) {
    ui.today = today;
    renderAll();
    showToast({ icon: "spark", title: "Nouveau jour, nouvelles quêtes", desc: "Ta série est en jeu. À toi de jouer.", tone: "amber", duration: 4200 });
  }
}, 60000);

/* ------------------------------------------------------------
   20. BOOT / LIAISON SYSTÈME
   ------------------------------------------------------------ */
function runBoot() {
  const boot = $("boot");
  if (!boot) return;
  let seen = false;
  try { seen = window.sessionStorage.getItem("calisthenix.boot") === "1"; } catch (err) { seen = false; }
  if (prefersReduced() || seen) {
    boot.hidden = true;
    return;
  }
  boot.hidden = false;
  boot.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-booting");

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    try { window.sessionStorage.setItem("calisthenix.boot", "1"); } catch (err) { /* stockage local bloqué */ }
    boot.classList.add("is-out");
    document.body.classList.remove("is-booting");
    window.setTimeout(() => {
      boot.hidden = true;
      boot.classList.remove("is-out");
    }, 600);
  };

  const skip = boot.querySelector("[data-skip-boot]");
  if (skip) skip.addEventListener("click", finish, { once: true });
  window.setTimeout(finish, 2800);
}

/* ------------------------------------------------------------
   21. INITIALISATION
   ------------------------------------------------------------ */
(function init() {
  const hash = (location.hash || "").replace("#", "");
  ui.view = VIEWS.includes(hash) ? hash : "dashboard";
  renderNavIcons();
  runBoot();
  const rewards = resolveWeeklyRewards();
  save();
  renderAll();
  setView(ui.view);
  rewards.forEach((reward, i) => {
    window.setTimeout(() => showToast(reward), 1400 + i * 800);
  });
})();