# GeekTechReview.com — Project Instructions

## Project Overview
GeekTechReview is a tech hardware review site focused on AI-era hardware, monetized via Amazon Associates affiliate links. Built with Astro 6 + Tailwind CSS v4 + MDX + Cloudflare Pages.

## CRITICAL: New URL Structure (NO /en/ prefix)
The old site used `/en/` prefix for all URLs. The REBUILD removes this. New structure:
```
/                          # Homepage
/reviews/                  # All reviews
/reviews/{category}/       # Category listing
/reviews/{category}/{slug}/  # Individual review
/best/{category}/          # Best-of lists
/compare/{slug}/           # Comparison pages
/deals/                    # Deals
/guides/                   # Buying guides
/about/                    # About
/editorial-policy/         # Editorial policy
/how-we-test/              # Testing methodology
/affiliate-disclosure/     # Affiliate disclosure
/contact/                  # Contact
```

## CRITICAL: Remove i18n Config
The astro.config.mjs currently has `i18n: { defaultLocale: 'en', locales: ['en'], routing: { prefixDefaultLocale: true } }`. This MUST be removed. No i18n prefix.

## Category System (8 categories)
Old categories → New categories mapping:
- Laptops, Monitors, Keyboards → laptops (or pc-components for keyboards)
- Audio → audio
- Gaming, VR → gaming
- Phones, Smartwatches → phones
- Smart Home → smart-home
- Cameras, Drones → creator-gear
- AI tools/hardware → ai-devices
- PC Components → pc-components

New category slugs: `laptops`, `phones`, `audio`, `gaming`, `pc-components`, `smart-home`, `ai-devices`, `creator-gear`

## Design System
- **Dark mode is DEFAULT** (not light)
- Remove ALL blob animations from BaseLayout
- Remove email capture popup
- Remove CookieBanner (unnecessary for affiliate site)
- Colors: See REBUILD_PLAN.md section 5.1
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code/specs)
- Score colors: 9.0+ green, 8.0-8.9 blue, 7.0-7.9 yellow, 6.0-6.9 orange, <6.0 red

## Content Schema
See `src/content.config.ts` for the NEW schema. Key changes from old:
- `category` is now an enum (not free string)
- `score` renamed to `rating` (0-10 scale)
- Added: `brand`, `model`, `amazonAsin`, `amazonUrl`, `subscores`, `verdictLabel`, `updatedAt`, `testedBy`, `testMethodology`, `images`
- `verdict` is now an enum: `buy`, `wait`, `skip`
- `price` is now a number (not string), with `priceCurrency` field

## Existing Content
- 36 reviews in `src/content/reviews/` (mix of .md and .mdx)
- 171 tools in `src/content/tools/` (will be removed/migrated later)
- 60 workflows in `src/content/workflows/` (will be removed/migrated later)
- Some reviews have duplicates (both .md and .mdx versions) — deduplicate during migration

## Build Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview build

## Performance Targets
- Lighthouse mobile: 90+ performance, 95+ accessibility, 95+ best practices, 100 SEO
- Lighthouse desktop: 95+ performance
- Zero JS by default (Astro Islands only)
- <20KB CSS
- No heavy animations

## Amazon Affiliate
- All Amazon links use `rel="sponsored nofollow"`
- Use AffButton component for all Amazon links
- 1-3 Amazon links per review, 1 per item in best-of lists
- Affiliate disclosure in footer on every page
