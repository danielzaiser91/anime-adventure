/**
 * Asset generation script — uses Replicate FLUX.1-dev to generate all game images.
 * Run:  npx ts-node --project tsconfig.scripts.json scripts/generate-assets.ts [--dry-run]
 *
 * Requires: REPLICATE_API_TOKEN env var
 * Skips files that already exist on disk (idempotent).
 * After generation, run: npx ts-node --project tsconfig.scripts.json scripts/upload-assets.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const REPLICATE_TOKEN = process.env['REPLICATE_API_TOKEN'];
const OUT_DIR = path.join(process.cwd(), 'generated-assets');
const DRY_RUN = process.argv.includes('--dry-run');
const CDN_BASE = 'https://github.com/danielzaiser91/anime-adventure/releases/download/game-assets-v2';

if (!REPLICATE_TOKEN && !DRY_RUN) {
  console.error('Error: REPLICATE_API_TOKEN not set. Run with --dry-run to preview without generating.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Prompts ─────────────────────────────────────────────────────────────────

const CHAR_BASE: Record<string, string> = {
  kai: 'masterpiece, best quality, anime cel-shaded style, vibrant colors, clean detailed linework, studio anime quality, young male 17 years old, spiky black hair with bright blue streak on left side, amber golden eyes, white haori coat with black flame patterns along hem, dark navy hakama pants, worn brown leather satchel, katana at hip',
  luna: 'masterpiece, best quality, anime cel-shaded style, vibrant colors, clean detailed linework, studio anime quality, young female 18 years old, long silver hair to waist, violet purple eyes, midnight blue robes with silver star constellation embroidery, pale skin, delicate features, small silver crescent moon hair clip',
  ryu: 'masterpiece, best quality, anime cel-shaded style, vibrant colors, clean detailed linework, studio anime quality, young male 20 years old, short spiky red hair, warm brown eyes, heavily scarred face with warm smile, worn bronze battle armor with black cloak, large two-handed sword on back, stocky muscular build',
  suki: 'masterpiece, best quality, anime cel-shaded style, vibrant colors, clean detailed linework, studio anime quality, young female 16 years old, sandy brown hair in twin braids with leaf charms, emerald green eyes, freckles on nose, green and gold healer robes with leaf and vine motifs, crystal flower staff',
  malachar: 'masterpiece, best quality, anime cel-shaded style, dark atmospheric colors, clean detailed linework, studio anime quality, tall imposing villain, hollow empty white eyes, tattered black void robes dissolving into shadow at edges, white hair floating unnaturally, dark void energy tendrils swirling from hands, gaunt elegant face with tragic bearing',
  vex: 'masterpiece, best quality, anime cel-shaded style, dark colors, clean detailed linework, studio anime quality, masked military commander, full-face black iron mask with single red eye lens, black and dark crimson void-officer armor with sharp angular pauldrons, tall lean build, crimson tattered cape, gloved hands resting on dual short swords at hips, precise cold bearing',
};

const EXPRESSIONS: Record<string, string> = {
  neutral: 'standing, calm neutral expression, hands at sides, plain white background, no shadow, character portrait',
  happy: 'smiling warmly, eyes bright, slight forward lean, plain white background, character portrait',
  sad: 'downcast eyes, slight frown, shoulders dropped, plain white background, character portrait',
  surprised: 'wide eyes, mouth slightly open, eyebrows raised, plain white background, character portrait',
  determined: 'focused narrow eyes, confident stance, hand on weapon, plain white background, character portrait',
  battle_stance: 'dynamic combat ready pose, weapon drawn, weight forward, plain white background, character portrait',
};

const BG_PROMPTS: Record<string, string> = {
  village_dawn: 'anime style, small mountain village with cherry blossom trees, wooden buildings, dawn light, warm sunrise glow, mist in valleys, peaceful atmosphere, studio anime quality',
  village_evening: 'anime style, small mountain village with cherry blossom trees, wooden buildings, golden evening sunset light, warm amber sky, peaceful atmosphere',
  village_morning: 'anime style, small mountain village with cherry blossom trees, wooden buildings, crisp morning light, blue sky, peaceful atmosphere',
  mystical_forest: 'anime style, dense magical forest, enormous ancient trees, glowing spirit wisps floating, moonlight filtering through canopy, ethereal atmosphere, studio quality',
  mystical_forest_night: 'anime style, magical forest at night, glowing spirit wisps, moonlight through trees, deep shadows, ethereal blue-green lighting',
  mystical_forest_afternoon: 'anime style, magical forest in afternoon light, golden rays through trees, spirit wisps visible, warm atmosphere',
  sky_city_overview: 'anime style, breathtaking floating city of gold and white architecture on cloud platforms, daytime, blue sky, majestic, studio quality',
  sky_city_overview_night: 'anime style, floating sky city at night, glowing lights, stars, magical lanterns, dramatic and beautiful',
  sky_city_overview_dusk: 'anime style, floating sky city at dusk, orange and purple sky, silhouetted architecture, magical atmosphere',
  underground_arena: 'anime style, stone fighting pit underground, torchlight, crowd silhouettes in gallery above, dramatic lighting, combat arena atmosphere',
  underground_arena_night: 'anime style, underground arena with torches, dark and atmospheric, crowd shadows, intense atmosphere',
  underground_arena_dusk: 'anime style, underground arena lit by orange torches, warm dramatic lighting, ancient stone walls',
  spirit_realm: 'anime style, ethereal dreamlike landscape, impossible floating geometry, soft prismatic colors, memory fragments visible as glowing images, surreal beauty',
  spirit_realm_night: 'anime style, spirit realm at night, deep purples and blues, glowing spirit energy, dreamlike floating islands',
  spirit_realm_dusk: 'anime style, spirit realm at dusk, soft golden and pink light, floating crystal formations, ethereal mist',
  void_citadel_exterior: 'anime style, dark imposing fortress of black crystal floating in void, crackling dark energy, ominous and massive, dramatic sky',
  void_citadel_interior: 'anime style, vast dark throne chamber, void energy pillars, shattered crystal floor, dramatic dark lighting, oppressive atmosphere',
  celestial_ending: 'anime style, bright harmonious sky with celestial light beams, healed landscape, golden light, hope and peace, beautiful ending scene',
  battle_ending: 'anime style, dramatic victorious battlefield, dawn light breaking, figures silhouetted, bittersweet triumph, epic atmosphere',
  sacrifice_ending: 'anime style, single figure silhouette against full moon rising, bittersweet quiet night, beautiful and sorrowful, emotional',
  city_library: 'anime style, ancient magical library, floating books, glowing scroll cases, warm amber light, mystical and cozy',
  city_ruins: 'anime style, ruined city buildings, overgrown with vegetation, dramatic lighting, post-battle atmosphere, moody',
  forest_clearing: 'anime style, open clearing in forest, moonlight, grass, stones, dramatic atmosphere, peaceful yet tense',
  combat_bg_forest: 'anime style, forest edge battle arena, dramatic lighting, centered composition, combat ready atmosphere, trees framing scene',
  combat_bg_citadel: 'anime style, void citadel throne chamber combat arena, dark energy, dramatic lighting, centered for combat, oppressive atmosphere',
  village_destroyed: 'anime style, small mountain village in ruins, buildings on fire and collapsed, thick smoke rising, burning embers, devastated atmosphere, orange-red glow from flames, night sky, dramatic and sorrowful',
};

// ─── Asset manifest ──────────────────────────────────────────────────────────

interface AssetSpec {
  key: string;
  prompt: string;
  width: number;
  height: number;
  sizes: Array<{ suffix: string; w: number; h: number }>;
}

const ASSETS: AssetSpec[] = [];

// Backgrounds (generate at 1024×576, resize to 3 variants)
for (const [key, prompt] of Object.entries(BG_PROMPTS)) {
  ASSETS.push({
    key,
    prompt: prompt + ', no text, no watermark, 16:9 landscape',
    width: 1024,
    height: 576,
    sizes: [
      { suffix: 'sm', w: 640, h: 360 },
      { suffix: 'md', w: 1280, h: 720 },
      { suffix: 'lg', w: 1920, h: 1080 },
    ],
  });
}

// Characters (generate at 576×832, resize to 3 portrait sizes)
for (const [char, basePrompt] of Object.entries(CHAR_BASE)) {
  const expressions = char === 'vex'
    ? ['neutral', 'surprised', 'determined', 'battle_stance']
    : Object.keys(EXPRESSIONS);

  for (const expr of expressions) {
    ASSETS.push({
      key: `${char}_${expr}`,
      prompt: `${basePrompt}, ${EXPRESSIONS[expr] ?? EXPRESSIONS['neutral']!}, white background, full body visible, no text, no watermark`,
      width: 576,
      height: 832,
      sizes: [
        { suffix: 'sm', w: 240, h: 360 },
        { suffix: 'md', w: 480, h: 720 },
        { suffix: 'lg', w: 800, h: 1200 },
      ],
    });
  }
}

// UI images
ASSETS.push(
  {
    key: 'logo',
    prompt: 'anime style logo art, sword and celestial blade imagery, gold and deep blue colors, dark background, Chronicles of the Celestial Blade stylized logo, no text, ornate design',
    width: 512,
    height: 512,
    sizes: [{ suffix: 'md', w: 256, h: 256 }],
  },
  {
    key: 'loading_art',
    prompt: 'anime style atmospheric artwork, journey and movement, celestial blade sword glowing, traveler silhouette, beautiful landscape, suitable for loading screen, no text',
    width: 1024,
    height: 576,
    sizes: [{ suffix: 'md', w: 800, h: 450 }],
  }
);

// ─── Replicate API ────────────────────────────────────────────────────────────

function httpsGet(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    (protocol as typeof https).get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const location = res.headers['location'];
        if (location) return resolve(httpsGet(location));
        return reject(new Error('Redirect with no location'));
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function httpsPost(url: string, body: string, token: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = Buffer.from(body);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Prefer': 'wait',
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString()));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpsGetJson(url: string, token: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'Authorization': `Token ${token}` },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString()));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateImage(spec: AssetSpec, token: string): Promise<Buffer> {
  const body = JSON.stringify({
    input: {
      prompt: spec.prompt,
      width: spec.width,
      height: spec.height,
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 82,
      go_fast: true,
    },
  });

  let raw = await httpsPost(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions',
    body,
    token
  );

  let prediction = JSON.parse(raw) as { id: string; status: string; output?: string[]; urls?: { get: string }; error?: string };

  // Poll until complete (with Prefer: wait the server may return already-completed)
  let attempts = 0;
  while (prediction.status === 'starting' || prediction.status === 'processing') {
    if (attempts++ > 60) throw new Error('Timeout waiting for prediction');
    await sleep(2000);
    const pollUrl = prediction.urls?.get ?? `https://api.replicate.com/v1/predictions/${prediction.id}`;
    raw = await httpsGetJson(pollUrl, token);
    prediction = JSON.parse(raw);
  }

  if (prediction.status !== 'succeeded' || !prediction.output?.[0]) {
    throw new Error(`Prediction failed: ${prediction.error ?? prediction.status}`);
  }

  const imageUrl = prediction.output[0];
  return httpsGet(imageUrl);
}

// ─── Resize with sharp ────────────────────────────────────────────────────────

async function resizeAndSave(imgBuffer: Buffer, spec: AssetSpec): Promise<void> {
  // Dynamic import of sharp to avoid issues if not installed
  const sharp = (await import('sharp')).default;
  for (const size of spec.sizes) {
    const outPath = path.join(OUT_DIR, `${spec.key}_${size.suffix}.webp`);
    await sharp(imgBuffer)
      .resize(size.w, size.h, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toFile(outPath);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const total = ASSETS.length;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Celestial Blade Asset Generator — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Total assets: ${total} images → up to ${ASSETS.reduce((n, a) => n + a.sizes.length, 0)} WebP files`);
  console.log(`Est. cost: $${(total * 0.015).toFixed(2)} – $${(total * 0.03).toFixed(2)} (Replicate FLUX.1-dev)`);
  console.log(`${'─'.repeat(60)}\n`);

  if (DRY_RUN) {
    for (const [i, spec] of ASSETS.entries()) {
      const variants = spec.sizes.map(s => `${spec.key}_${s.suffix}.webp (${s.w}×${s.h})`).join(', ');
      console.log(`[${String(i + 1).padStart(2)}/${total}] ${spec.key} → ${variants}`);
      console.log(`  Prompt: ${spec.prompt.slice(0, 100)}...`);
    }
    console.log('\n✓ Dry run complete. Remove --dry-run to generate for real.');
    return;
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, spec] of ASSETS.entries()) {
    // Check if all size variants already exist
    const allExist = spec.sizes.every(s =>
      fs.existsSync(path.join(OUT_DIR, `${spec.key}_${s.suffix}.webp`))
    );
    if (allExist) {
      console.log(`[${String(i + 1).padStart(2)}/${total}] ⏭  ${spec.key} — already exists, skipping`);
      skipped++;
      continue;
    }

    console.log(`[${String(i + 1).padStart(2)}/${total}] ⏳ Generating ${spec.key} (${spec.width}×${spec.height})...`);

    let attempts = 0;
    let success = false;
    while (attempts < 3 && !success) {
      try {
        const imgBuffer = await generateImage(spec, REPLICATE_TOKEN!);
        await resizeAndSave(imgBuffer, spec);
        const files = spec.sizes.map(s => `${spec.key}_${s.suffix}.webp`).join(', ');
        console.log(`  ✅ Saved: ${files}`);
        generated++;
        success = true;
      } catch (err) {
        attempts++;
        const delay = Math.pow(2, attempts) * 1000;
        console.error(`  ❌ Attempt ${attempts}/3 failed: ${(err as Error).message}. Retrying in ${delay / 1000}s...`);
        if (attempts < 3) await sleep(delay);
        else failed++;
      }
    }

    // Rate limit: 1s between requests
    await sleep(1000);
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Done! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log('\nNext step: upload to GitHub Release:');
  console.log('  npx ts-node --project tsconfig.scripts.json scripts/upload-assets.ts');
  console.log(`${'─'.repeat(60)}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
