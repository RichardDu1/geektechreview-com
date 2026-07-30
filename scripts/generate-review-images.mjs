/**
 * Generate branded SVG product images for GeekTechReview reviews.
 * Each image uses the brand color + product name + category icon.
 * Usage: node scripts/generate-review-images.mjs
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const REVIEWS_DIR = 'src/content/reviews';
const OUT_DIR = 'public/images/reviews';

// Brand color mapping
const BRAND_COLORS = {
  Apple: '#a3a3a3',
  Alienware: '#3b82f6',
  Amazon: '#f59e0b',
  Anker: '#22c55e',
  Aqara: '#3b82f6',
  Bose: '#8b5cf6',
  CalDigit: '#ef4444',
  DJI: '#1a1a1a',
  Eve: '#22c55e',
  Google: '#4285f4',
  Keychron: '#3b82f6',
  LG: '#ef4444',
  Logitech: '#00b8fc',
  Meta: '#1b74e4',
  Minisforum: '#f59e0b',
  Netgear: '#22c55e',
  NVIDIA: '#76b900',
  NuPhy: '#8b5cf6',
  'Orange Pi': '#f97316',
  'Peak Design': '#1a1a1a',
  Razer: '#00ff00',
  Ring: '#3b82f6',
  Roborock: '#1a1a1a',
  Samsung: '#1428a0',
  Satechi: '#3b82f6',
  Secretlab: '#1a1a1a',
  Shure: '#1a1a1a',
  Sonos: '#1a1a1a',
  Sony: '#0033cc',
  Wacom: '#1a1a1a',
  XGIMI: '#3b82f6',
  'Raspberry Pi': '#c51a4a',
};

// Category icons (SVG path data)
const CATEGORY_ICONS = {
  laptops: 'M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z',
  phones: 'M12 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z',
  audio: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3',
  gaming: 'M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z',
  'pc-components': 'M12 20v2M12 2v2M17 20v2M17 2v2M7 20v2M7 2v2M2 12h2M20 12h2M2 17h2M20 17h2M2 7h2M20 7h2M4 4h16v16H4zM8 8h8v8H8z',
  'smart-home': 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'ai-devices': 'M12 8V4H8M4 4h16v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 14h2M20 14h2M15 13v2M9 13v2',
  'creator-gear': 'M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

function escapeXml(s) {
  return s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
}

function generateSVG(title, brand, category) {
  const color = BRAND_COLORS[brand] || '#3b82f6';
  const iconPath = CATEGORY_ICONS[category] || CATEGORY_ICONS['pc-components'];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0b"/>
      <stop offset="100%" stop-color="#141416"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="750" fill="url(#bg)"/>
  <rect width="1200" height="750" fill="url(#accent)"/>

  <!-- Decorative grid lines -->
  <g opacity="0.03" stroke="${color}" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="200" x2="1200" y2="200"/>
    <line x1="0" y1="300" x2="1200" y2="300"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="500" x2="1200" y2="500"/>
    <line x1="0" y1="600" x2="1200" y2="600"/>
    <line x1="200" y1="0" x2="200" y2="750"/>
    <line x1="400" y1="0" x2="400" y2="750"/>
    <line x1="600" y1="0" x2="600" y2="750"/>
    <line x1="800" y1="0" x2="800" y2="750"/>
    <line x1="1000" y1="0" x2="1000" y2="750"/>
  </g>

  <!-- Brand color glow circle -->
  <circle cx="600" cy="280" r="140" fill="${color}" opacity="0.08" filter="url(#glow)"/>

  <!-- Category icon -->
  <g transform="translate(540, 180) scale(5)">
    <path d="${iconPath}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  </g>

  <!-- Brand name -->
  <text x="600" y="450" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="600" fill="${color}" opacity="0.7" letter-spacing="3">
    ${escapeXml(brand.toUpperCase())}
  </text>

  <!-- Product title -->
  <text x="600" y="500" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="42" font-weight="700" fill="#e8e8ed">
    ${escapeXml(title)}
  </text>

  <!-- Category badge -->
  <g transform="translate(600, 560)">
    <rect x="-80" y="-18" width="160" height="36" rx="18" fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-opacity="0.3" stroke-width="1"/>
    <text x="0" y="5" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="${color}">
      ${escapeXml(category.replace('-', ' ').toUpperCase())}
    </text>
  </g>

  <!-- GeekTechReview logo text -->
  <text x="600" y="680" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="16" font-weight="500" fill="#8b8b94" letter-spacing="2">
    GEEKTECHREVIEW
  </text>

  <!-- Accent bar at bottom -->
  <rect x="500" y="700" width="200" height="3" rx="1.5" fill="${color}" opacity="0.5"/>
</svg>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await readdir(REVIEWS_DIR);
  let count = 0;

  for (const file of files) {
    if (!file.match(/\.(md|mdx)$/)) continue;

    const content = await readFile(join(REVIEWS_DIR, file), 'utf-8');

    // Parse frontmatter (handle both \n and \r\n)
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];

    const title = (fm.match(/title:\s*"([^"]*)"/) || [])[1] || file;
    const brand = (fm.match(/brand:\s*"([^"]*)"/) || [])[1] || 'GeekTechReview';
    const category = (fm.match(/category:\s*"([^"]*)"/) || [])[1] || 'pc-components';
    const slug = file.replace(/\.(md|mdx)$/, '');

    const svg = generateSVG(title, brand, category);
    const outPath = join(OUT_DIR, `${slug}.svg`);
    await writeFile(outPath, svg, 'utf-8');
    console.log(`OK ${slug}.svg (${brand}, ${category})`);
    count++;
  }

  console.log(`\nGenerated ${count} SVG images`);
}

main().catch(console.error);
