/* ============================================================
   CALISTHENIX — PRODUCT LAB
   150 décisions produit · progression locale · exports
   ============================================================ */

(() => {
  "use strict";

  /* ---------------- Données & constantes ---------------- */

  const TOTAL = QUESTIONS.length;
  const SOCLE_TOTAL = QUESTIONS.filter((q) => q.p === 1).length;
  const QUICK_TOTAL = QUESTIONS.filter((q) => q.p === 1 && q.e === "S").length;

  const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const Q_MAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

  const P_LABEL = { 1: "Critique", 2: "Fort", 3: "Bonus" };
  const P_CLASS = { 1: "p1", 2: "p2", 3: "p3" };
  const P_DESC = {
    1: "Sans ces décisions, l'application reste un prototype. Objectif : 100 % avant de passer à l'échelle.",
    2: "Conversion, rétention, marge : les leviers des 90 prochains jours.",
    3: "Différenciation et finition, une fois le socle critique solide.",
  };
  const P_COLOR = { 1: "#c9ff3f", 2: "#5fe3ff", 3: "#8b95a7" };

  const E_LABEL = { S: "Rapide", M: "Moyen", L: "Lourd" };
  const E_HINT = { S: "≈ 1 jour", M: "≈ 1 semaine", L: "≈ 1 mois" };

  const STORE_KEY = "calisthenix.lab.v1";
  const OBJECTIF = 50000;
  const FMT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

  /* ---------------- État ---------------- */

  let storageOk = true;

  function defaultState() {
    return { done: {}, notes: {} };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      const data = JSON.parse(raw);
      const next = defaultState();
      let done = data && data.done;
      if (Array.isArray(done)) {
        done = Object.fromEntries(done.map((id) => [id, true]));
      }
      if (done && typeof done === "object") {
        for (const [id, value] of Object.entries(done)) {
          if (Q_MAP[id] && value) next.done[id] = true;
        }
      }
      if (data && data.notes && typeof data.notes === "object") {
        for (const [id, value] of Object.entries(data.notes)) {
          if (Q_MAP[id] && typeof value === "string" && value.trim()) {
            next.notes[id] = value;
          }
        }
      }
      return next;
    } catch (err) {
      console.warn("Calisthenix Lab : sauvegarde illisible.", err);
      return defaultState();
    }
  }

  let state = loadState();

  const ui = {
    cat: "all",
    status: "all",
    prio: 0,
    quick: false,
    search: "",
    view: "cat",
    preset: "",
    showAllNotes: false,
  };

  function save() {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          version: 1,
          updatedAt: Date.now(),
          done: state.done,
          notes: state.notes,
        })
      );
    } catch (err) {
      if (storageOk) {
        storageOk = false;
        toast("Sauvegarde locale indisponible. Exporte ton plan pour le conserver.", true);
      }
      console.warn("Calisthenix Lab : sauvegarde impossible.", err);
    }
  }

  /* ---------------- Raccourcis DOM ---------------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const el = {
    gauge: $("#gauge"),
    valueScore: $("#valueScore"),
    soclePct: $("#soclePct"),
    globalPct: $("#globalPct"),
    statDone: $("#statDone"),
    statDoneSub: $("#statDoneSub"),
    statSocle: $("#statSocle"),
    statSocleSub: $("#statSocleSub"),
    statQuick: $("#statQuick"),
    statCats: $("#statCats"),
    meterGlobal: $("#meterGlobal"),
    meterSocle: $("#meterSocle"),
    meterQuick: $("#meterQuick"),
    meterCats: $("#meterCats"),
    catList: $("#catList"),
    btnAllCats: $("#btnAllCats"),
    search: $("#search"),
    statusFilters: $("#statusFilters"),
    priorityFilter: $("#priorityFilter"),
    viewSelect: $("#viewSelect"),
    resultCount: $("#resultCount"),
    btnExpand: $("#btnExpand"),
    list: $("#list"),
    emptyState: $("#emptyState"),
    toast: $("#toast"),
    helpDialog: $("#helpDialog"),
    resetDialog: $("#resetDialog"),
    fileInput: $("#fileInput"),
    announcer: $("#announcer"),
  };

  /* ---------------- Utilitaires ---------------- */

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));

  const euro = (value) => `${FMT.format(value)} €`;

  let toastTimer = null;
  function toast(message, warn = false) {
    if (!el.toast) return;
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.toggle("is-warn", warn);
    el.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => el.toast.classList.remove("is-visible"), 2600);
  }

  function announce(message) {
    if (!el.announcer) return;
    el.announcer.textContent = "";
    requestAnimationFrame(() => { el.announcer.textContent = message; });
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function dateISO() {
    return new Date().toISOString().slice(0, 10);
  }

  /* ---------------- Statistiques ---------------- */

  function computeStats() {
    const doneIds = Object.keys(state.done).filter((id) => Q_MAP[id]);
    const done = doneIds.length;
    const socleDone = doneIds.filter((id) => Q_MAP[id].p === 1).length;
    const quickDone = doneIds.filter((id) => Q_MAP[id].p === 1 && Q_MAP[id].e === "S").length;
    const started = CATEGORIES.filter((cat) =>
      QUESTIONS.some((q) => q.cat === cat.id && state.done[q.id])
    ).length;

    const socleRatio = SOCLE_TOTAL ? socleDone / SOCLE_TOTAL : 0;
    const globalRatio = TOTAL ? done / TOTAL : 0;
    const breadthRatio = started / CATEGORIES.length;

    const value = Math.round(
      (OBJECTIF * (0.55 * socleRatio + 0.3 * globalRatio + 0.15 * breadthRatio)) / 100
    ) * 100;

    return {
      done,
      socleDone,
      quickDone,
      quickLeft: QUICK_TOTAL - quickDone,
      started,
      soclePct: Math.round(socleRatio * 100),
      globalPct: Math.round(globalRatio * 100),
      value,
    };
  }

  function renderStats() {
    const s = computeStats();

    el.valueScore.textContent = euro(s.value);
    el.soclePct.textContent = `${s.soclePct} %`;
    el.globalPct.textContent = `${s.globalPct} %`;

    el.statDone.textContent = String(s.done);
    el.statDoneSub.textContent = `sur ${TOTAL} décisions`;
    el.statSocle.textContent = `${s.soclePct} %`;
    el.statSocleSub.textContent = `${s.socleDone} / ${SOCLE_TOTAL} actions essentielles`;
    el.statQuick.textContent = String(s.quickLeft);
    el.statCats.textContent = `${s.started} / ${CATEGORIES.length}`;

    el.meterGlobal.style.width = `${s.globalPct}%`;
    el.meterSocle.style.width = `${s.soclePct}%`;
    el.meterQuick.style.width = `${QUICK_TOTAL ? Math.round((s.quickDone / QUICK_TOTAL) * 100) : 0}%`;
    el.meterCats.style.width = `${Math.round((s.started / CATEGORIES.length) * 100)}%`;

    el.gauge.style.setProperty("--value", (s.value / OBJECTIF) * 100);

    document.title = `${s.globalPct} % · Calisthenix Product Lab`;
  }

  /* ---------------- Filtres ---------------- */

  function matchesFilters(q) {
    if (ui.cat !== "all" && q.cat !== ui.cat) return false;
    if (ui.status === "todo" && state.done[q.id]) return false;
    if (ui.status === "done" && !state.done[q.id]) return false;
    if (ui.prio && q.p !== ui.prio) return false;
    if (ui.quick && !(q.p === 1 && q.e === "S")) return false;

    const term = ui.search.trim().toLowerCase();
    if (term) {
      const haystack = [
        q.t,
        q.d,
        CAT_MAP[q.cat].name,
        CAT_MAP[q.cat].short,
        P_LABEL[q.p],
        E_LABEL[q.e],
      ].join(" ").toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  }

  function filteredQuestions() {
    return QUESTIONS.filter(matchesFilters);
  }

  /* ---------------- Rendu : rail des chantiers ---------------- */

  function renderCats() {
    el.catList.innerHTML = CATEGORIES.map((cat) => {
      const items = QUESTIONS.filter((q) => q.cat === cat.id);
      const done = items.filter((q) => state.done[q.id]).length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      const active = ui.cat === cat.id;
      const complete = done === items.length && items.length > 0;

      return `
        <button class="cat-item${active ? " is-active" : ""}${complete ? " is-complete" : ""}"
                type="button" data-cat="${cat.id}" aria-pressed="${active}"
                style="--cat:${cat.color}"
                title="${esc(cat.desc)}">
          <span class="cat-icon" aria-hidden="true">${cat.icon}</span>
          <span class="cat-body">
            <span class="cat-name"><span>${esc(cat.short)}</span><b>${done}/${items.length}</b></span>
            <span class="cat-bar"><i style="width:${pct}%"></i></span>
          </span>
          <span class="cat-count">${pct}%</span>
        </button>`;
    }).join("");

    el.btnAllCats.classList.toggle("is-active", ui.cat === "all");
  }

  /* ---------------- Rendu : cartes ---------------- */

  function cardHTML(q) {
    const cat = CAT_MAP[q.cat];
    const done = !!state.done[q.id];
    const note = state.notes[q.id] || "";
    const noteOpen = !!note.trim() || ui.showAllNotes;

    return `
      <article class="q-card${done ? " done" : ""}" data-id="${q.id}">
        <label class="check" title="${done ? "Décocher cette décision" : "Marquer comme faite"}">
          <input type="checkbox" data-check="${q.id}" ${done ? "checked" : ""}
                 aria-label="${esc(q.t)}" />
          <span class="box" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
          </span>
        </label>

        <div class="q-body">
          <div class="q-head">
            <h3 class="q-title">${esc(q.t)}</h3>
            <div class="chips">
              ${ui.view === "prio" ? `<span class="chip cat">${esc(cat.short)}</span>` : ""}
              <span class="chip ${P_CLASS[q.p]}">${P_LABEL[q.p]}</span>
              <span class="chip e${q.e}" title="${E_HINT[q.e]}">${q.e} · ${E_LABEL[q.e]}</span>
            </div>
          </div>
          <p class="q-detail">${esc(q.d)}</p>
          <div class="q-foot">
            <button class="note-btn${note.trim() ? " has-note" : ""}" type="button"
                    data-note-toggle="${q.id}" aria-expanded="${noteOpen}"
                    aria-controls="note-${q.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 5h16v11H9l-5 4V5Z"/>
              </svg>
              <span>${note.trim() ? "Modifier la note" : "Ajouter une note"}</span>
            </button>
          </div>
          <div class="note-wrap" id="note-${q.id}" ${noteOpen ? "" : "hidden"}>
            <textarea data-note="${q.id}" rows="2"
                      placeholder="Décision, référence, coût, prochaine étape…"
                      aria-label="Note pour ${esc(q.t)}">${esc(note)}</textarea>
          </div>
        </div>
      </article>`;
  }

  function groupHTML(group) {
    const items = group.items;
    const done = items.filter((q) => state.done[q.id]).length;
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;

    return `
      <section class="group" style="--cat:${group.color}">
        <header class="group-head">
          <span class="group-icon" aria-hidden="true">${group.icon}</span>
          <div class="group-titles">
            <h2>${esc(group.label)} <span class="group-count">${done}/${items.length}</span></h2>
            <p>${esc(group.desc)}</p>
          </div>
          <div class="group-progress" aria-hidden="true">
            <span class="mini-meter"><i style="width:${pct}%"></i></span>
            <span>${pct}%</span>
          </div>
        </header>
        <div class="cards">${items.map(cardHTML).join("")}</div>
      </section>`;
  }

  function renderList() {
    const items = filteredQuestions();
    const done = items.filter((q) => state.done[q.id]).length;

    const groups = ui.view === "prio"
      ? [1, 2, 3].map((p) => ({
          key: `p${p}`,
          label: `${P_LABEL[p]}${p === 1 ? " · socle" : ""}`,
          icon: p === 1 ? "🎯" : p === 2 ? "📌" : "✨",
          desc: P_DESC[p],
          color: P_COLOR[p],
          items: items.filter((q) => q.p === p),
        }))
      : CATEGORIES.map((cat) => ({
          key: cat.id,
          label: cat.name,
          icon: cat.icon,
          desc: cat.desc,
          color: cat.color,
          items: items.filter((q) => q.cat === cat.id),
        }));

    const visibleGroups = groups.filter((g) => g.items.length > 0);

    el.list.innerHTML = visibleGroups.map(groupHTML).join("");
    el.emptyState.hidden = items.length > 0;

    const noun = items.length > 1 ? "décisions affichées" : "décision affichée";
    const doneNoun = done > 1 ? "faites" : "faite";
    el.resultCount.innerHTML = `${items.length} ${noun} · <b>${done}</b> ${doneNoun}`;

    el.btnExpand.textContent = ui.showAllNotes ? "Tout replier" : "Tout déplier";
  }

  /* ---------------- Synchronisation des contrôles ---------------- */

  function syncStatus() {
    $$("button", el.statusFilters).forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.status === ui.status);
    });
  }

  function syncPresets() {
    $$("[data-preset]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.preset === ui.preset);
    });
  }

  function syncControls() {
    el.search.value = ui.search;
    el.priorityFilter.value = String(ui.prio);
    el.viewSelect.value = ui.view;
    syncStatus();
    syncPresets();
    renderCats();
  }

  function refresh() {
    renderStats();
    renderCats();
    renderList();
  }

  /* ---------------- Actions ---------------- */

  function applyPreset(name) {
    ui.preset = name;
    ui.cat = "all";
    ui.search = "";

    if (name === "socle") {
      ui.status = "todo";
      ui.prio = 1;
      ui.quick = false;
      ui.view = "cat";
      toast(`${SOCLE_TOTAL} décisions critiques, à commencer par les plus rapides.`);
    } else if (name === "quick") {
      ui.status = "todo";
      ui.prio = 0;
      ui.quick = true;
      ui.view = "prio";
      toast(`${QUICK_TOTAL} quick wins critiques : une journée ou moins chacun.`);
    } else {
      ui.status = "all";
      ui.prio = 0;
      ui.quick = false;
      ui.view = "cat";
    }

    syncControls();
    refresh();
    el.search.blur();
  }

  function toggleQuestion(id, checked) {
    const q = Q_MAP[id];
    if (!q) return;

    const before = computeStats();

    if (checked) state.done[id] = true;
    else delete state.done[id];

    save();
    refresh();

    // Focus restauré sur la même case quand elle reste affichée.
    const input = el.list.querySelector(`input[data-check="${id}"]`);
    if (input) input.focus({ preventScroll: true });

    if (!checked) {
      toast("Décision rouverte.");
      announce("Décision rouverte.");
      return;
    }

    const after = computeStats();
    if (q.p === 1) {
      if (after.soclePct === 100) {
        toast("🏆 Socle critique terminé : l'app est vendable.");
      } else {
        const threshold = [25, 50, 75].find(
          (t) => before.soclePct < t && after.soclePct >= t
        );
        if (threshold) {
          toast(`Socle critique : ${threshold} % atteint. Continue.`);
        } else {
          toast("Décision validée · socle +1");
        }
      }
    } else {
      toast("Décision validée.");
    }
    announce("Décision validée.");
  }

  /* ---------------- Export Markdown ---------------- */

  function buildMarkdown() {
    const s = computeStats();
    const lines = [];

    lines.push("# Calisthenix — Plan produit");
    lines.push("");
    lines.push(
      `> Généré le ${new Date().toLocaleDateString("fr-FR")} · ` +
      `${s.done}/${TOTAL} décisions · Socle ${s.socleDone}/${SOCLE_TOTAL} (${s.soclePct} %) · ` +
      `Score indicatif ${euro(s.value)} / ${euro(OBJECTIF)}`
    );
    lines.push("");

    const next = QUESTIONS.filter((q) => q.p === 1 && !state.done[q.id]).slice(0, 10);
    if (next.length) {
      lines.push("## Prochaines actions critiques");
      lines.push("");
      next.forEach((q) => {
        lines.push(
          `- [ ] **${q.t}** — _${CAT_MAP[q.cat].short} · ${E_LABEL[q.e]}_`
        );
      });
      lines.push("");
    }

    lines.push("## Plan complet");
    lines.push("");

    CATEGORIES.forEach((cat, index) => {
      const items = QUESTIONS.filter((q) => q.cat === cat.id);
      const done = items.filter((q) => state.done[q.id]).length;
      const num = String(index + 1).padStart(2, "0");

      lines.push(`### ${num} · ${cat.name} — ${done}/${items.length}`);
      lines.push("");

      items.forEach((q) => {
        lines.push(
          `- [${state.done[q.id] ? "x" : " "}] **${q.t}** — \`${P_LABEL[q.p]} · ${E_LABEL[q.e]}\``
        );
        lines.push(`  ${q.d}`);
        const note = (state.notes[q.id] || "").trim();
        if (note) {
          lines.push(`  > Note : ${note.replace(/\n/g, "\n  > ")}`);
        }
      });
      lines.push("");
    });

    lines.push("---");
    lines.push("");
    lines.push(
      "_Calisthenix Product Lab · score heuristique indicatif, sans garantie de valorisation._"
    );

    return lines.join("\n");
  }

  function copyPlan() {
    const markdown = buildMarkdown();

    const fallback = () => {
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
      textarea.remove();
      if (ok) toast("Plan Markdown copié dans le presse-papiers.");
      else toast("Copie impossible ici — utilise l'export .md.", true);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(markdown)
        .then(() => toast("Plan Markdown copié dans le presse-papiers."))
        .catch(fallback);
    } else {
      fallback();
    }
  }

  function exportJSON() {
    const s = computeStats();
    const payload = {
      app: "Calisthenix Product Lab",
      version: 1,
      exportedAt: new Date().toISOString(),
      stats: {
        done: s.done,
        total: TOTAL,
        socleDone: s.socleDone,
        socleTotal: SOCLE_TOTAL,
        valueIndex: s.value,
      },
      done: Object.fromEntries(
        Object.keys(state.done).filter((id) => Q_MAP[id]).map((id) => [id, true])
      ),
      notes: { ...state.notes },
    };
    download(
      `calisthenix-plan-${dateISO()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    toast("Sauvegarde JSON exportée.");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const isObject = data && typeof data === "object";
        const hasDoneField = isObject && Object.prototype.hasOwnProperty.call(data, "done");
        const looksLikeExport = isObject && (hasDoneField || Array.isArray(data));
        let done = hasDoneField ? data.done : data;
        let ids = [];

        if (Array.isArray(done)) {
          ids = done;
        } else if (done && typeof done === "object") {
          ids = Object.keys(done).filter((id) => done[id]);
        }

        ids = Array.from(new Set(ids.filter((id) => Q_MAP[id])));

        if (!ids.length && !looksLikeExport) {
          throw new Error("aucune décision reconnue");
        }

        state.done = Object.fromEntries(ids.map((id) => [id, true]));

        if (isObject && data.notes && typeof data.notes === "object") {
          state.notes = {};
          for (const [id, value] of Object.entries(data.notes)) {
            if (Q_MAP[id] && typeof value === "string" && value.trim()) {
              state.notes[id] = value;
            }
          }
        }

        save();
        refresh();
        toast(
          ids.length
            ? `${ids.length} décision${ids.length > 1 ? "s" : ""} importée${ids.length > 1 ? "s" : ""}.`
            : "Sauvegarde vide importée : plan remis à zéro."
        );
      } catch (err) {
        toast(`Fichier invalide : ${err.message}.`, true);
      }
    };
    reader.onerror = () => toast("Lecture du fichier impossible.", true);
    reader.readAsText(file);
  }

  /* ---------------- Événements ---------------- */

  // Cases à cocher + notes (délégation)
  el.list.addEventListener("change", (event) => {
    const input = event.target.closest("input[data-check]");
    if (!input) return;
    toggleQuestion(input.dataset.check, input.checked);
  });

  el.list.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-note-toggle]");
    if (!btn) return;

    const id = btn.dataset.noteToggle;
    const wrap = document.getElementById(`note-${id}`);
    if (!wrap) return;

    const willOpen = wrap.hidden;
    wrap.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      const textarea = wrap.querySelector("textarea");
      if (textarea) textarea.focus();
    }
  });

  let noteTimer = null;
  el.list.addEventListener("input", (event) => {
    const textarea = event.target.closest("textarea[data-note]");
    if (!textarea) return;

    const id = textarea.dataset.note;
    const value = textarea.value;

    if (value.trim()) state.notes[id] = value;
    else delete state.notes[id];

    const btn = el.list.querySelector(`[data-note-toggle="${id}"]`);
    if (btn) {
      btn.classList.toggle("has-note", !!value.trim());
      const label = btn.querySelector("span");
      if (label) label.textContent = value.trim() ? "Modifier la note" : "Ajouter une note";
    }

    clearTimeout(noteTimer);
    noteTimer = setTimeout(save, 300);
  });

  // Rail : catégories
  el.catList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-cat]");
    if (!btn) return;

    const next = btn.dataset.cat;
    ui.cat = ui.cat === next ? "all" : next;
    ui.preset = "";
    syncPresets();
    renderCats();
    renderList();

    if (window.matchMedia("(max-width: 1024px)").matches) {
      $(".board").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  el.btnAllCats.addEventListener("click", () => {
    ui.cat = "all";
    ui.preset = "";
    syncPresets();
    renderCats();
    renderList();
  });

  // Recherche
  el.search.addEventListener("input", () => {
    ui.search = el.search.value;
    ui.preset = "";
    syncPresets();
    renderList();
  });

  // Filtres d'état
  el.statusFilters.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-status]");
    if (!btn) return;
    ui.status = btn.dataset.status;
    ui.preset = "";
    syncStatus();
    syncPresets();
    renderList();
  });

  // Priorité
  el.priorityFilter.addEventListener("change", () => {
    ui.prio = Number(el.priorityFilter.value) || 0;
    ui.preset = "";
    syncPresets();
    renderList();
  });

  // Regroupement
  el.viewSelect.addEventListener("change", () => {
    ui.view = el.viewSelect.value === "prio" ? "prio" : "cat";
    ui.preset = "";
    syncPresets();
    renderList();
  });

  // Presets
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-preset]");
    if (!btn) return;
    applyPreset(btn.dataset.preset);
  });

  // Tout déplier / replier
  el.btnExpand.addEventListener("click", () => {
    ui.showAllNotes = !ui.showAllNotes;
    renderList();
  });

  // Exports / import / reset
  $("#btnCopy").addEventListener("click", copyPlan);

  $("#btnExportMd").addEventListener("click", () => {
    download(
      `calisthenix-plan-produit-${dateISO()}.md`,
      buildMarkdown(),
      "text/markdown;charset=utf-8"
    );
    toast("Plan Markdown exporté.");
  });

  $("#btnExportJson").addEventListener("click", exportJSON);

  $("#btnImport").addEventListener("click", () => el.fileInput.click());

  el.fileInput.addEventListener("change", () => {
    const file = el.fileInput.files && el.fileInput.files[0];
    if (file) importJSON(file);
    el.fileInput.value = "";
  });

  $("#btnReset").addEventListener("click", () => el.resetDialog.showModal());

  $("#confirmReset").addEventListener("click", () => {
    state = defaultState();
    save();
    refresh();
    toast("Plan réinitialisé. Nouvelle page blanche.");
    announce("Plan réinitialisé.");
  });

  $("#btnHelp").addEventListener("click", () => el.helpDialog.showModal());

  // Raccourcis clavier
  document.addEventListener("keydown", (event) => {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);
    const dialogOpen = !!document.querySelector("dialog[open]");

    if (event.key === "/" && !typing && !dialogOpen) {
      event.preventDefault();
      el.search.focus();
      el.search.select();
    }

    if (event.key === "Escape" && document.activeElement === el.search && el.search.value) {
      el.search.value = "";
      ui.search = "";
      ui.preset = "";
      syncPresets();
      renderList();
    }
  });

  // Synchronisation entre onglets
  window.addEventListener("storage", (event) => {
    if (event.key !== STORE_KEY) return;
    state = loadState();
    refresh();
  });

  /* ---------------- Démarrage ---------------- */

  syncControls();
  refresh();

  // Petit contrôle d'intégrité, utile si les données sont éditées à la main.
  const issues = [];
  if (TOTAL !== 150) issues.push(`${TOTAL} questions au lieu de 150`);
  if (SOCLE_TOTAL === 0) issues.push("aucune question critique");
  if (issues.length) console.warn("Calisthenix Lab :", issues.join(" · "));
})();
