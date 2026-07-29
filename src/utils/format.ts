/**
 * Formatting helpers shared across layouts, components, and pages.
 */

/** Format an ISO/Date as e.g. "July 29, 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Format price number into e.g. "$1,299". */
export function formatPrice(price?: number, currency: string = "USD"): string | undefined {
  if (price === undefined || price === null) return undefined;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch (e) {
    return `$${price}`;
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  laptops: "Laptops",
  phones: "Phones",
  audio: "Audio",
  gaming: "Gaming",
  "pc-components": "PC Components",
  "smart-home": "Smart Home",
  "ai-devices": "AI Devices",
  "creator-gear": "Creator Gear",
};

/** Convert a category slug to a human label. */
export function formatCategory(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

/** All category slugs in canonical order. */
export const CATEGORY_SLUGS = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[];

/** URL-safe slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Score (0-10) → hex color, per REBUILD_PLAN §5.2.
 */
export function getScoreColor(score: number): string {
  if (score >= 9.0) return "#22c55e";
  if (score >= 8.0) return "#3b82f6";
  if (score >= 7.0) return "#f59e0b";
  if (score >= 6.0) return "#f97316";
  return "#ef4444";
}

/**
 * Score (0-10) → verdict label, per REBUILD_PLAN §5.2.
 */
export function getScoreLabel(score: number): string {
  if (score >= 9.0) return "Editor's Choice";
  if (score >= 8.0) return "Recommended";
  if (score >= 7.0) return "Good";
  if (score >= 6.0) return "Fair";
  return "Skip";
}
