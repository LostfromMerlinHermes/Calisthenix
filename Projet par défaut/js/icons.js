/* ============================================================
   CALISTHENIX — iconographie maison
   icons.js — aucun emoji : des tracés, une seule famille.
   Expose window.CX.icon(), CX.sigil(), CX.seal().
   ============================================================ */
(function () {
  "use strict";

  const CX = (window.CX = window.CX || {});

  /* Tracés 24×24, pensés pour un trait de 1.5 et des angles francs. */
  const PATHS = {
    threshold:
      '<path d="M12 2.6 21.4 12 12 21.4 2.6 12Z"/><circle cx="12" cy="12" r="5.1"/><path d="M12 6.9v10.2M6.9 12h10.2"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
    quests:
      '<path d="M9.5 6.5H21M9.5 12H21M9.5 17.5H21"/><path d="m3.4 6.5 1.5 1.6 2.3-2.4"/><path d="m3.4 12 1.5 1.6 2.3-2.4"/><path d="m3.4 17.5 1.5 1.6 2.3-2.4"/>',
    arsenal:
      '<path d="M3.5 4.5v15M20.5 4.5v15M3.5 8h17M3.5 16h17"/><path d="M8.5 8v8M15.5 8v8"/>',
    codex:
      '<path d="M6.2 3.8h10.6a2.6 2.6 0 0 1 2.6 2.6v13.8H8.8a2.6 2.6 0 0 1-2.6-2.6V3.8Z"/><path d="M6.2 3.8v13.8"/><path d="M10 8.2h6.2M10 11.6h6.2M10 15h4"/>',
    blade:
      '<path d="M14.4 3.4h6.2v6.2L10.2 20 4 13.8 14.4 3.4Z"/><path d="m4.4 15.4 4.2 4.2M6.8 20.6l2.6-2.6M14.6 6.4l3 3"/>',
    flame:
      '<path d="M12 21c3.9 0 6.4-2.6 6.4-6 0-4.6-4.2-6.3-4.8-11.2-2.2 1.5-3.2 3.5-3.1 5.7-1-.4-1.8-1.3-2.2-2.5C7 9 5.6 11.5 5.6 15c0 3.4 2.5 6 6.4 6Z"/><path d="M12 21c-1.6 0-2.7-1.2-2.7-2.7 0-1.9 1.6-2.7 2.2-4.6.9.9 3.2 2.5 3.2 4.6 0 1.5-1.1 2.7-2.7 2.7Z"/>',
    bolt: '<path d="M13.6 2.6 4.2 13.6h5.9L10.4 21.4 19.8 10.4h-5.9L13.6 2.6Z"/>',
    play: '<path d="M8 4.6 19 12 8 19.4V4.6Z"/>',
    check: '<path d="m4.6 12.6 4.6 4.6L19.6 6.6"/>',
    plus: '<path d="M12 4.4v15.2M4.4 12h15.2"/>',
    arrow: '<path d="M4 12h15.2M13.4 6.2 19.2 12l-5.8 5.8"/>',
    chevron: '<path d="m9 5.5 7 6.5-7 6.5"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.6 4.6"/>',
    trash:
      '<path d="M4 7h16M9 7V5.2a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 5.2V7M6 7l1 12.1a1.1 1.1 0 0 0 1.1 1h7.8a1.1 1.1 0 0 0 1.1-1L18 7M10 11v5M14 11v5"/>',
    lock:
      '<rect x="5" y="10.2" width="14" height="9.8" rx="1.2"/><path d="M8.2 10.2V7.4a3.8 3.8 0 0 1 7.6 0v2.8"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.4 2.1"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="3.4"/><path d="M12 1.6v3.2M12 19.2v3.2M1.6 12h3.2M19.2 12h3.2"/>',
    seal:
      '<circle cx="12" cy="9.2" r="5.4"/><path d="M8.4 13.6 6.8 21.4l5.2-2.9 5.2 2.9-1.6-7.8"/><path d="m10 9.2 1.5 1.5 2.9-2.9"/>',
    shield: '<path d="M12 2.8 20 5.6v6c0 4.6-3.2 7.7-8 9.6-4.8-1.9-8-5-8-9.6v-6L12 2.8Z"/><path d="M12 7.4v7.2"/>',
    spark: '<path d="M12 2.6c.8 5.3 3.1 7.6 8.4 8.4-5.3.8-7.6 3.1-8.4 8.4-.8-5.3-3.1-7.6-8.4-8.4 5.3-.8 7.6-3.1 8.4-8.4Z"/>',
    route:
      '<circle cx="6" cy="18.2" r="2.8"/><circle cx="18" cy="5.8" r="2.8"/><path d="M8.8 18.2h4.4a3 3 0 0 0 3-3V8.6"/><path d="m13.4 10.4 2.8-2.8 2.8 2.8"/>',
    user: '<circle cx="12" cy="8.2" r="4.1"/><path d="M4.4 20.4c.7-3.7 3.7-5.8 7.6-5.8s6.9 2.1 7.6 5.8"/>',
    sound:
      '<path d="M4 9.4h3.4L12 5.6v12.8L7.4 14.6H4Z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M17.8 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    mute:
      '<path d="M4 9.4h3.4L12 5.6v12.8L7.4 14.6H4Z"/><path d="m15.6 9.6 4.8 4.8M20.4 9.6l-4.8 4.8"/>',
    download: '<path d="M12 3.6v11.2M7.4 10.4 12 15l4.6-4.6M4.6 19.6h14.8"/>',
    upload: '<path d="M12 15.4V4.2M7.4 8.8 12 4.2l4.6 4.6M4.6 19.6h14.8"/>',
    reset:
      '<path d="M4.6 12a7.4 7.4 0 1 1 2.2 5.3"/><path d="M4.2 5.4v4.2h4.2"/>',
    hourglass:
      '<path d="M6.4 3.4h11.2M6.4 20.6h11.2"/><path d="M7.6 3.4v3.2c0 2.4 4.4 3.6 4.4 5.4s-4.4 3-4.4 5.4v3.2M16.4 3.4v3.2c0 2.4-4.4 3.6-4.4 5.4s4.4 3 4.4 5.4v3.2"/>',
    crown:
      '<path d="M3.6 7.4 7.4 11 12 4.4 16.6 11l3.8-3.6-1.5 11H5.1L3.6 7.4Z"/><path d="M5.1 18.4h13.8"/>',
    muscle:
      '<path d="M4.6 15.4c0-3 1.4-5.2 3.4-6.6 1.8-1.3 2.2-2.4 2.2-4.2 1.8.2 3 1.4 3.4 3 2.6-.6 4.8.6 5.6 3 .8 2.4-.4 5-2.8 6.4-2.2 1.3-5 1.4-7.2.4-2.2-1-4.6-.9-4.6-2Z"/><path d="M8.4 13.6c1.2.8 3 1.2 4.6.8"/>',
  };

  /**
   * Icône SVG. Décorative par défaut (aria-hidden) ; passer un label
   * pour une icône porteuse de sens.
   */
  CX.icon = function icon(name, options) {
    const opts = options || {};
    const body = PATHS[name] || PATHS.spark;
    const cls = opts.className ? ` class="${opts.className}"` : "";
    const label = opts.label
      ? ` role="img" aria-label="${String(opts.label).replace(/"/g, "&quot;")}"`
      : ' aria-hidden="true"';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.stroke || 1.5}" stroke-linecap="round" stroke-linejoin="round"${cls}${label}>${body}</svg>`;
  };

  CX.hasIcon = (name) => Object.prototype.hasOwnProperty.call(PATHS, name);

  /* ------------------------------------------------------------
     Sigil du porteur — généré à partir du nom, stable dans le temps.
     ------------------------------------------------------------ */
  function hash(value) {
    let h = 2166136261;
    const str = String(value || "porteur");
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  CX.sigil = function sigil(name, options) {
    const opts = options || {};
    const seed = hash(name);
    const a = seed % 360;
    const b = (seed >> 7) % 3;
    const c = (seed >> 11) % 4;
    const size = opts.size || 48;
    const inner = [
      `<path d="M32 12 48.5 21.5v21L32 52l-16.5-9.5v-21L32 12Z" stroke="currentColor" stroke-width="1.1" opacity=".55"/>`,
      `<path d="M32 20.5 42.5 26.5v11L32 43.5l-10.5-6v-11L32 20.5Z" stroke="currentColor" stroke-width=".9" opacity=".3" transform="rotate(${a} 32 32)"/>`,
      b === 0
        ? `<path d="M32 24v16M24 32h16" stroke="currentColor" stroke-width="1.2"/>`
        : b === 1
          ? `<path d="M25.5 38.5 32 23l6.5 15.5M28 33.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`
          : `<path d="M32 24c4.5 2.4 6.5 5.4 6.5 8.4 0 3.4-2.6 5.6-6.5 5.6s-6.5-2.2-6.5-5.6c0-3 2-6 6.5-8.4Z" stroke="currentColor" stroke-width="1.1"/>`,
      c === 0
        ? `<circle cx="32" cy="32" r="3.1" fill="currentColor" opacity=".85"/>`
        : c === 1
          ? `<path d="M32 28.4 35.6 32 32 35.6 28.4 32Z" fill="currentColor" opacity=".8"/>`
          : c === 2
            ? `<circle cx="32" cy="32" r="2.2" fill="none" stroke="currentColor" stroke-width="1.3"/>`
            : `<path d="M28.4 32h7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    ].join("");
    return `<svg class="sigil" viewBox="0 0 64 64" width="${size}" height="${size}" fill="none" aria-hidden="true">${inner}</svg>`;
  };

  /* Sceau de succès — numéral gravé dans un losange. */
  CX.seal = function seal(glyph, options) {
    const opts = options || {};
    return `<svg viewBox="0 0 64 64" class="seal-glyph" fill="none" aria-hidden="true">
      <path d="M32 4 60 32 32 60 4 32Z" stroke="currentColor" stroke-width="1" opacity=".45"/>
      <path d="M32 11 53 32 32 53 11 32Z" stroke="currentColor" stroke-width=".7" opacity=".2"/>
      <text x="32" y="33" text-anchor="middle" dominant-baseline="central" fill="currentColor"
        font-family="Azeret Mono, monospace" font-size="${opts.size || 13}" letter-spacing="1">${glyph}</text>
    </svg>`;
  };

  /* Icône de muscle — réutilisable dans l'arsenal. */
  CX.muscleIcon = function muscleIcon(muscle) {
    const map = {
      Pectoraux: "shield",
      Dos: "arsenal",
      Jambes: "route",
      Gainage: "target",
      Triceps: "blade",
      Épaules: "shield",
      Cardio: "flame",
      "Full body": "muscle",
    };
    return map[muscle] || "muscle";
  };
})();
