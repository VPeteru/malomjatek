/* Saját tervezésű, illusztrált figura-jelvények (agar.io-stílusú kerek "skinek").
   Minden figura egy -50..50 koordinátájú SVG csoport. A játékos színe a keretgyűrű
   és néhány kiemelés (toll, szem, kristály); maga az illusztráció szettenként egyedi. */
(function () {
  'use strict';

  // A két játékos színe: rubin és zafír. A játékost minden keretstílusnál a
  // színes gyűrű jelzi (az arany keretnél a tetején ülő drágakő is).
  const PALETTES = [
    { c: '#E0475B', d: '#8E1F30', l: '#FFC2CB', glow: '#FF7A8C', name: 'ruby' },
    { c: '#4C8DFF', d: '#1A3F8F', l: '#C7DCFF', glow: '#86B4FF', name: 'sapphire' }
  ];

  const R_IN = 37.5; // a belső illusztráció sugara

  // ---------- gradiens segédek ----------
  const stops = (arr) => arr.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lin = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rad = (id, s, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}>${stops(s)}</radialGradient>`;

  function commonDefs(id, p) {
    return lin(id + '-rim', [[0, '#FFF1B8'], [0.22, '#F3D274'], [0.5, '#C9982E'], [0.78, '#E8C25A'], [1, '#7A5814']], 0.15, 0, 0.85, 1) +
      lin(id + '-rimhi', [[0, '#fff', 0.8], [0.5, '#fff', 0]], 0, 0, 0, 1) +
      lin(id + '-graf', [[0, '#7A8298'], [0.45, '#454D63'], [1, '#262C3D']], 0.2, 0, 0.8, 1) +
      rad(id + '-gem', [[0, '#fff'], [0.3, p.l], [0.7, p.c], [1, p.d]], 0.35, 0.3, 0.7) +
      `<clipPath id="${id}-clip"><circle r="${R_IN}"/></clipPath>`;
  }

  // Keretstílusok. Minden figura az összes keretet tartalmazza, és CSS választja
  // ki, melyik látszik (a legközelebbi data-frame attribútum alapján), így a
  // keret átváltásához nem kell semmit újrarajzolni.
  const FRAMES = [
    { id: 'letisztult', name: 'Letisztult', nameEn: 'Clean' },
    { id: 'grafit', name: 'Grafit', nameEn: 'Graphite' },
    { id: 'szines', name: 'Színes', nameEn: 'Colour' },
    { id: 'nelkul', name: 'Keret nélkül', nameEn: 'No frame' },
    { id: 'arany', name: 'Arany', nameEn: 'Gold' }
  ];
  const DEFAULT_FRAME = 'letisztult';

  function frame(id, p, art, bg) {
    return `
      <ellipse cx="0" cy="44" rx="34" ry="7" fill="rgba(0,0,0,.32)"/>
      <g class="fr fr-arany">
        <circle r="48" fill="#3A2A08"/>
        <circle r="46.5" fill="url(#${id}-rim)"/>
        <circle r="46.5" fill="none" stroke="url(#${id}-rimhi)" stroke-width="1.6"/>
        <circle r="42.6" fill="none" stroke="#7A5814" stroke-width=".8" opacity=".7"/>
        <circle r="${R_IN + 2.2}" fill="#1A1206"/>
      </g>
      <g class="fr fr-letisztult">
        <circle r="46" fill="#10172B"/>
        <circle r="45.5" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
      </g>
      <g class="fr fr-grafit">
        <circle r="47" fill="url(#${id}-graf)"/>
        <circle r="46.5" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/>
        <circle r="${R_IN + 2.4}" fill="#0B0F1A"/>
      </g>
      <g class="fr fr-szines">
        <circle r="47" fill="${p.c}"/>
        <circle r="46.4" fill="none" stroke="${p.d}" stroke-width="1.2"/>
        <circle r="${R_IN + 2.4}" fill="#fff" opacity=".92"/>
      </g>
      <g class="fr-art">
        <g clip-path="url(#${id}-clip)">
          <circle r="${R_IN}" fill="${bg}"/>
          ${art}
          <circle r="${R_IN}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="5"/>
        </g>
      </g>
      <g class="fr fr-arany">
        <circle r="${R_IN + 0.6}" fill="none" stroke="${p.c}" stroke-width="2.2"/>
        <path d="M-31,-20 A37,37 0 0 1 31,-20 C18,-28 -18,-28 -31,-20 Z" fill="#fff" opacity=".2"/>
        <g class="gem"><path d="M0,-50.5 L6.2,-45 L0,-38.5 L-6.2,-45 Z" fill="url(#${id}-gem)" stroke="#3A2A08" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M0,-50.5 L2.6,-46 L0,-44.6 L-2.6,-46 Z" fill="#fff" opacity=".7"/></g>
      </g>
      <circle class="fr fr-letisztult" r="${R_IN + 3}" fill="none" stroke="${p.c}" stroke-width="3.4"/>
      <g class="fr fr-grafit">
        <circle r="${R_IN + 0.6}" fill="none" stroke="${p.c}" stroke-width="2.4"/>
        <circle cy="-43.2" r="2.6" fill="${p.c}"/>
      </g>
      <circle class="fr fr-nelkul" r="45.6" fill="none" stroke="${p.c}" stroke-width="3.2"/>`;
  }

  const SKINS = {
    klasszikus: {
      name: 'Ónix érme',
      anim: 'drop',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#4A5070'], [1, '#12152A']], 0.35, 0.3, 0.8) +
        lin(id + '-star', [[0, p.l], [0.5, p.c], [1, p.d]], 0, 0, 1, 1),
      draw: (id, p) => frame(id, p, `
        <g fill="none" stroke="${p.c}" stroke-linecap="round" opacity=".35">
          <path d="M-40,8 C-24,-10 -6,22 12,4 S34,-14 44,2" stroke-width="3"/>
          <path d="M-40,22 C-20,10 0,34 20,18 S38,12 44,18" stroke-width="2"/>
          <path d="M-36,-16 C-18,-30 4,-6 22,-22 S40,-30 44,-24" stroke-width="2"/>
        </g>
        <circle r="27" fill="#0B1022" opacity=".35"/>
        <circle r="25" fill="none" stroke="${p.c}" stroke-width="2" opacity=".7"/>
        <circle r="21" fill="none" stroke="${p.l}" stroke-width="1" stroke-dasharray="2 3" opacity=".6"/>
        <circle r="16" fill="${p.glow}" opacity=".22"/>
        <path d="M0,-24 C3,-7 7,-3 24,0 C7,3 3,7 0,24 C-3,7 -7,3 -24,0 C-7,-3 -3,-7 0,-24 Z" fill="url(#${id}-star)" stroke="${p.d}" stroke-width="1.4"/>
        <path d="M0,-24 C2,-8 4,-4 11,-1 L0,0 Z M24,0 C8,2 4,4 1,11 L0,0 Z" fill="#fff" opacity=".5"/>
        <path d="M-10,-10 L-14,-14 M10,-10 L14,-14 M-10,10 L-14,14 M10,10 L14,14" stroke="${p.l}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
        <circle r="2.6" fill="#fff" opacity=".9"/>`, `url(#${id}-bg)`)
    },

    lovag: {
      name: 'Vaslovagok',
      anim: 'slam',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#A8303F'], [1, '#3B0A14']], 0.5, 0.35, 0.75) +
        lin(id + '-steel', [[0, '#F4F7FB'], [0.45, '#AEB9C7'], [1, '#56606F']], 0, 0, 1, 1) +
        lin(id + '-plume', [[0, p.l], [0.5, p.c], [1, p.d]], 0, 0, 1, 1),
      draw: (id, p) => frame(id, p, `
        <g fill="#FFD27A" opacity=".12">
          <polygon points="0,0 -8,-40 8,-40"/><polygon points="0,0 28,-30 34,-20"/><polygon points="0,0 40,-6 40,8"/>
          <polygon points="0,0 -28,-30 -34,-20"/><polygon points="0,0 -40,-6 -40,8"/>
        </g>
        <path d="M2,-24 C6,-44 30,-46 34,-28 C28,-34 18,-33 14,-26 C24,-30 30,-24 30,-16 C24,-22 14,-22 8,-18 Z" fill="url(#${id}-plume)" stroke="${p.d}" stroke-width="1.2"/>
        <path d="M8,-30 C14,-38 24,-39 29,-33" fill="none" stroke="${p.l}" stroke-width="1.6" opacity=".8"/>
        <path d="M-24,40 L-24,-2 C-24,-28 24,-28 24,-2 L24,40 Z" fill="url(#${id}-steel)" stroke="#2A303B" stroke-width="2"/>
        <path d="M0,-27 L0,40" stroke="#fff" stroke-width="2.4" opacity=".55"/>
        <path d="M-24,-4 L24,-4 L24,6 L-24,6 Z" fill="#3A4250"/>
        <rect x="-18" y="-1.5" width="14" height="4" rx="2" fill="#07090F"/>
        <rect x="4" y="-1.5" width="14" height="4" rx="2" fill="#07090F"/>
        <g fill="#2A303B">
          <circle cx="-9" cy="14" r="1.7"/><circle cx="-3" cy="14" r="1.7"/><circle cx="3" cy="14" r="1.7"/><circle cx="9" cy="14" r="1.7"/>
          <circle cx="-6" cy="20" r="1.7"/><circle cx="0" cy="20" r="1.7"/><circle cx="6" cy="20" r="1.7"/>
        </g>
        <g fill="#E8EDF3" stroke="#2A303B" stroke-width=".8">
          <circle cx="-19" cy="-12" r="2"/><circle cx="19" cy="-12" r="2"/><circle cx="-19" cy="28" r="2"/><circle cx="19" cy="28" r="2"/>
        </g>
        <path d="M-16,-20 C-10,-25 -4,-26 0,-26" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`, `url(#${id}-bg)`)
    },

    robot: {
      name: 'Kiberrobotok',
      anim: 'boot',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#2F4470'], [1, '#0B1222']], 0.5, 0.4, 0.75) +
        lin(id + '-metal', [[0, '#EEF3F8'], [0.5, '#A7B3C2'], [1, '#5E6A7B']], 0, 0, 0.6, 1) +
        rad(id + '-eye', [[0, '#fff'], [0.35, p.glow], [1, p.d]], 0.5, 0.5, 0.6),
      draw: (id, p) => frame(id, p, `
        <g fill="none" stroke="${p.glow}" stroke-width="1.6" opacity=".35">
          <path d="M-40,-24 H-28 V-34"/><path d="M40,-18 H30 V-30 H22"/><path d="M-40,26 H-30 V36"/><path d="M40,24 H30 V34"/>
        </g>
        <g fill="${p.glow}" opacity=".5"><circle cx="-28" cy="-34" r="2"/><circle cx="22" cy="-30" r="2"/><circle cx="-30" cy="36" r="2"/><circle cx="30" cy="34" r="2"/></g>
        <line x1="0" y1="-24" x2="0" y2="-34" stroke="#5E6A7B" stroke-width="3"/>
        <circle cx="0" cy="-35" r="6" fill="${p.glow}" opacity=".35"/>
        <circle cx="0" cy="-35" r="3.6" fill="${p.glow}" class="blink"/>
        <rect x="-33" y="-6" width="7" height="18" rx="3" fill="#56606F"/>
        <rect x="26" y="-6" width="7" height="18" rx="3" fill="#56606F"/>
        <rect x="-27" y="-24" width="54" height="50" rx="15" fill="url(#${id}-metal)" stroke="#2A3140" stroke-width="2"/>
        <rect x="-21" y="-15" width="42" height="20" rx="10" fill="#070B16" stroke="#2A3140" stroke-width="1.5"/>
        <ellipse cx="-10" cy="-5" rx="9" ry="7" fill="${p.glow}" opacity=".28"/>
        <ellipse cx="10" cy="-5" rx="9" ry="7" fill="${p.glow}" opacity=".28"/>
        <g class="blink"><ellipse cx="-10" cy="-5" rx="5.5" ry="5" fill="url(#${id}-eye)"/><ellipse cx="10" cy="-5" rx="5.5" ry="5" fill="url(#${id}-eye)"/></g>
        <rect x="-12" y="11" width="24" height="9" rx="3" fill="#2A3140"/>
        <g stroke="${p.glow}" stroke-width="1.6" opacity=".85"><line x1="-7" y1="13" x2="-7" y2="18"/><line x1="-2" y1="13" x2="-2" y2="18"/><line x1="3" y1="13" x2="3" y2="18"/><line x1="8" y1="13" x2="8" y2="18"/></g>
        <g fill="#5E6A7B"><circle cx="-21" cy="-19" r="1.8"/><circle cx="21" cy="-19" r="1.8"/><circle cx="-21" cy="21" r="1.8"/><circle cx="21" cy="21" r="1.8"/></g>
        <path d="M-20,-20 C-14,-23 -6,-23 0,-23" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>`, `url(#${id}-bg)`)
    },

    kristaly: {
      name: 'Kristálybarlang',
      anim: 'spin',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#5B3492'], [1, '#150A2A']], 0.5, 0.35, 0.75) +
        lin(id + '-cA', [[0, '#fff'], [0.3, p.l], [1, p.c]], 0, 0, 1, 1) +
        lin(id + '-cB', [[0, p.c], [1, p.d]], 0, 0, 1, 1) +
        lin(id + '-rock', [[0, '#5A5470'], [1, '#221E33']]),
      draw: (id, p) => {
        const crystal = (x, y, h, w, rot) => `
          <g transform="translate(${x},${y}) rotate(${rot})">
            <polygon points="0,${-h} ${w},${-h + w * 0.9} ${w},0 0,${w * 0.5} ${-w},0 ${-w},${-h + w * 0.9}" fill="url(#${id}-cB)" stroke="${p.d}" stroke-width="1"/>
            <polygon points="0,${-h} ${-w},${-h + w * 0.9} ${-w},0 0,${w * 0.5}" fill="url(#${id}-cA)"/>
            <polygon points="0,${-h} ${w},${-h + w * 0.9} 0,${-h + w * 1.6}" fill="#fff" opacity=".45"/>
            <line x1="0" y1="${-h + w * 1.6}" x2="0" y2="${w * 0.5}" stroke="#fff" stroke-width=".8" opacity=".5"/>
          </g>`;
        return frame(id, p, `
          <g fill="#fff"><circle cx="-24" cy="-22" r="1.2" opacity=".7"/><circle cx="26" cy="-16" r="1" opacity=".6"/><circle cx="-30" cy="4" r="1" opacity=".5"/><circle cx="20" cy="-30" r="1.4" opacity=".8"/></g>
          <ellipse cx="0" cy="18" rx="34" ry="18" fill="${p.glow}" opacity=".16"/>
          ${crystal(-15, 22, 30, 7, -24)}
          ${crystal(16, 22, 28, 7, 22)}
          ${crystal(0, 20, 40, 9.5, 0)}
          <path d="M-40,40 L-40,24 C-30,18 -20,26 -10,22 C0,18 10,26 20,22 C30,18 36,24 40,22 L40,40 Z" fill="url(#${id}-rock)"/>
          <path d="M-30,24 C-24,21 -18,24 -12,23" fill="none" stroke="#8C86A3" stroke-width="1.5" opacity=".7"/>
          <path d="M-4,-26 l2,-5 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 Z" fill="#fff" class="sparkle"/>`, `url(#${id}-bg)`);
      }
    },

    urhajo: {
      name: 'Űrrakéták',
      anim: 'fly',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#25397A'], [1, '#050920']], 0.4, 0.35, 0.8) +
        lin(id + '-body', [[0, '#FFFFFF'], [0.55, '#D5DCE8'], [1, '#8D98AD']], 0, 0, 1, 0) +
        lin(id + '-nose', [[0, p.l], [1, p.d]], 0, 0, 1, 0) +
        lin(id + '-flame', [[0, '#FFF6C2'], [0.4, '#FFB23E'], [1, '#FF4D2E', 0]]) +
        rad(id + '-planet', [[0, '#E39BFF'], [1, '#6B2A9E']], 0.35, 0.3, 0.7) +
        rad(id + '-glass', [[0, '#C9F0FF'], [0.6, '#3C8DD6'], [1, '#1B3A7A']], 0.35, 0.3, 0.7),
      draw: (id, p) => frame(id, p, `
        <g fill="#fff">
          <circle cx="-26" cy="-20" r="1.3"/><circle cx="-12" cy="-32" r="1"/><circle cx="24" cy="-26" r="1.4"/><circle cx="-30" cy="10" r="1"/><circle cx="8" cy="-36" r=".9"/><circle cx="32" cy="-6" r="1"/>
        </g>
        <circle cx="24" cy="30" r="18" fill="url(#${id}-planet)"/>
        <ellipse cx="24" cy="30" rx="28" ry="6" fill="none" stroke="#F7C6FF" stroke-width="2.4" opacity=".75" transform="rotate(-18 24 30)"/>
        <g transform="rotate(38) translate(0,2)">
          <path d="M-7,24 C-6,38 0,46 0,46 C0,46 6,38 7,24 Z" fill="url(#${id}-flame)" class="flame"/>
          <path d="M-10,8 L-20,24 L-9,21 Z" fill="${p.d}"/>
          <path d="M10,8 L20,24 L9,21 Z" fill="${p.d}"/>
          <path d="M0,-34 C13,-22 13,6 10,24 L-10,24 C-13,6 -13,-22 0,-34 Z" fill="url(#${id}-body)" stroke="#3A4255" stroke-width="1.5"/>
          <path d="M0,-34 C6,-29 9.5,-22 10.8,-14 L-10.8,-14 C-9.5,-22 -6,-29 0,-34 Z" fill="url(#${id}-nose)" stroke="${p.d}" stroke-width="1.2"/>
          <circle cy="-3" r="6.5" fill="url(#${id}-glass)" stroke="#3A4255" stroke-width="2"/>
          <circle cx="-2" cy="-5" r="1.8" fill="#fff" opacity=".9"/>
          <rect x="-10" y="14" width="20" height="4" fill="${p.c}"/>
          <line x1="0" y1="24" x2="0" y2="18" stroke="#3A4255" stroke-width="2"/>
        </g>`, `url(#${id}-bg)`)
    },

    sarkany: {
      name: 'Tűzsárkányok',
      anim: 'hatch',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#FFB347'], [0.5, '#E2481F'], [1, '#5A0A06']], 0.5, 0.75, 0.9) +
        lin(id + '-skin', [[0, '#8EE06A'], [0.55, '#3E9A3A'], [1, '#1D5222']], 0, 0, 0.4, 1) +
        lin(id + '-horn', [[0, '#FFF7E2'], [1, '#B89A6A']], 0, 0, 1, 1) +
        rad(id + '-eye', [[0, '#FFF7C0'], [0.5, p.glow], [1, p.d]], 0.5, 0.5, 0.6),
      draw: (id, p) => frame(id, p, `
        <g fill="#FFDD66" opacity=".55">
          <path d="M-40,40 C-36,28 -30,30 -28,18 C-24,28 -18,26 -18,40 Z"/>
          <path d="M18,40 C18,28 24,28 28,16 C30,28 38,28 40,40 Z"/>
        </g>
        <path d="M-14,-18 C-22,-30 -30,-34 -36,-34 C-30,-28 -26,-22 -22,-12 Z" fill="url(#${id}-horn)" stroke="#6B5530" stroke-width="1"/>
        <path d="M14,-18 C22,-30 30,-34 36,-34 C30,-28 26,-22 22,-12 Z" fill="url(#${id}-horn)" stroke="#6B5530" stroke-width="1"/>
        <path d="M-27,-4 L-36,-12 L-30,4 Z M27,-4 L36,-12 L30,4 Z" fill="#2B7A30"/>
        <path d="M0,-26 C18,-26 28,-14 28,0 C28,10 22,16 16,22 C14,32 8,38 0,38 C-8,38 -14,32 -16,22 C-22,16 -28,10 -28,0 C-28,-14 -18,-26 0,-26 Z" fill="url(#${id}-skin)" stroke="#123A16" stroke-width="2"/>
        <g fill="none" stroke="#1D5222" stroke-width="1.4" opacity=".7">
          <path d="M-10,-20 q5,5 10,0 q5,5 10,0"/><path d="M-15,-13 q5,5 10,0 q5,5 10,0 q5,5 10,0"/>
        </g>
        <path d="M-12,16 C-10,10 10,10 12,16 C12,28 6,34 0,34 C-6,34 -12,28 -12,16 Z" fill="#B7EB8F" opacity=".75"/>
        <ellipse cx="-5" cy="22" rx="2" ry="3" fill="#123A16"/><ellipse cx="5" cy="22" rx="2" ry="3" fill="#123A16"/>
        <path d="M-22,-8 L-6,-2 L-8,4 C-14,6 -20,3 -22,-8 Z" fill="url(#${id}-eye)" stroke="#123A16" stroke-width="1.5"/>
        <path d="M22,-8 L6,-2 L8,4 C14,6 20,3 22,-8 Z" fill="url(#${id}-eye)" stroke="#123A16" stroke-width="1.5"/>
        <g class="blink"><ellipse cx="-12" cy="0" rx="1.5" ry="4" fill="#0A0A0A"/><ellipse cx="12" cy="0" rx="1.5" ry="4" fill="#0A0A0A"/></g>
        <path d="M-25,-13 L-5,-6 M25,-13 L5,-6" stroke="#123A16" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M-6,30 L-4,35 L-2,30 M2,30 L4,35 L6,30" fill="#FFF7E2"/>
        <path d="M-12,-20 C-6,-24 2,-25 8,-23" fill="none" stroke="#D7FFC0" stroke-width="2" stroke-linecap="round" opacity=".7"/>`, `url(#${id}-bg)`)
    },

    bagoly: {
      name: 'Holdbaglyok',
      anim: 'hop',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#34508C'], [1, '#0A1230']], 0.5, 0.3, 0.8) +
        lin(id + '-body', [[0, '#C98E56'], [1, '#5E3A1E']]) +
        rad(id + '-face', [[0, '#FFF1D8'], [1, '#D9B98A']], 0.5, 0.45, 0.6) +
        rad(id + '-iris', [[0, p.l], [0.6, p.c], [1, p.d]], 0.5, 0.5, 0.55),
      draw: (id, p) => frame(id, p, `
        <circle cx="0" cy="-30" r="7" fill="#FFF3C4"/>
        <circle cx="3.5" cy="-32" r="6.2" fill="#30498A"/>
        <g fill="#fff"><circle cx="-26" cy="-24" r="1.1"/><circle cx="-14" cy="-32" r=".9"/><circle cx="30" cy="0" r="1"/></g>
        <path d="M-26,-14 L-22,-32 L-12,-20 Z" fill="#5E3A1E"/>
        <path d="M26,-14 L22,-32 L12,-20 Z" fill="#5E3A1E"/>
        <path d="M0,-24 C22,-24 30,-6 30,12 C30,32 16,42 0,42 C-16,42 -30,32 -30,12 C-30,-6 -22,-24 0,-24 Z" fill="url(#${id}-body)" stroke="#3A230F" stroke-width="2"/>
        <g fill="none" stroke="#3A230F" stroke-width="1.4" opacity=".55">
          <path d="M-12,24 l4,4 l4,-4"/><path d="M4,24 l4,4 l4,-4"/><path d="M-4,31 l4,4 l4,-4"/><path d="M-16,32 l4,4 l4,-4"/><path d="M8,32 l4,4 l4,-4"/>
        </g>
        <path d="M0,-6 C-4,-18 -26,-18 -26,-2 C-26,12 -10,14 0,8 C10,14 26,12 26,-2 C26,-18 4,-18 0,-6 Z" fill="url(#${id}-face)"/>
        <circle cx="-12" cy="-3" r="9.5" fill="#fff" stroke="#3A230F" stroke-width="1.2"/>
        <circle cx="12" cy="-3" r="9.5" fill="#fff" stroke="#3A230F" stroke-width="1.2"/>
        <circle cx="-12" cy="-3" r="7" fill="url(#${id}-iris)"/>
        <circle cx="12" cy="-3" r="7" fill="url(#${id}-iris)"/>
        <g class="blink"><circle cx="-12" cy="-3" r="3.6" fill="#0A0D18"/><circle cx="12" cy="-3" r="3.6" fill="#0A0D18"/></g>
        <circle cx="-14" cy="-5.5" r="1.8" fill="#fff"/><circle cx="10" cy="-5.5" r="1.8" fill="#fff"/>
        <path d="M-4,6 L4,6 L0,14 Z" fill="#F29A2E" stroke="#8A4D10" stroke-width="1"/>
        <path d="M-14,-20 C-8,-23 0,-23 6,-22" fill="none" stroke="#F3D3A6" stroke-width="2" stroke-linecap="round" opacity=".8"/>`, `url(#${id}-bg)`)
    },

    kaloz: {
      name: 'Kalózkapitányok',
      anim: 'drop',
      defs: (id, p) =>
        rad(id + '-bg', [[0, '#3C8FC0'], [1, '#0B2B48']], 0.5, 0.3, 0.8) +
        rad(id + '-skin', [[0, '#FFD9B5'], [1, '#D9946A']], 0.45, 0.4, 0.6) +
        lin(id + '-hat', [[0, '#3A3550'], [1, '#14121F']]) +
        lin(id + '-band', [[0, p.l], [0.5, p.c], [1, p.d]], 0, 0, 1, 1),
      draw: (id, p) => frame(id, p, `
        <path d="M-40,26 C-28,20 -18,30 -6,24 C6,18 16,30 28,24 C34,21 38,22 40,23 L40,40 L-40,40 Z" fill="#0E4C7A" opacity=".8"/>
        <path d="M-40,32 C-28,26 -18,36 -6,30 C6,24 16,36 28,30 C34,27 38,28 40,29" fill="none" stroke="#9FD8FF" stroke-width="1.5" opacity=".6"/>
        <ellipse cx="0" cy="6" rx="21" ry="23" fill="url(#${id}-skin)" stroke="#6B3E22" stroke-width="1.8"/>
        <path d="M-18,14 C-14,30 14,30 18,14 C14,20 8,22 0,22 C-8,22 -14,20 -18,14 Z" fill="#5A3218"/>
        <path d="M-10,16 C-6,13 -2,15 0,17 C2,15 6,13 10,16 C6,18 2,18 0,17 C-2,18 -6,18 -10,16 Z" fill="#3A1E0C"/>
        <circle cx="8" cy="2" r="3.4" fill="#fff"/><circle cx="8.5" cy="2.4" r="2" fill="#1A1208" class="blink"/>
        <path d="M-15,-3 L-1,-3 L-3,7 C-7,9 -13,8 -15,-3 Z" fill="#111"/>
        <path d="M-21,-6 L22,4" stroke="#111" stroke-width="2"/>
        <path d="M-1,8 C1,10 3,10 4,8" fill="none" stroke="#8A4D2A" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M-24,-10 C-20,-4 20,-4 24,-10 L22,-14 L-22,-14 Z" fill="url(#${id}-band)" stroke="${p.d}" stroke-width="1"/>
        <path d="M-32,-12 C-24,-36 24,-36 32,-12 C20,-18 -20,-18 -32,-12 Z" fill="url(#${id}-hat)" stroke="#0A0910" stroke-width="1.6"/>
        <path d="M-30,-13 C-18,-19 18,-19 30,-13" fill="none" stroke="${p.c}" stroke-width="2.4"/>
        <circle cx="0" cy="-23" r="4.2" fill="#F4F0E6"/><rect x="-2.6" y="-20.5" width="5.2" height="2.8" rx="1" fill="#F4F0E6"/>
        <circle cx="-1.5" cy="-23.5" r="1" fill="#14121F"/><circle cx="1.5" cy="-23.5" r="1" fill="#14121F"/>
        <path d="M-20,-24 C-14,-28 -6,-30 2,-30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>`, `url(#${id}-bg)`)
    }
  };

  // ======================================================================
  //  ORSZÁGOK — egyszerűsített nemzeti zászlók
  // ======================================================================
  const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  function bands(cols, weights, vertical) {
    weights = weights || cols.map(() => 1);
    const tot = weights.reduce((a, b) => a + b, 0);
    let pos = -40, out = '';
    cols.forEach((c, i) => {
      const size = (80 * weights[i]) / tot;
      out += vertical ? rect(pos, -40, size + 0.3, 80, c) : rect(-40, pos, 80, size + 0.3, c);
      pos += size;
    });
    return out;
  }
  const H = (c, w) => bands(c, w, false);
  const V = (c, w) => bands(c, w, true);
  const nordic = (bg, cross, inner) =>
    rect(-40, -40, 80, 80, bg) + rect(-19, -40, 14, 80, cross) + rect(-40, -7, 80, 14, cross) +
    (inner ? rect(-15.5, -40, 7, 80, inner) + rect(-40, -3.5, 80, 7, inner) : '');
  const star5 = (cx, cy, r, c) => {
    let pts = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      pts += `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)} `;
    }
    return `<polygon points="${pts}" fill="${c}"/>`;
  };

  const FLAGS = {
    hu: ['Magyarország', () => H(['#CE2939', '#FFFFFF', '#477050'])],
    de: ['Németország', () => H(['#111111', '#DD0000', '#FFCE00'])],
    fr: ['Franciaország', () => V(['#0055A4', '#FFFFFF', '#EF4135'])],
    it: ['Olaszország', () => V(['#009246', '#FFFFFF', '#CE2B37'])],
    es: ['Spanyolország', () => H(['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1])],
    pt: ['Portugália', () => rect(-40, -40, 32, 80, '#006600') + rect(-8, -40, 48, 80, '#FF0000') +
      `<circle cx="-8" cy="0" r="12" fill="none" stroke="#FFE900" stroke-width="3.5"/>` + rect(-13, -7, 10, 13, '#FFFFFF') +
      `<rect x="-13" y="-7" width="10" height="13" fill="none" stroke="#FF0000" stroke-width="2"/>` + rect(-10, -3, 4, 5, '#003399')],
    nl: ['Hollandia', () => H(['#AE1C28', '#FFFFFF', '#21468B'])],
    be: ['Belgium', () => V(['#111111', '#FDDA24', '#EF3340'])],
    at: ['Ausztria', () => H(['#C8102E', '#FFFFFF', '#C8102E'])],
    ch: ['Svájc', () => rect(-40, -40, 80, 80, '#DA291C') + rect(-6, -22, 12, 44, '#FFFFFF') + rect(-22, -6, 44, 12, '#FFFFFF')],
    pl: ['Lengyelország', () => H(['#FFFFFF', '#DC143C'])],
    ua: ['Ukrajna', () => H(['#0057B7', '#FFD700'])],
    hr: ['Horvátország', (id) => H(['#FF0000', '#FFFFFF', '#171796']) +
      `<path d="M-11,-13 H11 V8 C11,16 4,19 0,21 C-4,19 -11,16 -11,8 Z" fill="url(#${id}-chk)" stroke="#171796" stroke-width="1.5"/>`,
      (id) => `<pattern id="${id}-chk" width="10" height="10" x="-10" y="-12" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#FFFFFF"/><rect width="5" height="5" fill="#FF0000"/><rect x="5" y="5" width="5" height="5" fill="#FF0000"/></pattern>`],
    gr: ['Görögország', () => {
      let o = '';
      for (let i = 0; i < 9; i++) o += rect(-40, -40 + (i * 80) / 9, 80, 80 / 9 + 0.3, i % 2 ? '#FFFFFF' : '#0D5EAF');
      return o + rect(-40, -40, 44.4, 44.4, '#0D5EAF') + rect(-22.7, -40, 8.9, 44.4, '#FFFFFF') + rect(-40, -22.2, 44.4, 8.9, '#FFFFFF');
    }],
    tr: ['Törökország', () => rect(-40, -40, 80, 80, '#E30A17') + `<circle cx="-6" cy="0" r="15" fill="#FFFFFF"/><circle cx="-2" cy="0" r="12" fill="#E30A17"/>` + star5(12, 0, 7, '#FFFFFF')],
    se: ['Svédország', () => nordic('#006AA7', '#FECC00')],
    no: ['Norvégia', () => nordic('#BA0C2F', '#FFFFFF', '#00205B')],
    fi: ['Finnország', () => nordic('#FFFFFF', '#002F6C')],
    dk: ['Dánia', () => nordic('#C8102E', '#FFFFFF')],
    ie: ['Írország', () => V(['#169B62', '#FFFFFF', '#FF883E'])],
    gb: ['Egyesült Királyság', () => rect(-40, -40, 80, 80, '#012169') +
      `<path d="M-40,-40 L40,40 M40,-40 L-40,40" stroke="#FFFFFF" stroke-width="14"/><path d="M-40,-40 L40,40 M40,-40 L-40,40" stroke="#C8102E" stroke-width="5"/>` +
      rect(-9, -40, 18, 80, '#FFFFFF') + rect(-40, -9, 80, 18, '#FFFFFF') + rect(-5.5, -40, 11, 80, '#C8102E') + rect(-40, -5.5, 80, 11, '#C8102E')],
    us: ['Egyesült Államok', () => {
      let o = '';
      for (let i = 0; i < 13; i++) o += rect(-40, -40 + (i * 80) / 13, 80, 80 / 13 + 0.3, i % 2 ? '#FFFFFF' : '#B22234');
      o += rect(-40, -40, 40, (80 * 7) / 13, '#3C3B6E');
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) o += `<circle cx="${-36 + c * 6.4 + (r % 2) * 3.2}" cy="${-36 + r * 8}" r="1.4" fill="#FFFFFF"/>`;
      return o;
    }],
    ca: ['Kanada', () => V(['#D80621', '#FFFFFF', '#D80621'], [1, 2, 1]) +
      `<path d="M0,-17 L3,-10 L7,-12 L5,-2 L11,-7 L12,-3 L17,-4 L14,3 L17,5 L6,13 L7,17 L1,16 L1,24 L-1,24 L-1,16 L-7,17 L-6,13 L-17,5 L-14,3 L-17,-4 L-12,-3 L-11,-7 L-5,-2 L-7,-12 L-3,-10 Z" fill="#D80621"/>`],
    br: ['Brazília', () => rect(-40, -40, 80, 80, '#009C3B') + `<polygon points="0,-29 36,0 0,29 -36,0" fill="#FFDF00"/><circle r="14.5" fill="#002776"/>` +
      `<path d="M-14.5,-1 C-6,-7 6,-6 14,2" fill="none" stroke="#FFFFFF" stroke-width="3"/>` +
      `<g fill="#FFFFFF"><circle cx="-5" cy="5" r="1.1"/><circle cx="3" cy="8" r="1.1"/><circle cx="7" cy="3" r="1"/><circle cx="-2" cy="10" r="1"/></g>`],
    ar: ['Argentína', () => H(['#74ACDF', '#FFFFFF', '#74ACDF']) +
      `<circle r="9" fill="none" stroke="#F6B40E" stroke-width="4" stroke-dasharray="2.2 1.6"/><circle r="5.6" fill="#F6B40E" stroke="#85340A" stroke-width=".8"/>`],
    jp: ['Japán', () => rect(-40, -40, 80, 80, '#FFFFFF') + `<circle r="17" fill="#BC002D"/>`]
  };

  for (const code of Object.keys(FLAGS)) {
    const [name, art, extra] = FLAGS[code];
    SKINS['f-' + code] = {
      name, cat: 'orszagok', anim: 'flip',
      defs: (id) => lin(id + '-fab', [[0, '#fff', 0.35], [0.45, '#fff', 0], [0.55, '#000', 0], [1, '#000', 0.35]], 0, 0, 1, 1) + (extra ? extra(id) : ''),
      draw: (id, p) => frame(id, p, `${art(id)}
        <path d="M-40,-8 C-20,-16 0,0 20,-8 S40,-12 40,-12 L40,40 L-40,40 Z" fill="#000" opacity=".08"/>
        <rect x="-40" y="-40" width="80" height="80" fill="url(#${id}-fab)"/>`, '#ccc')
    };
  }

  // ======================================================================
  //  ÁLLATOK — kerek, rajzfilmszerű állatfejek
  // ======================================================================
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1A1410"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.4}" fill="#fff"/>`;
  const eyes = (dx, y, r) => `<g class="blink">${eye(-dx, y, r)}${eye(dx, y, r)}</g>`;
  const cheeks = (dx, y) => `<ellipse cx="${-dx}" cy="${y}" rx="5" ry="3" fill="#FF7F9F" opacity=".45"/><ellipse cx="${dx}" cy="${y}" rx="5" ry="3" fill="#FF7F9F" opacity=".45"/>`;
  const smile = (y, w, c) => `<path d="M0,${y} C-1,${y + 3} ${-w * 0.6},${y + 4} ${-w},${y + 2} M0,${y} C1,${y + 3} ${w * 0.6},${y + 4} ${w},${y + 2}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`;
  const mirror = (d) => `<path d="${d}"/><path d="${d}" transform="scale(-1,1)"/>`;

  const ANIMALS = {
    cica: ['Cicák', ['#C9E8FF', '#5C8FD1'], ['#FFC37A', '#E8892E'], (id) => `
      <g fill="url(#${id}-head)" stroke="#8A4A12" stroke-width="2">${mirror('M-28,-4 L-24,-34 L-6,-20 Z')}</g>
      <g fill="#FFA6BC">${mirror('M-24,-10 L-22,-27 L-12,-19 Z')}</g>
      <ellipse cx="0" cy="5" rx="28" ry="24" fill="url(#${id}-head)" stroke="#8A4A12" stroke-width="2"/>
      <g stroke="#B5591A" stroke-width="2.8" stroke-linecap="round"><path d="M-6,-18 L-4,-11"/><path d="M0,-19 L0,-11"/><path d="M6,-18 L4,-11"/><path d="M-27,2 L-20,3"/><path d="M27,2 L20,3"/></g>
      <ellipse cx="-6" cy="14" rx="8" ry="6" fill="#FFF6EC"/><ellipse cx="6" cy="14" rx="8" ry="6" fill="#FFF6EC"/>
      <g class="blink"><ellipse cx="-11" cy="1" rx="5" ry="6" fill="#86CF4F"/><ellipse cx="11" cy="1" rx="5" ry="6" fill="#86CF4F"/>
      <ellipse cx="-11" cy="1" rx="1.8" ry="4.6" fill="#111"/><ellipse cx="11" cy="1" rx="1.8" ry="4.6" fill="#111"/>
      <circle cx="-12.6" cy="-1.5" r="1.4" fill="#fff"/><circle cx="9.4" cy="-1.5" r="1.4" fill="#fff"/></g>
      <path d="M-3.5,9 L3.5,9 L0,12.5 Z" fill="#FF7A9A"/>${smile(12.5, 6, '#5A2E10')}
      <g stroke="#fff" stroke-width="1" opacity=".85">${mirror('M10,13 L30,10 M10,15 L30,17')}</g>`],
    kutya: ['Kutyusok', ['#FFF0BF', '#E8A33D'], ['#EDB777', '#B97839'], (id) => `
      <g fill="#7E4F24" stroke="#4A2C10" stroke-width="1.6">${mirror('M-20,-18 C-36,-16 -38,8 -31,22 C-25,27 -20,15 -17,0 Z')}</g>
      <ellipse cx="0" cy="3" rx="22" ry="25" fill="url(#${id}-head)" stroke="#6B4215" stroke-width="2"/>
      <path d="M-4,-25 C-6,-10 -13,3 -13,14 C-13,27 13,27 13,14 C13,3 6,-10 4,-25 Z" fill="#FFF6E8"/>
      <g fill="#8A5A2B" opacity=".8"><ellipse cx="-10" cy="-9" rx="4" ry="2"/><ellipse cx="10" cy="-9" rx="4" ry="2"/></g>
      ${eyes(10, -2, 4)}
      <ellipse cx="0" cy="12" rx="6.5" ry="4.8" fill="#2B1B12"/><ellipse cx="-2" cy="10.5" rx="2" ry="1.2" fill="#fff" opacity=".6"/>
      <path d="M-3,19 C-3,27 3,27 3,19 Z" fill="#FF6F91" stroke="#C2405F" stroke-width="1"/>
      <path d="M0,16.5 L0,19 M0,19 C-3,22 -6,21 -7,19 M0,19 C3,22 6,21 7,19" fill="none" stroke="#2B1B12" stroke-width="1.8" stroke-linecap="round"/>`],
    roka: ['Rókák', ['#DDF4CC', '#5E9E4A'], ['#FFA24A', '#D9621B'], (id) => `
      <g fill="url(#${id}-head)" stroke="#7A320A" stroke-width="2">${mirror('M-28,-2 L-23,-36 L-5,-18 Z')}</g>
      <g fill="#2A1A12">${mirror('M-23,-36 L-25,-25 L-17,-27 Z')}</g>
      <g fill="#FFE3C7">${mirror('M-22,-8 L-20,-26 L-11,-17 Z')}</g>
      <path d="M0,31 C-8,31 -31,11 -31,-3 C-31,-18 -16,-24 0,-24 C16,-24 31,-18 31,-3 C31,11 8,31 0,31 Z" fill="url(#${id}-head)" stroke="#7A320A" stroke-width="2"/>
      <path d="M0,31 C-6,31 -24,15 -29,3 C-18,9 -8,9 0,15 C8,9 18,9 29,3 C24,15 6,31 0,31 Z" fill="#FFF4E6"/>
      ${eyes(11, -3, 3.8)}
      <ellipse cx="0" cy="25" rx="4.5" ry="3.2" fill="#1A110C"/>`],
    panda: ['Pandák', ['#DDF8C8', '#5FA449'], ['#FFFFFF', '#D5DAE1'], (id) => `
      <circle cx="-21" cy="-20" r="10" fill="#1E1E24"/><circle cx="21" cy="-20" r="10" fill="#1E1E24"/>
      <ellipse cx="0" cy="4" rx="28" ry="25" fill="url(#${id}-head)" stroke="#2A2A30" stroke-width="2"/>
      <ellipse cx="-11" cy="0" rx="7" ry="9.5" fill="#1E1E24" transform="rotate(28 -11 0)"/>
      <ellipse cx="11" cy="0" rx="7" ry="9.5" fill="#1E1E24" transform="rotate(-28 11 0)"/>
      <g class="blink"><circle cx="-10" cy="-1" r="3" fill="#fff"/><circle cx="10" cy="-1" r="3" fill="#fff"/><circle cx="-9.6" cy="-0.6" r="1.8" fill="#111"/><circle cx="10.4" cy="-0.6" r="1.8" fill="#111"/></g>
      <path d="M-5,10 C-5,7 5,7 5,10 C5,13 0,15 0,15 C0,15 -5,13 -5,10 Z" fill="#1E1E24"/>${smile(15, 7, '#1E1E24')}${cheeks(17, 12)}`],
    oroszlan: ['Oroszlánok', ['#FFEBA8', '#E39A2E'], ['#FFD47A', '#E9A84A'], (id) => {
      let mane = '<circle r="31" fill="#B5521B"/>';
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        mane += `<circle cx="${(Math.cos(a) * 27).toFixed(1)}" cy="${(Math.sin(a) * 27 + 2).toFixed(1)}" r="10" fill="${i % 2 ? '#C8641F' : '#9E4217'}"/>`;
      }
      return mane + `
      <circle cx="-17" cy="-16" r="7" fill="#E9A84A"/><circle cx="17" cy="-16" r="7" fill="#E9A84A"/>
      <circle cx="-17" cy="-16" r="4" fill="#C27A30"/><circle cx="17" cy="-16" r="4" fill="#C27A30"/>
      <ellipse cx="0" cy="4" rx="21" ry="21" fill="url(#${id}-head)" stroke="#8A4A12" stroke-width="1.6"/>
      <ellipse cx="0" cy="13" rx="11" ry="8" fill="#FFF1D0"/>
      ${eyes(8, -1, 3.6)}
      <path d="M-5,7 L5,7 L0,12 Z" fill="#6B3A1E"/>${smile(12, 6, '#6B3A1E')}`;
    }],
    beka: ['Békák', ['#C8EEFF', '#3D8FC2'], ['#9BE35F', '#3F9B2E'], (id) => `
      <circle cx="-14" cy="-16" r="10.5" fill="url(#${id}-head)" stroke="#2B6B20" stroke-width="2"/>
      <circle cx="14" cy="-16" r="10.5" fill="url(#${id}-head)" stroke="#2B6B20" stroke-width="2"/>
      <ellipse cx="0" cy="7" rx="31" ry="21" fill="url(#${id}-head)" stroke="#2B6B20" stroke-width="2"/>
      <circle cx="-14" cy="-16" r="7" fill="#fff"/><circle cx="14" cy="-16" r="7" fill="#fff"/>
      <g class="blink"><ellipse cx="-13" cy="-15" rx="4.4" ry="3.2" fill="#111"/><ellipse cx="13" cy="-15" rx="4.4" ry="3.2" fill="#111"/></g>
      <circle cx="-15.5" cy="-18" r="1.6" fill="#fff"/><circle cx="11.5" cy="-18" r="1.6" fill="#fff"/>
      <circle cx="-4" cy="1" r="1.3" fill="#1F4F17"/><circle cx="4" cy="1" r="1.3" fill="#1F4F17"/>
      <path d="M-18,9 C-9,21 9,21 18,9 C9,14 -9,14 -18,9 Z" fill="#E8576B" stroke="#1F4F17" stroke-width="2" stroke-linejoin="round"/>
      ${cheeks(22, 8)}`],
    malac: ['Malacok', ['#FFEAF1', '#F28DB2'], ['#FFCCDA', '#F49AB4'], (id) => `
      <g fill="#F4A0B8" stroke="#B85676" stroke-width="1.6">${mirror('M-24,-8 L-27,-31 L-8,-21 Z')}</g>
      <g fill="#E07A98">${mirror('M-27,-31 L-17,-21 L-22,-19 Z')}</g>
      <ellipse cx="0" cy="3" rx="27" ry="24" fill="url(#${id}-head)" stroke="#B85676" stroke-width="2"/>
      ${eyes(10, -5, 3.3)}
      <ellipse cx="0" cy="10" rx="11.5" ry="8" fill="#FF9FBB" stroke="#B85676" stroke-width="1.6"/>
      <ellipse cx="-4" cy="10" rx="2" ry="3" fill="#9C3E5E"/><ellipse cx="4" cy="10" rx="2" ry="3" fill="#9C3E5E"/>
      ${smile(19, 6, '#9C3E5E')}${cheeks(18, 6)}`],
    pingvin: ['Pingvinek', ['#EEF9FF', '#7FB8E6'], ['#3A4456', '#11151E'], (id) => `
      <g fill="#fff" opacity=".8"><circle cx="-28" cy="-22" r="1.5"/><circle cx="26" cy="-26" r="1.2"/><circle cx="30" cy="12" r="1.4"/><circle cx="-30" cy="16" r="1.1"/></g>
      <ellipse cx="0" cy="4" rx="28" ry="28" fill="url(#${id}-head)" stroke="#0A0D14" stroke-width="2"/>
      <path d="M0,-6 C-6,-20 -24,-16 -22,0 C-20,16 -8,27 0,27 C8,27 20,16 22,0 C24,-16 6,-20 0,-6 Z" fill="#FFFFFF"/>
      ${eyes(9, -1, 3.4)}
      <path d="M-7,8 L7,8 L0,16 Z" fill="#FFA726" stroke="#C46A00" stroke-width="1.4" stroke-linejoin="round"/>${cheeks(15, 10)}`],
    medve: ['Mackók', ['#DFF2C8', '#6FA35A'], ['#B07B45', '#7A4E26'], (id) => `
      <circle cx="-20" cy="-20" r="9" fill="#8A5A33" stroke="#4A2C10" stroke-width="1.6"/><circle cx="20" cy="-20" r="9" fill="#8A5A33" stroke="#4A2C10" stroke-width="1.6"/>
      <circle cx="-20" cy="-20" r="5" fill="#D9A574"/><circle cx="20" cy="-20" r="5" fill="#D9A574"/>
      <ellipse cx="0" cy="4" rx="26" ry="24" fill="url(#${id}-head)" stroke="#4A2C10" stroke-width="2"/>
      <ellipse cx="0" cy="12" rx="11" ry="8.5" fill="#E7C092"/>
      ${eyes(10, -4, 3.4)}
      <ellipse cx="0" cy="8" rx="5" ry="3.6" fill="#2A1A10"/>${smile(11.5, 5, '#2A1A10')}${cheeks(17, 7)}`],
    tigris: ['Tigrisek', ['#E8F8BD', '#7BAA3A'], ['#FFAC45', '#E0701A'], (id) => `
      <g fill="url(#${id}-head)" stroke="#6B3008" stroke-width="2">${mirror('M-27,-6 C-31,-25 -20,-32 -9,-22 Z')}</g>
      <g fill="#FFF4E0">${mirror('M-24,-10 C-26,-21 -20,-25 -14,-20 Z')}</g>
      <ellipse cx="0" cy="4" rx="28" ry="24" fill="url(#${id}-head)" stroke="#6B3008" stroke-width="2"/>
      <g fill="none" stroke="#1A0E06" stroke-width="2.8" stroke-linecap="round">
        <path d="M-6,-19 L0,-13 L6,-19"/><path d="M-10,-14 L-6,-9"/><path d="M10,-14 L6,-9"/>
        ${mirror('M-28,-1 L-19,1 M-28,7 L-18,7 M-26,14 L-18,12')}
      </g>
      <ellipse cx="-7" cy="13" rx="9" ry="7" fill="#FFF8EE"/><ellipse cx="7" cy="13" rx="9" ry="7" fill="#FFF8EE"/>
      <g class="blink"><circle cx="-10" cy="-2" r="4.2" fill="#D4E84C"/><circle cx="10" cy="-2" r="4.2" fill="#D4E84C"/>
      <ellipse cx="-10" cy="-2" rx="1.6" ry="3.4" fill="#111"/><ellipse cx="10" cy="-2" rx="1.6" ry="3.4" fill="#111"/></g>
      <path d="M-4,8 L4,8 L0,12 Z" fill="#D9677B"/>${smile(12, 6, '#3A1A08')}`],
    nyuszi: ['Nyuszik', ['#FFF4C8', '#F2B84B'], ['#FFFFFF', '#D8D8E2'], (id) => `
      <ellipse cx="-9" cy="-24" rx="6.5" ry="16" fill="url(#${id}-head)" stroke="#9A9AAA" stroke-width="1.6" transform="rotate(-12 -9 -24)"/>
      <ellipse cx="9" cy="-24" rx="6.5" ry="16" fill="url(#${id}-head)" stroke="#9A9AAA" stroke-width="1.6" transform="rotate(12 9 -24)"/>
      <ellipse cx="-9" cy="-24" rx="3.2" ry="11" fill="#FFB3C6" transform="rotate(-12 -9 -24)"/>
      <ellipse cx="9" cy="-24" rx="3.2" ry="11" fill="#FFB3C6" transform="rotate(12 9 -24)"/>
      <ellipse cx="0" cy="9" rx="25" ry="21" fill="url(#${id}-head)" stroke="#9A9AAA" stroke-width="2"/>
      ${eyes(9, 4, 3.6)}
      <path d="M-2.6,12 L2.6,12 L0,14.6 Z" fill="#FF7A9A"/>${smile(14.6, 5, '#7A6A7A')}
      <rect x="-3" y="17" width="6" height="5" rx="1" fill="#fff" stroke="#9A9AAA" stroke-width="1"/><line x1="0" y1="17" x2="0" y2="22" stroke="#9A9AAA" stroke-width=".8"/>
      ${cheeks(16, 13)}`],
    koala: ['Koalák', ['#E1F6D4', '#7DB66A'], ['#C3C9D2', '#8A919C'], (id) => `
      <circle cx="-23" cy="-11" r="12.5" fill="url(#${id}-head)" stroke="#5C626C" stroke-width="1.6"/><circle cx="23" cy="-11" r="12.5" fill="url(#${id}-head)" stroke="#5C626C" stroke-width="1.6"/>
      <circle cx="-23" cy="-11" r="7.5" fill="#F4EAF0"/><circle cx="23" cy="-11" r="7.5" fill="#F4EAF0"/>
      <ellipse cx="0" cy="5" rx="23" ry="23" fill="url(#${id}-head)" stroke="#5C626C" stroke-width="2"/>
      ${eyes(10, -3, 3)}
      <ellipse cx="0" cy="8" rx="6.5" ry="9" fill="#2C2F36"/><ellipse cx="-2" cy="4" rx="2" ry="3" fill="#fff" opacity=".35"/>
      ${smile(18, 5, '#2C2F36')}${cheeks(15, 12)}`],
    majom: ['Majmocskák', ['#FFF3BF', '#E8B83A'], ['#A46C38', '#6E4420'], (id) => `
      <circle cx="-26" cy="2" r="8" fill="#8B5A2B" stroke="#4A2C10" stroke-width="1.6"/><circle cx="26" cy="2" r="8" fill="#8B5A2B" stroke="#4A2C10" stroke-width="1.6"/>
      <circle cx="-26" cy="2" r="4.6" fill="#F2D2A8"/><circle cx="26" cy="2" r="4.6" fill="#F2D2A8"/>
      <circle cx="0" cy="3" r="25" fill="url(#${id}-head)" stroke="#4A2C10" stroke-width="2"/>
      <path d="M0,-8 C-6,-17 -20,-15 -20,-3 C-20,3 -16,7 -14,10 C-14,23 14,23 14,10 C16,7 20,3 20,-3 C20,-15 6,-17 0,-8 Z" fill="#F2D2A8"/>
      ${eyes(8, -3, 3.3)}
      <circle cx="-2.4" cy="8" r="1.3" fill="#4A2C10"/><circle cx="2.4" cy="8" r="1.3" fill="#4A2C10"/>
      <path d="M-8,13 C-4,18 4,18 8,13" fill="none" stroke="#4A2C10" stroke-width="2" stroke-linecap="round"/>`]
  };

  for (const key of Object.keys(ANIMALS)) {
    const [name, bg, head, art] = ANIMALS[key];
    SKINS['a-' + key] = {
      name, cat: 'allatok', anim: 'hop',
      defs: (id) => rad(id + '-bg', [[0, bg[0]], [1, bg[1]]], 0.5, 0.35, 0.75) + rad(id + '-head', [[0, head[0]], [1, head[1]]], 0.4, 0.3, 0.75),
      draw: (id, p) => frame(id, p, art(id), `url(#${id}-bg)`)
    };
  }

  // ======================================================================
  //  FOCI — saját tervezésű mezek klasszikus színkombinációkkal
  // ======================================================================
  const SHIRT = 'M-12,-26 L-26,-20 L-37,-4 L-27,3 L-22,-3 L-22,29 L22,29 L22,-3 L27,3 L37,-4 L26,-20 L12,-26 C8,-19 -8,-19 -12,-26 Z';
  function shirtPattern(kind, c1, c2) {
    switch (kind) {
      case 'stripes': { let o = rect(-40, -40, 80, 80, c1); for (let x = -19; x < 40; x += 13) o += rect(x, -40, 6.5, 80, c2); return o; }
      case 'hoops': { let o = rect(-40, -40, 80, 80, c1); for (let y = -22; y < 40; y += 12) o += rect(-40, y, 80, 6, c2); return o; }
      case 'halves': return rect(-40, -40, 40, 80, c1) + rect(0, -40, 40, 80, c2);
      case 'sash': return rect(-40, -40, 80, 80, c1) + `<polygon points="-24,-26 -12,-26 26,29 14,29" fill="${c2}"/>`;
      case 'pin': { let o = rect(-40, -40, 80, 80, c1); for (let x = -21; x < 40; x += 6) o += rect(x, -40, 1.4, 80, c2); return o; }
      case 'center': return rect(-40, -40, 80, 80, c1) + rect(-8, -40, 16, 80, '#FFFFFF') + rect(-5, -40, 10, 80, c2);
      case 'sleeves': return rect(-40, -40, 80, 80, c1) + `<path d="M-26,-20 L-37,-4 L-27,3 L-22,-3 L-20,-18 Z M26,-20 L37,-4 L27,3 L22,-3 L20,-18 Z" fill="${c2}"/>`;
      default: return rect(-40, -40, 80, 80, c1);
    }
  }
  // Licenc nélkül a valódi klubnevek és címerek nem használhatók (védjegyek),
  // ezért — ahogy a nagy focis játékok is teszik — a nevek csak a várost és a színeket írják le.
  const JERSEYS = {
    feher: ['Madridi Fehérek', 'Madrid Whites', 'plain', '#FFFFFF', '#FFFFFF', '#C9A227', '#C9A227'],
    kekgranat: ['Katalán Kék-gránátok', 'Catalan Blue & Garnets', 'stripes', '#0A4DA0', '#A50044', '#F2C200', '#F2C200'],
    pirosfeher: ['Madridi Piros-fehérek', 'Madrid Red & Whites', 'stripes', '#D7182A', '#FFFFFF', '#1B2A5C', '#1B2A5C'],
    egkek: ['Manchesteri Égkékek', 'Manchester Sky Blues', 'plain', '#6CABDD', '#6CABDD', '#FFFFFF', '#1C2C5B'],
    vorosok: ['Liverpooli Vörösök', 'Liverpool Reds', 'plain', '#C8102E', '#C8102E', '#FFFFFF', '#FFFFFF'],
    agyusok: ['Londoni Ágyúsok', 'London Gunners', 'sleeves', '#EF0107', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    bajorok: ['Müncheni Bajorok', 'Munich Bavarians', 'plain', '#DC052D', '#DC052D', '#FFFFFF', '#FFFFFF'],
    sargafekete: ['Dortmundi Sárga-feketék', 'Dortmund Yellow & Blacks', 'sleeves', '#FDE100', '#111111', '#111111', '#111111'],
    feketefeher: ['Torinói Zebrák', 'Turin Zebras', 'stripes', '#FFFFFF', '#121212', '#C9A227', '#121212'],
    pirosfekete: ['Milánói Piros-feketék', 'Milan Red & Blacks', 'stripes', '#111111', '#C8102E', '#FFFFFF', '#FFFFFF'],
    tengeresz: ['Milánói Kék-feketék', 'Milan Blue & Blacks', 'stripes', '#111111', '#0068A8', '#C9A227', '#C9A227'],
    parizsiak: ['Párizsi Kékek', 'Paris Blues', 'center', '#004170', '#DA291C', '#FFFFFF', '#FFFFFF'],
    lila: ['Firenzei Lilák', 'Florence Violets', 'plain', '#5B2C82', '#5B2C82', '#FFFFFF', '#FFFFFF'],
    narancs: ['Holland Narancsok', 'Dutch Oranges', 'plain', '#FF7F00', '#FF7F00', '#111111', '#111111'],
    zoldfeher: ['Glasgow-i Zöld-fehérek', 'Glasgow Green & Whites', 'hoops', '#00843D', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    atlos: ['Buenos Aires-i Szalagosok', 'Buenos Aires Sashes', 'sash', '#FFFFFF', '#D52B1E', '#111111', '#D52B1E'],
    fradi: ['Budapesti Zöld-fehérek', 'Budapest Green & Whites', 'stripes', '#007A33', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    ujpest: ['Újpesti Lila-fehérek', 'Újpest Violet & Whites', 'stripes', '#FFFFFF', '#5B2C82', '#5B2C82', '#5B2C82']
  };
  for (const key of Object.keys(JERSEYS)) {
    const [name, nameEn, kind, c1, c2, num, collar] = JERSEYS[key];
    SKINS['m-' + key] = {
      name, nameEn, cat: 'foci', anim: 'drop',
      defs: (id) => rad(id + '-bg', [[0, '#6BD46E'], [1, '#1C6E2A']], 0.5, 0.3, 0.8) +
        lin(id + '-shade', [[0, '#fff', 0.3], [0.5, '#fff', 0], [1, '#000', 0.3]], 0, 0, 1, 1) +
        `<clipPath id="${id}-shirt"><path d="${SHIRT}"/></clipPath>`,
      draw: (id, p) => frame(id, p, `
        <g opacity=".12" fill="#fff">${rect(-40, -40, 13, 80, '#fff')}${rect(-14, -40, 13, 80, '#fff')}${rect(12, -40, 13, 80, '#fff')}</g>
        <path d="M-40,32 L40,32" stroke="#fff" stroke-width="2" opacity=".5"/>
        <path d="${SHIRT}" fill="#000" opacity=".25" transform="translate(2,3)"/>
        <g clip-path="url(#${id}-shirt)">${shirtPattern(kind, c1, c2)}<rect x="-40" y="-40" width="80" height="80" fill="url(#${id}-shade)"/></g>
        <path d="${SHIRT}" fill="none" stroke="#0B1022" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M-12,-26 C-8,-19 8,-19 12,-26 L9,-27.5 C6,-22.5 -6,-22.5 -9,-27.5 Z" fill="${collar}" stroke="#0B1022" stroke-width="1"/>
        <text x="0" y="14" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="21" fill="${num}" stroke="#0B1022" stroke-width="1.6" paint-order="stroke">10</text>
        <path d="M10,-13 l3,-3 l3,3 l-3,4 Z" fill="#C9A227" stroke="#0B1022" stroke-width=".6"/>`, `url(#${id}-bg)`)
    };
  }
  SKINS['m-labda'] = {
    name: 'Focilabda', cat: 'foci', anim: 'hop',
    defs: (id) => rad(id + '-bg', [[0, '#6BD46E'], [1, '#1C6E2A']], 0.5, 0.3, 0.8) + rad(id + '-ball', [[0, '#FFFFFF'], [0.7, '#E9ECF1'], [1, '#AEB6C2']], 0.35, 0.3, 0.75) + `<clipPath id="${id}-bc"><circle r="28"/></clipPath>`,
    draw: (id, p) => {
      const pent = (cx, cy, r, rot) => {
        let pts = '';
        for (let i = 0; i < 5; i++) { const a = rot + (i * 2 * Math.PI) / 5; pts += `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)} `; }
        return `<polygon points="${pts}" fill="#16181D"/>`;
      };
      let outer = '';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        outer += pent(Math.cos(a) * 24, Math.sin(a) * 24, 8, a + Math.PI) +
          `<line x1="${(Math.cos(a) * 8.5).toFixed(1)}" y1="${(Math.sin(a) * 8.5).toFixed(1)}" x2="${(Math.cos(a) * 17).toFixed(1)}" y2="${(Math.sin(a) * 17).toFixed(1)}" stroke="#16181D" stroke-width="1.6"/>`;
      }
      return frame(id, p, `
        <ellipse cx="3" cy="31" rx="22" ry="5" fill="#000" opacity=".25"/>
        <circle r="28" fill="url(#${id}-ball)" stroke="#16181D" stroke-width="1.8"/>
        <g clip-path="url(#${id}-bc)">${pent(0, 0, 9, -Math.PI / 2)}${outer}</g>
        <path d="M-18,-14 C-12,-22 -2,-25 6,-24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`, `url(#${id}-bg)`);
    }
  };

  const EN = {
    klasszikus: 'Onyx Coin', lovag: 'Iron Knights', robot: 'Cyber Robots', kristaly: 'Crystal Cave', urhajo: 'Space Rockets',
    sarkany: 'Fire Dragons', bagoly: 'Moon Owls', kaloz: 'Pirate Captains',
    'f-hu': 'Hungary', 'f-de': 'Germany', 'f-fr': 'France', 'f-it': 'Italy', 'f-es': 'Spain', 'f-pt': 'Portugal', 'f-nl': 'Netherlands',
    'f-be': 'Belgium', 'f-at': 'Austria', 'f-ch': 'Switzerland', 'f-pl': 'Poland', 'f-ua': 'Ukraine', 'f-hr': 'Croatia', 'f-gr': 'Greece',
    'f-tr': 'Turkey', 'f-se': 'Sweden', 'f-no': 'Norway', 'f-fi': 'Finland', 'f-dk': 'Denmark', 'f-ie': 'Ireland', 'f-gb': 'United Kingdom',
    'f-us': 'United States', 'f-ca': 'Canada', 'f-br': 'Brazil', 'f-ar': 'Argentina', 'f-jp': 'Japan',
    'a-cica': 'Kittens', 'a-kutya': 'Puppies', 'a-roka': 'Foxes', 'a-panda': 'Pandas', 'a-oroszlan': 'Lions', 'a-beka': 'Frogs',
    'a-malac': 'Piglets', 'a-pingvin': 'Penguins', 'a-medve': 'Teddy Bears', 'a-tigris': 'Tigers', 'a-nyuszi': 'Bunnies',
    'a-koala': 'Koalas', 'a-majom': 'Monkeys', 'm-labda': 'Football'
  };
  for (const k in EN) if (SKINS[k]) SKINS[k].nameEn = EN[k];

  // a fantázia-szettek kategóriája
  for (const k of ['klasszikus', 'lovag', 'robot', 'kristaly', 'urhajo', 'sarkany', 'bagoly', 'kaloz']) SKINS[k].cat = 'fantazia';

  const CATEGORIES = [
    { id: 'fantazia', name: 'Fantázia', nameEn: 'Fantasy' },
    { id: 'allatok', name: 'Állatok', nameEn: 'Animals' },
    { id: 'orszagok', name: 'Országok', nameEn: 'Countries' },
    { id: 'foci', name: 'Foci', nameEn: 'Football' }
  ];

  const ORDER = Object.keys(SKINS);

  // A gradienseket egyszer, egy rejtett SVG-be tesszük ki; minden tábla és ikon ezekre hivatkozik.
  function installDefs() {
    if (document.getElementById('malom-skin-defs')) return;
    let defs = '';
    for (const key of ORDER) {
      for (const pl of [0, 1]) {
        const id = `sk-${key}-${pl}`;
        defs += commonDefs(id, PALETTES[pl]) + SKINS[key].defs(id, PALETTES[pl]);
      }
    }
    const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    holder.setAttribute('id', 'malom-skin-defs');
    holder.setAttribute('width', '0');
    holder.setAttribute('height', '0');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.position = 'absolute';
    holder.innerHTML = `<defs>${defs}</defs>`;
    document.body.prepend(holder);
  }

  function markup(skin, player) {
    const key = SKINS[skin] ? skin : 'klasszikus';
    return SKINS[key].draw(`sk-${key}-${player}`, PALETTES[player]);
  }

  function nameOf(key, lang) {
    const sk = SKINS[key] || SKINS.klasszikus;
    return lang === 'en' ? (sk.nameEn || sk.name) : sk.name;
  }

  function svg(skin, player, size) {
    return `<svg viewBox="-52 -52 104 104" width="${size}" height="${size}" aria-hidden="true"><g>${markup(skin, player)}</g></svg>`;
  }

  // a választott keret már az első rajzolás előtt érvényes legyen
  function readFrame() {
    try { const v = JSON.parse(localStorage.getItem('malom-frame')); if (FRAMES.some((f) => f.id === v)) return v; } catch (e) { /* nincs tárhely */ }
    return DEFAULT_FRAME;
  }
  let currentFrame = readFrame();
  document.documentElement.dataset.frame = currentFrame;

  function setFrame(id) {
    if (!FRAMES.some((f) => f.id === id)) return;
    currentFrame = id;
    document.documentElement.dataset.frame = id;
    try { localStorage.setItem('malom-frame', JSON.stringify(id)); } catch (e) { /* nincs tárhely */ }
  }

  if (document.body) installDefs();
  else document.addEventListener('DOMContentLoaded', installDefs);

  window.MalomSkins = { SKINS, ORDER, CATEGORIES, PALETTES, FRAMES, svg, markup, installDefs, nameOf, setFrame, get frame() { return currentFrame; } };
})();
