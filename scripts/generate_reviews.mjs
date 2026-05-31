import fs from 'fs';
import path from 'path';
import { fetchSearchContext } from './web_crawler.mjs';

const DEEPSEEK_API_KEY = "sk-a2dc0881aaac4bfcbe75b200177655b1";
const REVIEWS_DIR = path.join(process.cwd(), 'src', 'content', 'reviews');

if (!fs.existsSync(REVIEWS_DIR)) fs.mkdirSync(REVIEWS_DIR, { recursive: true });

function sanitizeSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function callDeepSeek(prompt) {
  const reqBody = {
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    response_format: { type: "json_object" }
  };

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify(reqBody)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function generateReview(productName, category) {
  console.log(`\n======================================================`);
  console.log(`💻 Benchmarking Hardware: ${productName}`);
  
  // 1. Crawl for facts
  console.log(`🔍 Crawling Reddit and Spec Sheets for ${productName}...`);
  let searchResults = "";
  try {
    searchResults = await fetchSearchContext(`"${productName}" review specs pros cons reddit 2026`);
  } catch (e) {
    console.warn(`⚠️ Crawl failed: ${e.message}`);
  }

  // 2. Ask DeepSeek to generate Schema + Markdown
  console.log(`🧠 Generating Editorial Tech Review...`);
  const prompt = `
You are a snarky, brutally honest Senior Hardware Editor writing for GeekTechReview.com (similar to The Verge or MKBHD).
Write an exhaustive, opinionated review for the hardware product: "${productName}".

I have scraped the web for factual data. Here are the snippets:
---
${searchResults}
---

Your task is to output a single JSON object containing BOTH the frontmatter metadata and the full markdown review.
Do NOT hold back. If it's too expensive, say it. If the battery life is terrible, say it. If it's a masterpiece, praise it.
Ensure all specs are factual based on the snippets.

Output exactly this JSON structure (no markdown fences around it, just raw JSON):
{
  "title": "Exact Product Name",
  "description": "A punchy, slightly controversial 1-2 sentence subtitle.",
  "category": "${category}",
  "author": "Alex Chen",
  "score": "A number out of 10, e.g., 8.5",
  "price": "e.g., $1,999",
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2", "Con 3"],
  "bottomLine": "1 paragraph brutal conclusion.",
  "verdict": "Choose one: Editor's Choice, Solid Pick, Wait for Sale, Do Not Buy",
  "markdownContent": "The full detailed editorial review in Markdown. Include H2s like '## Design & Build', '## Performance Benchmarks', '## The Verdict'. Write with personality and flair. Do not include the title (H1) or frontmatter."
}
`;

  const responseJson = await callDeepSeek(prompt);
  let parsed;
  try {
    parsed = JSON.parse(responseJson);
    if(typeof parsed.score === 'string') parsed.score = parseFloat(parsed.score);
  } catch (e) {
    console.error("❌ Failed to parse output:", responseJson);
    return;
  }

  // 3. Write File
  const slug = sanitizeSlug(parsed.title);
  const filePath = path.join(REVIEWS_DIR, `${slug}.md`);
  const dateStr = new Date().toISOString().split('T')[0];

  const frontmatter = `---
title: "${parsed.title.replace(/"/g, '\\"')}"
description: "${parsed.description.replace(/"/g, '\\"')}"
category: "${parsed.category}"
author: "${parsed.author}"
score: ${parsed.score}
price: "${parsed.price}"
pros: ${JSON.stringify(parsed.pros || [])}
cons: ${JSON.stringify(parsed.cons || [])}
bottomLine: "${parsed.bottomLine.replace(/"/g, '\\"')}"
verdict: "${parsed.verdict}"
publishedAt: ${dateStr}
---

${parsed.markdownContent}
`;

  fs.writeFileSync(filePath, frontmatter, 'utf-8');
  console.log(`   ✅ Created editorial review: ${slug}.md`);
}

async function run() {
  const products = [
    { name: "M4 Max MacBook Pro", cat: "Laptops" },
    { name: "Sony WH-1000XM6", cat: "Audio" },
    { name: "NuPhy Halo75 v2", cat: "Keyboards" },
    { name: "Alienware 34 Curved QD-OLED", cat: "Monitors" },
    { name: "Keychron Q1 Pro", cat: "Keyboards" }
  ];
  
  for (const p of products) {
    await generateReview(p.name, p.cat);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log(`\n🎉 Batch complete! Generated reviews for ${products.length} products.`);
}

run();
