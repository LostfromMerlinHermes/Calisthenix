/* ============================================================
   CALISTHENIX — le Quartier Général
   hub.js — scène persistante du Seuil. Montée une seule fois,
   puis mise à jour ciblée depuis l'état réel du jeu.
   Expose CX.hub.
   ============================================================ */
(function () {
  "use strict";

  const CX = (window.CX = window.CX || {});
  if (!CX.icon) throw new Error("icons.js doit être chargé avant hub.js");

  const ARC_C = 2 * Math.PI * 86;
  const esc = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const num = (value) => new Intl.NumberFormat("fr-FR").format(Math.round(Number(value) || 0));

  const QUOTE = {
    empty: "Aucune quête active. Le Système attend un premier geste pour stabiliser la Porte.",
    idle: (n) => `Porte instable. <b>${n} quête${n > 1 ? "s" : ""}</b> ${n > 1 ? "attendent" : "attend"} d'être validée${n > 1 ? "s" : ""} aujourd'hui.`,
    partial: (done, total, rest) => `<b>${done}</b> validée${done > 1 ? "s" : ""} sur ${total}. Encore <strong>${rest}</strong> pour faire céder la bête.`,
    full: "Journée close. La bête recule. Repos mérité, Porteur — reviens demain reprendre la chasse.",
  };

  const TEMPLATE = `
    <div class="hub-gridtex" aria-hidden="true"></div>
    <div class="hub-bloom" aria-hidden="true"></div>
    <canvas class="hub-gate" aria-hidden="true"></canvas>
    <div class="hub-fog" aria-hidden="true"></div>
    <div class="hub-scale" aria-hidden="true"></div>
    <div class="hub-vignette" aria-hidden="true"></div>

    <div class="hub-stamp" aria-hidden="true">
      <span data-live-clock>--:--</span>
      <span><i class="hub-live"></i> SYSTÈME EN LIGNE</span>
    </div>

    <div class="hub-stage">
      <div class="hub-copy">
        <span class="hub-kicker">
          <i class="hub-live"></i> SEUIL 07 — <b data-bind="name">PORTEUR</b>
        </span>
        <h1 class="hub-title">LA PORTE<em>S'OUVRE</em></h1>
        <p class="hub-lede" data-bind="lede"></p>
        <div class="hub-cta">
          <button class="btn btn-primary" type="button" data-bind="primary"></button>
          <button class="btn btn-ghost" type="button" data-action="open-hunt">
            ${CX.icon("blade")}<span>Chasser la bête</span>
          </button>
        </div>
        <div class="hub-metrics">
          <span><b data-bind="streak">0</b><small>SÉRIE · JOURS</small></span>
          <span><b data-bind="weekXp">0</b><small>XP · 7 JOURS</small></span>
          <span><b data-bind="volume">0</b><small>VOLUME · RÉPS</small></span>
        </div>
        <div class="hub-chapter">
          <div class="chapter-top">
            <span data-bind="chapterLabel">CHAPITRE I</span>
            <strong data-bind="chapterTitle">L'Éveil du Porteur</strong>
          </div>
          <div class="chapter-track" data-bind="chapterTrack" aria-hidden="true"></div>
          <span class="chapter-note" data-bind="chapterNote"></span>
        </div>
      </div>

      <div class="hub-seal" data-bind="seal" role="img" aria-label="Niveau 1, Recrue">
        <svg class="seal-svg" viewBox="0 0 200 200" aria-hidden="true">
          <circle class="seal-track" cx="100" cy="100" r="86" stroke-width="1.2"/>
          <circle class="seal-arc" data-bind="arc" cx="100" cy="100" r="86" stroke-width="2.4"
            stroke-dasharray="${ARC_C.toFixed(2)}" stroke-dashoffset="${ARC_C.toFixed(2)}"/>
        </svg>
        <span class="seal-kicker">NIVEAU</span>
        <span class="seal-level" data-bind="level">1</span>
        <span class="seal-rank" data-bind="rank">RECRUE · E</span>
        <span class="seal-xp" data-bind="xp">0 / 100 XP</span>
      </div>
    </div>

    <div class="hub-dock">
      <section class="dock-panel dock-ledger" aria-label="Quêtes du jour">
        <div class="dock-head">
          <span class="dock-label">Aujourd'hui</span>
          <span class="dock-count"><b data-bind="done">0</b>/<span data-bind="total">0</span></span>
        </div>
        <div class="led-list" data-bind="ledger"></div>
        <button class="dock-link" type="button" data-nav="quests">
          Ouvrir le journal <span>→</span>
        </button>
      </section>

      <section class="dock-panel dock-ritual" aria-label="Rituel du jour">
        <div class="dock-head">
          <span class="dock-label">Rituel du jour</span>
          <span class="dock-count" data-bind="programTier">Débutant</span>
        </div>
        <div class="ritual-main">
          <strong data-bind="programTitle">Récupération</strong>
          <span data-bind="programMeta">Repos planifié</span>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" data-bind="programBtn"></button>
      </section>

      <section class="dock-panel dock-oath" aria-label="Serment de la semaine">
        <div class="dock-head">
          <span class="dock-label">Serment</span>
          <span class="dock-count" data-bind="oathWeek">S. —</span>
        </div>
        <div class="oath-body" data-bind="oathBody"></div>
      </section>

      <section class="dock-panel dock-threat" aria-label="Épreuve de la semaine">
        <div class="dock-head">
          <span class="dock-label">Épreuve</span>
          <span class="dock-count" data-bind="bossDays">6 j</span>
        </div>
        <strong class="threat-name" data-bind="bossName">La Rouille</strong>
        <span class="threat-epithet" data-bind="bossEpithet">celle qui mange les articulations</span>
        <div class="threat-meter" role="progressbar" data-bind="bossMeter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <i data-bind="bossFill" style="width:0%"></i>
        </div>
        <div class="threat-meta">
          <span data-bind="bossHp">0 / 0</span>
          <button class="dock-link" type="button" data-action="open-hunt">Engager <span>→</span></button>
        </div>
      </section>
    </div>
  `;

  const hub = {
    root: null,
    refs: null,
    gate: null,
    active: true,
    mounted: false,
    _ledgerSig: "",
    _chapterCount: 0,

    mount(container) {
      container.innerHTML = `<div class="hub" data-hub>${TEMPLATE}</div>`;
      this.root = container.querySelector("[data-hub]");
      this.refs = {};
      this.root.querySelectorAll("[data-bind]").forEach((el) => {
        const key = el.dataset.bind;
        if (!this.refs[key]) this.refs[key] = el;
      });
      this.refs.ledgerSig = "";
      this.gate = CX.gate.create(this.root.querySelector(".hub-gate"));
      if (!this.gate) {
        this.root.classList.add("no-gate");
        console.info("[Calisthenix] Portail : repli statique (aucun contexte graphique).");
      }
      this.mounted = true;
      const clock = this.root.querySelector("[data-live-clock]");
      if (clock && typeof window.hudStamp === "function") clock.textContent = window.hudStamp();
      this.root.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-hub-oath-toggle]");
        if (toggle) {
          const open = this.root.classList.toggle("is-oath-open");
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          return;
        }
        if (event.target.closest("[data-action='take-oath']")) {
          this.root.classList.remove("is-oath-open");
        }
      });
      window.requestAnimationFrame(() => {
        if (this.root) this.root.classList.add("is-in");
      });
    },

    render(model) {
      const container = document.getElementById("view-dashboard");
      if (!container) return;
      if (!this.mounted || !this.root || !container.contains(this.root)) this.mount(container);
      this.update(model);
    },

    update(m) {
      if (!m || !this.refs) return;
      const r = this.refs;

      /* identité */
      if (r.name) r.name.textContent = m.name || "Porteur";

      /* sceau */
      const offset = ARC_C * (1 - clamp(m.levelPct || 0, 0, 100) / 100);
      if (r.arc) r.arc.setAttribute("stroke-dashoffset", offset.toFixed(2));
      if (r.level) r.level.textContent = m.level;
      if (r.rank) r.rank.textContent = `${String(m.rank || "").toUpperCase()} · ${m.className || "E"}`;
      if (r.xp) r.xp.textContent = `${num(m.xpCurrent)} / ${num(m.xpNeed)} XP`;
      if (r.seal && r.seal.setAttribute) {
        r.seal.setAttribute(
          "aria-label",
          `Niveau ${m.level}, rang ${m.rank}, classe ${m.className}. ${num(m.xpCurrent)} sur ${num(m.xpNeed)} XP.`
        );
      }

      /* métriques */
      setText(r.streak, m.streak);
      setText(r.weekXp, num(m.weekXp));
      setText(r.volume, num(m.volumeToday));

      /* chapitre */
      setText(r.chapterLabel, `CHAPITRE ${m.chapter.n}`);
      setText(r.chapterTitle, m.chapter.title);
      setText(
        r.chapterNote,
        m.chapter.nextLevel
          ? `Niveau ${m.chapter.nextLevel} pour ouvrir le chapitre ${m.chapter.nextN}`
          : "Dernier chapitre du Système"
      );
      if (r.chapterTrack && this._chapterCount !== m.chapter.total) {
        this._chapterCount = m.chapter.total;
        r.chapterTrack.innerHTML = Array.from({ length: m.chapter.total }, () => "<i></i>").join("");
      }
      if (r.chapterTrack) {
        Array.from(r.chapterTrack.children).forEach((seg, i) => {
          const index = i + 1;
          seg.className = index < m.chapter.index ? "is-on" : index === m.chapter.index ? "is-on is-current" : index === m.chapter.index + 1 ? "is-next" : "";
        });
      }

      /* discours */
      const rest = Math.max(0, m.questsTotal - m.questsDone);
      let lede = QUOTE.empty;
      if (m.questsTotal > 0) {
        if (m.questsDone === 0) lede = QUOTE.idle(rest);
        else if (m.questsDone >= m.questsTotal) lede = QUOTE.full;
        else lede = QUOTE.partial(m.questsDone, m.questsTotal, rest);
      }
      if (r.lede) r.lede.innerHTML = lede;

      /* action principale */
      if (r.primary) {
        const isProgram = m.questsTotal === 0 && m.program.items > 0;
        const label = isProgram
          ? "Charger le programme"
          : m.questsDone >= m.questsTotal && m.questsTotal > 0
            ? "Séance close — revoir le journal"
            : "Entrer dans la séance";
        if (r.primary.dataset.label !== label) {
          r.primary.dataset.label = label;
          r.primary.innerHTML = `${CX.icon(isProgram ? "route" : "play")}<span>${esc(label)}</span>`;
        }
        if (isProgram) {
          r.primary.dataset.action = "load-program";
          r.primary.dataset.id = String(m.program.index);
        } else if (m.questsDone >= m.questsTotal && m.questsTotal > 0) {
          delete r.primary.dataset.action;
          r.primary.dataset.nav = "quests";
        } else {
          r.primary.dataset.action = "open-session";
          delete r.primary.dataset.nav;
          delete r.primary.dataset.id;
        }
      }

      /* registre */
      setText(r.done, m.questsDone);
      setText(r.total, m.questsTotal);
      const sig = m.quests.map((q) => `${q.id}:${q.done ? 1 : 0}`).join("|");
      if (r.ledger && sig !== this._ledgerSig) {
        this._ledgerSig = sig;
        r.ledger.innerHTML = m.quests.length
          ? m.quests.slice(0, 4).map((q) => ledRow(q)).join("")
          : `<div class="led-empty">Aucune quête armée.<br><button class="dock-link" type="button" data-nav="library">Choisir dans l'arsenal <span>→</span></button></div>`;
      }

      /* programme */
      setText(r.programTier, m.program.tier);
      setText(r.programTitle, m.program.title);
      setText(
        r.programMeta,
        m.program.items > 0
          ? `${m.program.items} exercice${m.program.items > 1 ? "s" : ""} · +${num(m.program.xp)} XP`
          : m.program.lore || "Repos planifié"
      );
      if (r.programBtn) {
        const loaded = m.program.loaded >= m.program.items && m.program.items > 0;
        const label = !m.program.items
          ? "Voir le programme"
          : loaded
            ? "Programme engagé"
            : "Charger le programme";
        if (r.programBtn.dataset.label !== label) {
          r.programBtn.dataset.label = label;
          r.programBtn.textContent = label;
        }
        if (!m.program.items) {
          delete r.programBtn.dataset.action;
          r.programBtn.dataset.nav = "quests";
          r.programBtn.disabled = false;
        } else if (loaded) {
          delete r.programBtn.dataset.action;
          r.programBtn.dataset.nav = "quests";
          r.programBtn.disabled = false;
        } else {
          delete r.programBtn.dataset.nav;
          r.programBtn.dataset.action = "load-program";
          r.programBtn.dataset.id = String(m.program.index);
          r.programBtn.disabled = false;
        }
      }

      /* serment */
      setText(r.oathWeek, m.weekLabel || "S. —");
      if (r.oathBody) {
        const oath = m.oath;
        const sig = oath.active ? `${oath.id}:${oath.progress}:${oath.target}` : "none";
        if (r.oathBody.dataset.sig !== sig) {
          r.oathBody.dataset.sig = sig;
          r.oathBody.innerHTML = oath.active
            ? `<strong class="oath-title">${esc(oath.title)}</strong>
               <span class="oath-vow">${esc(oath.vow)}</span>
               <div class="threat-meter oath-meter"><i style="width:${oath.pct}%"></i></div>
               <span class="oath-count">${num(oath.progress)} / ${num(oath.target)}${oath.done ? " · tenu" : ""}</span>`
            : `<strong class="oath-title">Une promesse</strong>
               <span class="oath-vow">Lie-toi jusqu'à dimanche.</span>
               <button class="btn btn-ghost btn-sm" type="button" data-hub-oath-toggle aria-expanded="false">Prêter serment</button>
               <div class="oath-menu">
                 ${(oath.choices || []).map((choice) => `
                   <button type="button" data-action="take-oath" data-id="${esc(choice.id)}">
                     <b>${esc(choice.title)}</b><span>${esc(choice.vow)}</span>
                   </button>`).join("")}
               </div>`;
        }
      }

      /* épreuve */
      setText(r.bossName, m.boss.name);
      setText(r.bossEpithet, m.boss.epithet);
      setText(r.bossDays, m.boss.defeated ? "brisée" : m.boss.daysLeft === 0 ? "dernier jour" : `${m.boss.daysLeft} j`);
      setText(r.bossHp, `${num(Math.min(m.boss.damage, m.boss.maxHp))} / ${num(m.boss.maxHp)}`);
      if (r.bossFill) r.bossFill.style.width = `${m.boss.pct}%`;
      if (r.bossMeter) r.bossMeter.setAttribute("aria-valuenow", String(m.boss.pct));
    },

    setActive(next) {
      this.active = Boolean(next);
      if (this.gate) this.gate.setActive(this.active);
      if (this.root) this.root.classList.toggle("is-paused", !this.active);
    },

    destroy() {
      if (this.gate) this.gate.destroy();
      this.gate = null;
      this.root = null;
      this.refs = null;
      this.mounted = false;
    },
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function setText(el, value) {
    if (!el) return;
    const text = String(value == null ? "" : value);
    if (el.textContent !== text) el.textContent = text;
  }
  function ledRow(q) {
    const label = q.done ? "Annuler la quête" : "Valider la quête";
    return `
      <div class="led-row ${q.done ? "is-done" : ""}">
        <button class="led-check" type="button" data-action="toggle-task" data-id="${esc(q.id)}"
          aria-pressed="${q.done ? "true" : "false"}" aria-label="${label} : ${esc(q.name)}">
          ${CX.icon("check", { stroke: 2.6 })}
        </button>
        <span class="led-name">${esc(q.name)}</span>
        <span class="led-xp">${q.done ? CX.icon("check", { stroke: 2.4 }) : `+${num(q.xp)}`}</span>
      </div>`;
  }

  CX.hub = hub;
})();
