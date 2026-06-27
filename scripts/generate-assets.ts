import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const OUT_DIR = path.join(process.cwd(), 'generated-assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

type AssetDef = { key: string; prompt: string; width: number; height: number; type: 'bg' | 'char' | 'ui' };

const BG_COLOR_MAP: Record<string, string> = {
  village: '#2d4a1e',
  forest: '#1a3a1a',
  sky_city: '#1a2a5e',
  underground: '#3a1a1a',
  spirit_realm: '#2a1a4a',
  void_citadel: '#0d0618',
  combat_bg: '#1a0a0a',
  ending: '#1a1a3a',
  celestial: '#1a1a4a',
  sacrifice: '#2a0a0a',
  battle: '#2a0a1a',
  city: '#1a2a3a',
};

function getBgColor(key: string): string {
  for (const [k, v] of Object.entries(BG_COLOR_MAP)) {
    if (key.includes(k)) return v;
  }
  return '#1a1a2e';
}

const CHAR_COLORS: Record<string, { primary: string; secondary: string; skin: string }> = {
  kai: { primary: '#4169e1', secondary: '#7b2d8b', skin: '#e8c9a0' },
  luna: { primary: '#7b2d8b', secondary: '#c084fc', skin: '#f0d0b0' },
  ryu: { primary: '#cc3300', secondary: '#ff6633', skin: '#d4a870' },
  suki: { primary: '#00a36c', secondary: '#34d399', skin: '#f0d0a0' },
  malachar: { primary: '#0d0618', secondary: '#4a1060', skin: '#8a6060' },
  vex: { primary: '#cc0000', secondary: '#ff4444', skin: '#c09090' },
};

function generateBgSvg(key: string, width: number, height: number): string {
  const bgColor = getBgColor(key);
  const isVoid = key.includes('void');
  const isSpirit = key.includes('spirit');
  const isForest = key.includes('forest');
  const isSky = key.includes('sky');
  const isUnderground = key.includes('underground');
  const isEnding = key.includes('ending') || key.includes('celestial') || key.includes('sacrifice') || key.includes('battle');

  let decorations = '';

  if (isVoid || key.includes('combat_bg')) {
    // Dark void with particles
    decorations = `
      <circle cx="${width * 0.2}" cy="${height * 0.3}" r="2" fill="#7b2d8b" opacity="0.6"/>
      <circle cx="${width * 0.7}" cy="${height * 0.4}" r="3" fill="#4169e1" opacity="0.5"/>
      <circle cx="${width * 0.5}" cy="${height * 0.6}" r="1.5" fill="#ffd700" opacity="0.4"/>
      <circle cx="${width * 0.85}" cy="${height * 0.2}" r="2.5" fill="#7b2d8b" opacity="0.5"/>
      <rect x="${width * 0.1}" y="${height * 0.7}" width="${width * 0.8}" height="2" fill="#4169e1" opacity="0.2"/>
      <rect x="${width * 0.3}" y="${height * 0.9}" width="${width * 0.4}" height="2" fill="#7b2d8b" opacity="0.15"/>
    `;
  } else if (isForest) {
    const treeW = width / 6;
    decorations = [0, 1, 2, 3, 4, 5].map((i) => `
      <polygon points="${treeW * i + treeW / 2},${height * 0.2} ${treeW * i},${height * 0.7} ${treeW * (i + 1)},${height * 0.7}"
        fill="#1e3a12" opacity="0.8"/>
      <polygon points="${treeW * i + treeW / 2},${height * 0.1} ${treeW * i + treeW * 0.2},${height * 0.5} ${treeW * (i + 1) - treeW * 0.2},${height * 0.5}"
        fill="#2a5a1a" opacity="0.7"/>
    `).join('');
    decorations += `<ellipse cx="${width * 0.5}" cy="${height * 0.15}" rx="${width * 0.15}" ry="${height * 0.08}" fill="#ffdb70" opacity="0.6"/>`;
  } else if (isSky) {
    decorations = `
      <ellipse cx="${width * 0.5}" cy="${height * 0.2}" rx="${width * 0.3}" ry="${height * 0.1}" fill="#e8d4a0" opacity="0.5"/>
      <rect x="${width * 0.1}" y="${height * 0.5}" width="${width * 0.2}" height="${height * 0.35}" rx="4" fill="#c0a860" opacity="0.6"/>
      <rect x="${width * 0.4}" y="${height * 0.4}" width="${width * 0.25}" height="${height * 0.45}" rx="4" fill="#c0a860" opacity="0.5"/>
      <rect x="${width * 0.72}" y="${height * 0.55}" width="${width * 0.18}" height="${height * 0.3}" rx="3" fill="#c0a860" opacity="0.55"/>
    `;
  } else if (isUnderground) {
    decorations = `
      <rect x="0" y="${height * 0.6}" width="${width}" height="${height * 0.4}" fill="#1a0a0a" opacity="0.5"/>
      <polygon points="0,${height * 0.6} ${width * 0.15},${height * 0.35} ${width * 0.3},${height * 0.6}" fill="#2a1515" opacity="0.8"/>
      <polygon points="${width * 0.5},${height * 0.6} ${width * 0.65},${height * 0.3} ${width * 0.8},${height * 0.6}" fill="#2a1515" opacity="0.8"/>
      <circle cx="${width * 0.5}" cy="${height * 0.5}" r="${width * 0.15}" fill="#8b0000" opacity="0.2"/>
    `;
  } else if (isSpirit) {
    decorations = `
      <circle cx="${width * 0.5}" cy="${height * 0.4}" r="${width * 0.2}" fill="#7b2d8b" opacity="0.15"/>
      <circle cx="${width * 0.5}" cy="${height * 0.4}" r="${width * 0.1}" fill="#c084fc" opacity="0.25"/>
      <circle cx="${width * 0.2}" cy="${height * 0.3}" r="${width * 0.05}" fill="#ffd700" opacity="0.4"/>
      <circle cx="${width * 0.8}" cy="${height * 0.6}" r="${width * 0.04}" fill="#ffd700" opacity="0.35"/>
      <circle cx="${width * 0.6}" cy="${height * 0.2}" r="${width * 0.03}" fill="#c084fc" opacity="0.5"/>
    `;
  } else if (isEnding) {
    decorations = `
      <circle cx="${width * 0.5}" cy="${height * 0.3}" r="${width * 0.18}" fill="#ffd700" opacity="0.2"/>
      <circle cx="${width * 0.5}" cy="${height * 0.3}" r="${width * 0.08}" fill="#ffd700" opacity="0.4"/>
      <line x1="${width * 0.5}" y1="0" x2="${width * 0.5}" y2="${height}" stroke="#ffd700" stroke-width="1" opacity="0.1"/>
      <line x1="0" y1="${height * 0.3}" x2="${width}" y2="${height * 0.3}" stroke="#ffd700" stroke-width="1" opacity="0.1"/>
    `;
  }

  const gradient = isVoid || key.includes('combat_bg')
    ? `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgColor}"/>
        <stop offset="60%" stop-color="#0d0618"/>
        <stop offset="100%" stop-color="#030208"/>
      </linearGradient>`
    : `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgColor}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#0d0618"/>
      </linearGradient>`;

  const label = key.replace(/_/g, ' ').toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${gradient}</defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  ${decorations}
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="serif" font-size="${Math.round(width / 30)}" fill="#ffd700" opacity="0.3">${label}</text>
</svg>`;
}

function generateCharSvg(key: string, width: number, height: number): string {
  const charName = key.split('_')[0] ?? 'kai';
  const expression = key.split('_').slice(1).join('_');
  const colors = CHAR_COLORS[charName] ?? CHAR_COLORS['kai']!;

  const mouthMap: Record<string, string> = {
    happy: 'M -12 5 Q 0 15 12 5',
    sad: 'M -12 10 Q 0 0 12 10',
    surprised: 'M 0 5 m -6 0 a 6 4 0 1 0 12 0',
    angry: 'M -10 5 Q 0 10 10 5',
    battle_stance: 'M -8 5 Q 0 12 8 5',
    determined: 'M -10 5 L 10 5',
    victory: 'M -12 5 Q 0 18 12 5',
    neutral: 'M -8 5 L 8 5',
  };
  const mouth = mouthMap[expression] ?? mouthMap['neutral']!;

  const eyeMap: Record<string, string> = {
    angry: `<line x1="-15" y1="-18" x2="-5" y2="-14" stroke="${colors.primary}" stroke-width="2"/><line x1="5" y1="-14" x2="15" y2="-18" stroke="${colors.primary}" stroke-width="2"/>`,
    surprised: `<circle cx="-10" cy="-15" r="5" fill="${colors.primary}" opacity="0.9"/><circle cx="10" cy="-15" r="5" fill="${colors.primary}" opacity="0.9"/>`,
    default: `<ellipse cx="-10" cy="-15" rx="5" ry="4" fill="${colors.primary}" opacity="0.9"/><ellipse cx="10" cy="-15" rx="5" ry="4" fill="${colors.primary}" opacity="0.9"/>`,
  };
  const eyes = eyeMap[expression] ?? eyeMap['default']!;

  const cx = width / 2;
  const bodyY = height * 0.5;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%">
      <stop offset="0%" stop-color="${colors.secondary}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <ellipse cx="${cx}" cy="${height * 0.4}" rx="${width * 0.35}" ry="${height * 0.45}" fill="url(#glow)"/>

  <!-- body -->
  <ellipse cx="${cx}" cy="${bodyY + 60}" rx="${width * 0.2}" ry="${height * 0.15}" fill="${colors.primary}" opacity="0.85"/>

  <!-- neck -->
  <rect x="${cx - 12}" y="${bodyY - 30}" width="24" height="30" rx="4" fill="${colors.skin}"/>

  <!-- head -->
  <ellipse cx="${cx}" cy="${bodyY - 60}" rx="40" ry="45" fill="${colors.skin}"/>

  <!-- hair -->
  <ellipse cx="${cx}" cy="${bodyY - 90}" rx="42" ry="22" fill="${colors.primary}"/>
  <ellipse cx="${cx - 35}" cy="${bodyY - 65}" rx="14" ry="30" fill="${colors.primary}"/>
  <ellipse cx="${cx + 35}" cy="${bodyY - 65}" rx="14" ry="30" fill="${colors.primary}"/>

  <!-- eyes -->
  <g transform="translate(${cx}, ${bodyY - 55})">${eyes}</g>

  <!-- mouth -->
  <path d="M ${cx} ${bodyY - 30} ${mouth}" fill="none" stroke="#8b4040" stroke-width="2" transform="translate(${cx}, ${bodyY - 30}) translate(-${cx}, -${bodyY - 30})"/>

  <!-- outfit details -->
  <path d="M ${cx - 30} ${bodyY + 20} L ${cx} ${bodyY} L ${cx + 30} ${bodyY + 20}" fill="${colors.secondary}" opacity="0.8"/>

  <text x="${cx}" y="${height - 10}" text-anchor="middle" font-family="serif" font-size="11" fill="${colors.primary}" opacity="0.5">${key}</text>
</svg>`;
}

function generateUiSvg(key: string, width: number, height: number): string {
  if (key === 'logo') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0d0618"/>
  <text x="${width / 2}" y="${height * 0.45}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(width / 8)}"
    fill="#ffd700" font-weight="bold">⚔</text>
  <text x="${width / 2}" y="${height * 0.75}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(width / 20)}"
    fill="#4169e1">Chronicles</text>
</svg>`;
  }
  if (key === 'loading_art') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0d0618"/>
  <circle cx="${width / 2}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.3}" fill="none" stroke="#4169e1" stroke-width="3" opacity="0.5"/>
  <circle cx="${width / 2}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.18}" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.6"/>
  <text x="${width / 2}" y="${height * 0.45}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="${Math.round(Math.min(width, height) * 0.15)}" fill="#ffd700">⚔</text>
  <text x="${width / 2}" y="${height * 0.8}" text-anchor="middle" font-family="Georgia, serif"
    font-size="${Math.round(width / 22)}" fill="#7b2d8b">Chronicles of the Celestial Blade</text>
</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#1a0a2e"/>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="serif" font-size="14" fill="#ffd700">${key}</text>
</svg>`;
}

type AssetConfig = {
  key: string;
  type: 'bg' | 'char' | 'ui';
  width: number;
  height: number;
};

const ASSETS: AssetConfig[] = [
  // Backgrounds (1920x1080)
  ...([
    'village_dawn', 'village_evening', 'village_morning',
    'mystical_forest', 'mystical_forest_night', 'mystical_forest_afternoon',
    'sky_city_overview', 'sky_city_overview_night', 'sky_city_overview_dusk',
    'underground_arena', 'underground_arena_night', 'underground_arena_dusk',
    'spirit_realm', 'spirit_realm_night', 'spirit_realm_dusk',
    'void_citadel_exterior', 'void_citadel_interior',
    'celestial_ending', 'battle_ending', 'sacrifice_ending',
    'city_library', 'city_ruins', 'forest_clearing',
    'combat_bg_forest', 'combat_bg_citadel',
  ] as const).map((key) => ({ key, type: 'bg' as const, width: 1920, height: 1080 })),
  // Characters (3 variants per char per expression)
  ...(['kai', 'luna', 'ryu', 'suki', 'malachar', 'vex'] as const).flatMap((char) =>
    (['neutral', 'happy', 'sad', 'surprised', 'determined', 'battle_stance'] as const).map(
      (expr) => ({ key: `${char}_${expr}`, type: 'char' as const, width: 512, height: 800 })
    )
  ),
  // UI
  { key: 'logo', type: 'ui' as const, width: 256, height: 256 },
  { key: 'loading_art', type: 'ui' as const, width: 800, height: 600 },
];

const urlMap: Record<string, string> = {};

for (const asset of ASSETS) {
  let svg: string;
  if (asset.type === 'bg') {
    svg = generateBgSvg(asset.key, asset.width, asset.height);
  } else if (asset.type === 'char') {
    svg = generateCharSvg(asset.key, asset.width, asset.height);
  } else {
    svg = generateUiSvg(asset.key, asset.width, asset.height);
  }

  const filename = `${asset.key}.svg`;
  fs.writeFileSync(path.join(OUT_DIR, filename), svg, 'utf8');
  // Use data URL for now; will be replaced with GitHub Release URLs after upload
  urlMap[asset.key] = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Write imageUrls.ts
const urlFileContent = `// Generated by scripts/generate-assets.ts — do not edit manually
export const IMAGE_URLS: Record<string, string> = ${JSON.stringify(urlMap, null, 2)};
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'imageUrls.ts'), urlFileContent, 'utf8');
console.log(`Generated ${ASSETS.length} assets → generated-assets/ and src/data/imageUrls.ts`);
