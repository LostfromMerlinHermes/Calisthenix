/* ============================================================
   CALISTHENIX — couche « fenêtres de système »
   windows.js — habille les modules en fenêtres, sans les réécrire.
   Expose CX.windows.decorate / refresh / pulseSave.
   ============================================================ */
(function () {
  "use strict";

  const CX = (window.CX = window.CX || {});
  if (CX.windows) return;
  if (!CX.icon) throw new Error("icons.js doit être chargé avant windows.js");

  const STORE = "calisthenix.windows.v1";
  const SAVE_KEY = "calisthenix.v1";

  const esc = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const clean = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  const pad2 = (value) => String(value).padStart(2, "0");
  const text = (node, selector) => {
    const el = node && node.querySelector(selector);
    return el ? clean(el.textContent) : "";
  };
  const count = (node, selector) => (node ? node.querySelectorAll(selector).length : 0);

  /* ------------------------------------------------------------
     État local (repli des fenêtres, mémorisé pour la session)
     ------------------------------------------------------------ */
  let collapsed = loadCollapsed();
  let saveTimer = 0;
  let uid = 0;
  let bound = false;

  function loadCollapsed() {
    try {
      const raw = window.sessionStorage.getItem(STORE);
      const value = raw ? JSON.parse(raw) : null;
      return value && typeof value === "object" ? value : {};
    } catch (err) {
      return {};
    }
  }

  function persistCollapsed() {
    try {
      window.sessionStorage.setItem(STORE, JSON.stringify(collapsed));
    } catch (err) {
      /* sessionStorage indisponible : le repli reste en mémoire. */
    }
  }

  function storeVersion() {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return data && data.version ? `v${data.version}` : "v3";
    } catch (err) {
      return "v3";
    }
  }

  /* ------------------------------------------------------------
     Statuts : lus dans le DOM réel, jamais inventés
     ------------------------------------------------------------ */
  function statHero(win) {
    const strong = win.querySelector(".qh-dial-in strong");
    const totalEl = win.querySelector(".qh-dial-in strong span");
    const done = strong ? parseInt(clean(strong.firstChild && strong.firstChild.textContent), 10) || 0 : 0;
    const total = totalEl ? parseInt(clean(totalEl.textContent).replace(/\D/g, ""), 10) || 0 : 0;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `${done}/${total} · ${pct} %`;
  }

  function statRegister(win) {
    const rows = count(win, ".quests-list .quest");
    const done = text(win, ".quests-completion span") || "0/0";
    return rows ? `${rows} ligne${rows > 1 ? "s" : ""} · ${done}` : "registre vide";
  }

  function statForm(win) {
    const estimate = text(win, "#xpEstimate");
    return estimate || "prêt";
  }

  function statProgram(win) {
    return text(win, ".chip") || "7 jours";
  }

  function statFilters(win, root) {
    const pressed = win.querySelector('.filter-btn[aria-pressed="true"]');
    const label = pressed ? clean(pressed.textContent) : "Tous";
    const total = root.querySelector("#libCount");
    return `${label} · ${total ? clean(total.textContent) : "—"}`;
  }

  function statCatalogue(win) {
    const n = count(win, ".ex-card");
    return `${n} mouvement${n > 1 ? "s" : ""}`;
  }

  function statCodex(win) {
    return text(win, ".cx-level-rank") || "porteur";
  }

  function statBilan(win) {
    return `${count(win, ".bilan-cell")} axes`;
  }

  /* ------------------------------------------------------------
     Configuration des vues
     ------------------------------------------------------------ */
  const VIEWS = {
    quests: {
      code: "JRN",
      label: "Registre",
      targets: [
        { sel: ".quest-hero", id: "QST-01", name: "Registre du jour", lead: true, flush: true, stat: statHero },
        { sel: ".quest-register", id: "QST-02", name: "Quêtes du jour", card: true, stat: statRegister },
        { sel: ".quest-form-card", id: "QST-03", name: "Nouvelle quête", card: true, stat: statForm },
        { sel: ".program-card", id: "QST-04", name: "Programme", card: true, stat: statProgram },
      ],
    },
    library: {
      code: "ARS",
      label: "Arsenal",
      targets: [
        { sel: ".lib-toolbar", id: "ARS-01", name: "Filtres", flush: true, stat: statFilters },
        { sel: "#exGrid", id: "ARS-02", name: "Catalogue", flush: true, stat: statCatalogue },
      ],
    },
    profile: {
      code: "CDX",
      label: "Codex",
      targets: [
        { sel: ".codex-hero", id: "CDX-01", name: "Identité", lead: true, flush: true, stat: statCodex },
        { sel: ".bilan", id: "CDX-02", name: "Bilan", flush: true, stat: statBilan },
      ],
      sections: true,
    },
  };

  /* ------------------------------------------------------------
     Fragments de cadre
     ------------------------------------------------------------ */
  function ledsHTML() {
    return '<span class="win-leds" aria-hidden="true"><i></i><i></i><i></i></span>';
  }

  function barsHTML() {
    return '<span class="win-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  }

  function toggleHTML(name, bodyId) {
    return `<button class="win-toggle" type="button" data-win-toggle aria-expanded="true" aria-controls="${bodyId}" aria-label="Replier : ${esc(name)}">${CX.icon("chevron")}</button>`;
  }

  function footHTML(slot) {
    return `<footer class="win-foot" aria-hidden="true">
      <span class="wf-slot">SLOT ${pad2(slot)}</span>
      <span class="wf-right"><i></i>LOCAL · <b data-win-version>${storeVersion()}</b></span>
    </footer>`;
  }

  function nextSlot(root) {
    return count(root, ".win") + 1;
  }

  function keyOf(viewName) {
    return `win:${viewName}`;
  }

  /* ------------------------------------------------------------
     Construction des fenêtres
     ------------------------------------------------------------ */
  function wrap(el, target, viewName, slot) {
    const bodyId = `win-body-${++uid}`;
    const win = document.createElement("div");
    win.className = `win win--wrap${target.flush ? " win--flush" : ""}`;
    win.dataset.winId = target.id;
    win.dataset.winKey = `${keyOf(viewName)}:${target.id}`;
    win.dataset.winName = target.name;
    if (target.lead) win.dataset.winLead = "1";
    win.innerHTML = `
      <header class="win-head">
        ${ledsHTML()}
        <span class="win-id">SYS/${esc(target.id)}</span>
        <span class="win-name">${esc(target.name)}</span>
        ${target.stat ? '<span class="win-stat" data-win-stat>—</span>' : ""}
        ${barsHTML()}
        ${toggleHTML(target.name, bodyId)}
      </header>
      <div class="win-body" id="${bodyId}"></div>
      ${footHTML(slot)}
    `;

    el.parentNode.insertBefore(win, el);
    win.querySelector(".win-body").appendChild(el);
    applyCollapsed(win);
  }

  function decorateCard(card, target, viewName, slot) {
    const head = card.querySelector(":scope > .card-head");
    if (!head) {
      wrap(card, target, viewName, slot);
      return;
    }

    const bodyId = `win-body-${++uid}`;
    card.classList.add("win", "win--card");
    card.dataset.winId = target.id;
    card.dataset.winKey = `${keyOf(viewName)}:${target.id}`;
    card.dataset.winName = target.name;
    if (target.lead) card.dataset.winLead = "1";

    head.classList.add("win-head");
    head.insertAdjacentHTML("afterbegin", `${ledsHTML()}<span class="win-id">SYS/${esc(target.id)}</span>`);

    const title = head.querySelector(".card-title");
    if (title) title.classList.add("win-name");

    Array.from(head.children).forEach((child) => {
      if (child.matches(".win-leds, .win-id, .card-title")) return;
      child.classList.add("win-aside");
    });

    head.insertAdjacentHTML("beforeend", `${barsHTML()}${toggleHTML(target.name, bodyId)}`);

    const body = document.createElement("div");
    body.className = "win-body";
    body.id = bodyId;

    let node = head.nextSibling;
    while (node) {
      const next = node.nextSibling;
      body.appendChild(node);
      node = next;
    }

    card.appendChild(body);
    card.insertAdjacentHTML("beforeend", footHTML(slot));
    applyCollapsed(card);
  }

  function decorateSection(head, viewName, order) {
    const titleEl = head.querySelector(".section-title");
    const name = clean(titleEl ? titleEl.textContent : "Section");
    const id = `CDX-${pad2(order)}`;
    const bodyId = `win-body-${++uid}`;

    const win = document.createElement("section");
    win.className = "win win--section win--flush";
    win.dataset.winId = id;
    win.dataset.winKey = `${keyOf(viewName)}:${id}`;
    win.dataset.winName = name;

    const header = document.createElement("header");
    header.className = "win-head win-head--tall";
    header.innerHTML = `${ledsHTML()}<span class="win-id">SYS/${id}</span>`;

    if (titleEl) {
      if (!titleEl.id) titleEl.id = `win-title-${id.toLowerCase()}`;
      win.setAttribute("aria-labelledby", titleEl.id);
    }

    head.parentNode.insertBefore(win, head);
    header.appendChild(head);
    header.insertAdjacentHTML("beforeend", toggleHTML(name, bodyId));
    win.appendChild(header);

    const body = document.createElement("div");
    body.className = "win-body";
    body.id = bodyId;
    win.appendChild(body);

    let node = win.nextSibling;
    while (node) {
      if (node.nodeType === 1 && node.matches(".section-head, .data-note, #importFile")) break;
      const next = node.nextSibling;
      body.appendChild(node);
      node = next;
    }

    win.insertAdjacentHTML("beforeend", footHTML(nextSlot(win.parentNode) - 1));
    applyCollapsed(win);
  }

  /* ------------------------------------------------------------
     Barre système
     ------------------------------------------------------------ */
  function ensureChrome(root, config) {
    if (!root || root.querySelector(":scope > .view-chrome")) return;
    const chrome = document.createElement("div");
    chrome.className = "view-chrome";
    chrome.innerHTML = `
      <div class="vc-left">
        <span class="vc-leds" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="vc-id">SYS/${esc(config.code)}</span>
        <span class="vc-name">${esc(config.label)}</span>
      </div>
      <div class="vc-right">
        <span class="vc-count">00 FENÊTRES</span>
        <span class="vc-focus" data-win-focus>FOCUS —</span>
        <button class="vc-btn" type="button" data-win-all>Tout replier</button>
        <span class="vc-save" data-save-led><i></i><span data-save-text>SAUVEGARDÉ</span></span>
        <span class="vc-clock" data-live-clock>--:--</span>
      </div>
    `;
    root.insertBefore(chrome, root.firstChild);

    const clock = chrome.querySelector("[data-live-clock]");
    if (clock && typeof window.hudStamp === "function") clock.textContent = window.hudStamp();
  }

  /* ------------------------------------------------------------
     Repli / focus
     ------------------------------------------------------------ */
  function applyCollapsed(win) {
    const key = win.dataset.winKey || "";
    const isCollapsed = Boolean(collapsed[key]);
    const button = win.querySelector("[data-win-toggle]");
    const name = win.dataset.winName || "cette fenêtre";
    win.classList.toggle("is-collapsed", isCollapsed);
    if (button) {
      button.setAttribute("aria-expanded", String(!isCollapsed));
      button.setAttribute("aria-label", `${isCollapsed ? "Déplier" : "Replier"} : ${name}`);
    }
  }

  function setCollapsed(win, value, silent) {
    if (!win) return;
    const key = win.dataset.winKey || "";
    if (value) collapsed[key] = true;
    else delete collapsed[key];
    applyCollapsed(win);
    if (!silent) persistCollapsed();
  }

  function syncAll(root) {
    const windows = Array.from(root.querySelectorAll(".win"));
    const button = root.querySelector("[data-win-all]");
    const allCollapsed = windows.length > 0 && windows.every((win) => win.classList.contains("is-collapsed"));
    if (button) button.textContent = allCollapsed ? "Tout déplier" : "Tout replier";
  }

  function toggleAll(root) {
    const windows = Array.from(root.querySelectorAll(".win"));
    if (!windows.length) return;
    const allCollapsed = windows.every((win) => win.classList.contains("is-collapsed"));
    windows.forEach((win) => setCollapsed(win, !allCollapsed, true));
    persistCollapsed();
    syncAll(root);
  }

  function activate(win) {
    if (!win) return;
    const root = win.closest(".view");
    if (!root) return;
    root.querySelectorAll(".win.is-win-active").forEach((other) => {
      if (other !== win) other.classList.remove("is-win-active");
    });
    win.classList.add("is-win-active");
    const focus = root.querySelector("[data-win-focus]");
    if (focus) focus.textContent = `FOCUS ${win.dataset.winId || "—"}`;
  }

  function bind() {
    if (bound) return;
    bound = true;

    document.addEventListener("click", (event) => {
      const all = event.target.closest("[data-win-all]");
      if (all) {
        const root = all.closest(".view");
        if (root) toggleAll(root);
        return;
      }
      const toggle = event.target.closest("[data-win-toggle]");
      if (!toggle) return;
      const win = toggle.closest(".win");
      if (!win) return;
      setCollapsed(win, !win.classList.contains("is-collapsed"));
      const root = win.closest(".view");
      if (root) syncAll(root);
    });

    document.addEventListener(
      "pointerdown",
      (event) => {
        const win = event.target.closest(".win");
        if (win) activate(win);
      },
      { passive: true }
    );

    document.addEventListener("focusin", (event) => {
      const win = event.target.closest(".win");
      if (win) activate(win);
    });
  }

  /* ------------------------------------------------------------
     Rafraîchissement des statuts
     ------------------------------------------------------------ */
  function refresh(viewName) {
    const root = document.getElementById(`view-${viewName}`);
    const config = VIEWS[viewName];
    if (!root || !config) return;

    const version = storeVersion();
    root.querySelectorAll("[data-win-version]").forEach((el) => {
      el.textContent = version;
    });

    root.querySelectorAll(".win").forEach((win) => {
      const target = (config.targets || []).find((item) => item.id === win.dataset.winId);
      const stat = win.querySelector("[data-win-stat]");
      if (stat && target && typeof target.stat === "function") {
        const value = target.stat(win, root);
        stat.textContent = value || "—";
      }
    });

    const total = count(root, ".win");
    const countEl = root.querySelector(".vc-count");
    if (countEl) countEl.textContent = `${pad2(total)} FENÊTRE${total > 1 ? "S" : ""}`;

    const active = root.querySelector(".win.is-win-active");
    const focus = root.querySelector("[data-win-focus]");
    if (focus) focus.textContent = active ? `FOCUS ${active.dataset.winId}` : "FOCUS —";

    syncAll(root);
  }

  /* ------------------------------------------------------------
     Signal de sauvegarde
     ------------------------------------------------------------ */
  function pulseSave() {
    const leds = document.querySelectorAll("[data-save-led]");
    if (!leds.length) return;
    leds.forEach((el) => el.classList.add("is-writing"));
    document.querySelectorAll("[data-save-text]").forEach((el) => {
      el.textContent = "ÉCRITURE";
    });
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      document.querySelectorAll("[data-save-led]").forEach((el) => el.classList.remove("is-writing"));
      document.querySelectorAll("[data-save-text]").forEach((el) => {
        el.textContent = "SAUVEGARDÉ";
      });
      saveTimer = 0;
    }, 900);
  }

  /* ------------------------------------------------------------
     Entrée principale
     ------------------------------------------------------------ */
  function decorate(viewName) {
    const root = document.getElementById(`view-${viewName}`);
    const config = VIEWS[viewName];
    if (!root || !config) return;

    ensureChrome(root, config);

    (config.targets || []).forEach((target) => {
      root.querySelectorAll(target.sel).forEach((el) => {
        if (!el || el.dataset.winId || el.closest(".win")) return;
        const slot = nextSlot(root);
        if (target.card && el.classList.contains("card") && el.querySelector(":scope > .card-head")) {
          decorateCard(el, target, viewName, slot);
        } else {
          wrap(el, target, viewName, slot);
        }
      });
    });

    if (config.sections) {
      root.querySelectorAll(".section-head").forEach((head, index) => {
        if (head.closest(".win")) return;
        decorateSection(head, viewName, index + 3);
      });
    }

    bind();

    const current = root.querySelector(".win.is-win-active");
    if (!current) {
      const first = root.querySelector(".win[data-win-lead]") || root.querySelector(".win");
      if (first) activate(first);
    }

    refresh(viewName);
  }

  CX.windows = { decorate, refresh, pulseSave };
})();
