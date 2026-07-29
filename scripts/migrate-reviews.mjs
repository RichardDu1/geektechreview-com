/**
 * One-shot migration script for src/content/reviews/*.{md,mdx}
 * Converts old frontmatter schema → new strict schema (content.config.ts).
 *
 * Mapping:
 *  - score → rating
 *  - price "$1,299 (starting…)" → number + currency
 *  - category string → 8-value enum
 *  - brand/model inferred from title
 *  - bottomLine → verdict (descriptive text)
 *  - verdictLabel derived from rating (≥8.5 buy, ≥7 wait, else skip)
 *  - dedupe md/mdx pairs: keep .md (richer), delete duplicate .mdx
 *
 * Run: node scripts/migrate-reviews.mjs
 */
import { readdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const REVIEWS_DIR = "src/content/reviews";

const CATEGORY_MAP = {
  Laptops: "laptops",
  Phones: "phones",
  Tablets: "phones",
  Wearables: "phones",
  Audio: "audio",
  Microphones: "audio",
  Ereaders: "creator-gear",
  "E-Readers": "creator-gear",
  Gaming: "gaming",
  VR: "gaming",
  Monitors: "pc-components",
  "PC Components": "pc-components",
  Storage: "pc-components",
  Networking: "pc-components",
  "Smart Home": "smart-home",
  Cameras: "creator-gear",
  Drones: "creator-gear",
  Keyboards: "pc-components",
  Mice: "pc-components",
  Webcams: "pc-components",
  Accessories: "pc-components",
  Bags: "creator-gear",
  Desks: "pc-components",
  Projectors: "creator-gear",
  TVs: "gaming",
};

function mapCategory(raw) {
  if (CATEGORY_MAP[raw] !== undefined) return CATEGORY_MAP[raw];
  // fallback heuristic
  const lower = raw.toLowerCase();
  if (lower.includes("laptop")) return "laptops";
  if (lower.includes("phone") || lower.includes("wearable")) return "phones";
  if (lower.includes("audio") || lower.includes("mic")) return "audio";
  if (lower.includes("game") || lower.includes("vr")) return "gaming";
  if (lower.includes("smart")) return "smart-home";
  if (lower.includes("camera") || lower.includes("drone")) return "creator-gear";
  return "pc-components";
}

function parsePrice(raw) {
  if (!raw) return undefined;
  // Extract first number, handling commas and decimals.
  const m = String(raw).match(/([\d,]+(?:\.\d+)?)/);
  if (!m) return undefined;
  const num = Number(m[1].replace(/,/g, ""));
  return Number.isNaN(num) ? undefined : num;
}

function inferBrandModel(title) {
  // Brand = first 1-2 words of the title (heuristic).
  const words = title.split(/\s+/);
  // Common single-word brands.
  const single = ["Apple", "Sony", "Bose", "LG", "Samsung", "Razer", "Anker", "Logitech", "NuPhy", "Keychron", "Aqara", "Eve", "Meta", "Netgear", "Peak", "Ring", "Roborock", "Satechi", "Secretlab", "Shure", "Sonos", "Wacom", "Xgimi", "DJI", "Alienware", "Amazon"];
  const first = words[0];
  if (single.includes(first)) {
    return { brand: first, model: words.slice(1).join(" ") };
  }
  // Two-word brand fallback.
  return { brand: first, model: words.slice(1).join(" ") };
}

function deriveVerdictLabel(rating) {
  if (rating >= 8.5) return "buy";
  if (rating >= 7.0) return "wait";
  return "skip";
}

// Minimal YAML frontmatter parser for our specific shape.
function parseFrontmatter(text) {
  // Normalize CRLF → LF so regexes match on Windows-authored files.
  const normalized = text.replace(/\r\n/g, "\n");
  const m = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const fmText = m[1];
  const body = m[2];
  const data = {};
  const lines = fmText.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv && !kv[2].trim().startsWith("[")) {
      // scalar (may be quoted)
      let val = kv[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[kv[1]] = val;
      i++;
    } else if (kv && kv[2].trim().startsWith("[")) {
      // inline array
      const arrStr = kv[2].trim();
      const items = arrStr.match(/"([^"]*)"|'([^']*)'/g)?.map((s) => s.slice(1, -1)) ?? [];
      data[kv[1]] = items;
      i++;
    } else {
      i++;
    }
  }
  return { data, body };
}

function buildNewFrontmatter(d, slug) {
  const title = d.title || "Untitled";
  const description = d.description || "";
  const category = mapCategory(d.category || "");
  const rating = Number(d.score ?? d.rating ?? 8);
  const price = parsePrice(d.price);
  const { brand, model } = inferBrandModel(title);
  const pros = d.pros ?? [];
  const cons = d.cons ?? [];
  const verdict = d.bottomLine || d.verdict || "";
  const verdictLabel = deriveVerdictLabel(rating);
  const author = d.author || "Alex Chen";
  const publishedAt = (d.publishedAt || "2026-07-29").trim();

  const fm = [];
  fm.push(`title: "${title.replace(/"/g, "'")}"`);
  fm.push(`description: "${description.replace(/"/g, "'")}"`);
  fm.push(`category: "${category}"`);
  fm.push(`author: "${author}"`);
  fm.push(`brand: "${brand}"`);
  fm.push(`model: "${model}"`);
  fm.push(`slug: "${slug}"`);
  if (price !== undefined) fm.push(`price: ${price}`);
  fm.push(`priceCurrency: "USD"`);
  fm.push(`rating: ${rating}`);
  if (pros.length) {
    fm.push("pros:");
    pros.forEach((p) => fm.push(`  - "${p.replace(/"/g, "'")}"`));
  } else {
    fm.push("pros: []");
  }
  if (cons.length) {
    fm.push("cons:");
    cons.forEach((c) => fm.push(`  - "${c.replace(/"/g, "'")}"`));
  } else {
    fm.push("cons: []");
  }
  fm.push(`verdict: "${verdict.replace(/"/g, "'")}"`);
  fm.push(`verdictLabel: "${verdictLabel}"`);
  fm.push(`publishedAt: ${publishedAt}`);
  fm.push(`testedBy: "${author}"`);
  fm.push(`testMethodology: "v1.0"`);
  fm.push(`featured: false`);

  return fm.join("\n");
}

async function main() {
  const all = await readdir(REVIEWS_DIR, { withFileTypes: true });
  const files = all.filter((d) => d.isFile()).map((d) => d.name);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

  // Dedupe: for any base that has BOTH .md and .mdx, keep .md, delete .mdx.
  const toDelete = [];
  for (const mdx of mdxFiles) {
    const base = mdx.replace(/\.mdx$/, "");
    if (mdFiles.includes(`${base}.md`)) {
      toDelete.push(mdx);
    }
  }

  const keepers = files.filter((f) => !toDelete.includes(f));

  let migrated = 0;
  for (const f of keepers) {
    const path = join(REVIEWS_DIR, f);
    const ext = extname(f);
    const slug = basename(f, ext);
    const raw = await readFile(path, "utf8");
    const parsed = parseFrontmatter(raw);
    if (!parsed) {
      console.warn(`SKIP (no frontmatter): ${f}`);
      continue;
    }
    const newFm = buildNewFrontmatter(parsed.data, slug);
    const newContent = `---\n${newFm}\n---\n\n${parsed.body.trimStart()}`;
    await writeFile(path, newContent, "utf8");
    migrated++;
  }

  for (const f of toDelete) {
    await unlink(join(REVIEWS_DIR, f));
    console.log(`DEDUP deleted: ${f}`);
  }

  console.log(`Migrated ${migrated} files. Deleted ${toDelete.length} duplicates.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
