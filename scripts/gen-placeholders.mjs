// Generate mock UI-screenshot placeholders for project galleries.
// Run with: node scripts/gen-placeholders.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const W = 1200;
const H = 750;

/**
 * Build a synthetic dashboard-style SVG mockup, parameterised by accent + label.
 * Each scene gets a different layout so the carousel feels like distinct screens.
 */
function buildSVG({ label, accent = '#64ffda', sceneType = 'dashboard' }) {
  const fg = '#e9f1ff';
  const fgMuted = '#8a98b6';
  const bg = '#0a1628';
  const bg2 = '#060f1f';
  const card = '#0e1a30';

  const header = `
    <rect width="${W}" height="56" fill="${bg2}"/>
    <circle cx="24" cy="28" r="5" fill="#ff5f57"/>
    <circle cx="44" cy="28" r="5" fill="#febc2e"/>
    <circle cx="64" cy="28" r="5" fill="#28c840"/>
    <rect x="100" y="20" width="240" height="16" fill="${card}" rx="3"/>
    <rect x="${W - 110}" y="20" width="80" height="16" fill="${card}" rx="3"/>
  `;

  const sidebar = `
    <rect x="0" y="56" width="220" height="${H - 56}" fill="${bg2}"/>
    <rect x="20" y="86" width="160" height="14" fill="${accent}" opacity="0.85" rx="3"/>
    <rect x="20" y="120" width="120" height="10" fill="${fgMuted}" opacity="0.4" rx="2"/>
    <rect x="20" y="146" width="140" height="10" fill="${fgMuted}" opacity="0.4" rx="2"/>
    <rect x="20" y="172" width="100" height="10" fill="${fgMuted}" opacity="0.4" rx="2"/>
    <rect x="20" y="198" width="130" height="10" fill="${fgMuted}" opacity="0.4" rx="2"/>
    <rect x="20" y="240" width="80" height="10" fill="${fgMuted}" opacity="0.25" rx="2"/>
    <rect x="20" y="270" width="160" height="10" fill="${fgMuted}" opacity="0.25" rx="2"/>
    <rect x="20" y="300" width="110" height="10" fill="${fgMuted}" opacity="0.25" rx="2"/>
  `;

  let main;
  if (sceneType === 'dashboard') {
    main = `
      <rect x="252" y="86" width="${W - 282}" height="32" fill="${card}" rx="6"/>
      <rect x="252" y="148" width="280" height="160" fill="${card}" rx="10"/>
      <rect x="552" y="148" width="280" height="160" fill="${card}" rx="10"/>
      <rect x="852" y="148" width="${W - 882}" height="160" fill="${card}" rx="10"/>
      <rect x="252" y="332" width="${W - 282}" height="240" fill="${card}" rx="10"/>

      <!-- chart bars -->
      <g transform="translate(282 380)">
        ${[0,1,2,3,4,5,6,7,8].map((i) => {
          const h = 30 + ((i * 17) % 110);
          const x = i * 95;
          return `<rect x="${x}" y="${180 - h}" width="56" height="${h}" fill="${accent}" opacity="${0.3 + (i % 3) * 0.18}" rx="3"/>`;
        }).join('')}
      </g>

      <rect x="252" y="596" width="180" height="14" fill="${fgMuted}" opacity="0.35" rx="2"/>
    `;
  } else if (sceneType === 'builder') {
    main = `
      <rect x="252" y="86" width="${W - 282}" height="32" fill="${card}" rx="6"/>
      <rect x="252" y="148" width="${(W - 282) * 0.62}" height="${H - 200}" fill="${card}" rx="10"/>
      <rect x="${252 + (W - 282) * 0.64}" y="148" width="${(W - 282) * 0.36}" height="${H - 200}" fill="${bg2}" rx="10" stroke="${card}" stroke-width="2"/>

      <!-- form fields preview -->
      <g transform="translate(290 188)">
        <rect width="380" height="44" fill="${bg2}" rx="6"/>
        <rect width="380" height="44" y="64" fill="${bg2}" rx="6"/>
        <rect width="380" height="120" y="128" fill="${bg2}" rx="6"/>
        <rect width="180" height="44" y="272" fill="${accent}" rx="6"/>
      </g>

      <!-- right panel (block library) -->
      <g transform="translate(${252 + (W - 282) * 0.64 + 24} 180)">
        <rect width="160" height="56" fill="${card}" rx="6"/>
        <rect width="160" height="56" y="72" fill="${card}" rx="6"/>
        <rect width="160" height="56" y="144" fill="${card}" rx="6"/>
        <rect width="160" height="56" y="216" fill="${card}" rx="6"/>
        <rect width="160" height="56" y="288" fill="${card}" rx="6"/>
      </g>
    `;
  } else if (sceneType === 'pos') {
    // POS-style — checkout layout
    main = `
      <rect x="252" y="86" width="${W - 282}" height="${H - 142}" fill="${bg2}" rx="10"/>

      <!-- product grid -->
      <g transform="translate(280 116)">
        ${Array.from({ length: 12 }, (_, i) => {
          const r = Math.floor(i / 4);
          const c = i % 4;
          return `<rect x="${c * 165}" y="${r * 145}" width="150" height="130" fill="${card}" rx="8"/>
                  <rect x="${c * 165 + 12}" y="${r * 145 + 100}" width="80" height="10" fill="${fgMuted}" opacity="0.4" rx="2"/>
                  <rect x="${c * 165 + 12}" y="${r * 145 + 116}" width="40" height="8" fill="${accent}" opacity="0.7" rx="2"/>`;
        }).join('')}
      </g>

      <!-- right panel — receipt / cart -->
      <rect x="${W - 320}" y="86" width="280" height="${H - 142}" fill="${card}" rx="10"/>
      <rect x="${W - 296}" y="116" width="220" height="14" fill="${accent}" rx="2"/>
      <rect x="${W - 296}" y="146" width="220" height="1" fill="${fgMuted}" opacity="0.3"/>
      ${Array.from({ length: 4 }, (_, i) => `
        <rect x="${W - 296}" y="${166 + i * 38}" width="160" height="10" fill="${fgMuted}" opacity="0.5" rx="2"/>
        <rect x="${W - 116}" y="${166 + i * 38}" width="40" height="10" fill="${fg}" opacity="0.7" rx="2"/>
      `).join('')}
      <rect x="${W - 296}" y="${H - 152}" width="220" height="44" fill="${accent}" rx="6"/>
    `;
  } else {
    // generic
    main = `
      <rect x="252" y="86" width="${W - 282}" height="${H - 142}" fill="${card}" rx="10"/>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="${bg}"/>
      ${header}
      ${sidebar}
      ${main}
      <text x="${W - 32}" y="${H - 24}" fill="${accent}" font-family="ui-monospace, monospace"
            font-size="13" text-anchor="end" opacity="0.85">${label}</text>
    </svg>`;
}

const targets = [
  // ProAxis — the showcase project
  { project: 'proaxis',  file: 'dashboard.png', scene: 'dashboard', accent: '#64ffda', label: 'PROAXIS · DASHBOARD' },
  { project: 'proaxis',  file: 'builder.png',   scene: 'builder',   accent: '#64ffda', label: 'PROAXIS · FORM BUILDER' },
  { project: 'proaxis',  file: 'commissions.png', scene: 'dashboard', accent: '#7afcc8', label: 'PROAXIS · COMMISSIONS' },
  { project: 'proaxis',  file: 'tenants.png',   scene: 'pos',       accent: '#64ffda', label: 'PROAXIS · TENANTS' },

  // Spa POS — different palette to feel like a different product
  { project: 'spa-pos',  file: 'checkout.png',  scene: 'pos',       accent: '#7ad8ff', label: 'SPA POS · CHECKOUT' },
  { project: 'spa-pos',  file: 'inventory.png', scene: 'dashboard', accent: '#7ad8ff', label: 'SPA POS · INVENTORY' },
  { project: 'spa-pos',  file: 'reports.png',   scene: 'dashboard', accent: '#a3e1ff', label: 'SPA POS · REPORTS' },
];

await Promise.all(
  targets.map(async (t) => {
    const out = resolve(root, 'src/assets/projects', t.project, t.file);
    await mkdir(dirname(out), { recursive: true });
    const svg = buildSVG({ label: t.label, accent: t.accent, sceneType: t.scene });
    await sharp(Buffer.from(svg)).png({ quality: 92 }).toFile(out);
    console.log('wrote', out);
  })
);
