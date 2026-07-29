/**
 * Amazon affiliate helpers.
 * All Amazon links must use rel="sponsored nofollow" (see AffButton).
 */

const AFFILIATE_TAG = "geektechreview-20";
const AMAZON_BASE = "https://www.amazon.com";

/**
 * Build a canonical Amazon affiliate URL from an ASIN (or pass through a full URL).
 */
export function formatAmazonUrl(asinOrUrl?: string, affiliateTag: string = AFFILIATE_TAG): string | undefined {
  if (!asinOrUrl) return undefined;
  const trimmed = asinOrUrl.trim();
  // Already a full URL — attach/normalize the tag.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      url.searchParams.set("tag", affiliateTag);
      return url.toString();
    } catch {
      return trimmed;
    }
  }
  // Bare ASIN — build a dp link.
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return `${AMAZON_BASE}/dp/${trimmed}?tag=${affiliateTag}`;
  }
  return `${AMAZON_BASE}/s?k=${encodeURIComponent(trimmed)}&tag=${affiliateTag}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
};

/**
 * Format a numeric price with a currency symbol.
 * formatPrice(1299, "USD") → "$1,299"
 */
export function formatPrice(price?: number, currency: string = "USD"): string | undefined {
  if (price === undefined || price === null || Number.isNaN(price)) return undefined;
  const symbol = CURRENCY_SYMBOLS[currency] ?? "";
  const formatted = price.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export interface AffButtonProps {
  href: string;
  label: string;
  price?: string;
  asin?: string;
}

/**
 * Build the props object for AffButton from raw review fields.
 */
export function generateAffButton(
  url: string | undefined,
  price: string | undefined,
  label: string = "View on Amazon",
): AffButtonProps | undefined {
  const href = formatAmazonUrl(url);
  if (!href) return undefined;
  return {
    href,
    label,
    price,
    asin: /^https?:\/\//i.test(url ?? "") ? undefined : url,
  };
}
