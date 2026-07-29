/**
 * JSON-LD schema generators (REBUILD_PLAN §4.4).
 * Each generator returns an object or array suitable for
 * `<script type="application/ld+json">`.
 */

const SITE = "https://geektechreview.com";
const ORG = {
  "@type": "Organization",
  name: "GeekTechReview",
  url: SITE,
  logo: `${SITE}/favicon.svg`,
};

export interface ReviewLike {
  title: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  price?: number;
  priceCurrency?: string;
  rating: number;
  verdict: string;
  verdictLabel: string;
  publishedAt: Date | string;
  updatedAt?: Date | string;
  testedBy?: string;
  slug?: string;
}

function iso(d: Date | string | undefined): string | undefined {
  if (!d) return undefined;
  return typeof d === "string" ? d : d.toISOString();
}

/** Product + Review + AggregateRating + BreadcrumbList for a single review. */
export function generateReviewSchema(review: ReviewLike, categoryLabel?: string) {
  const url = `${SITE}/reviews/${review.category}/${review.slug ?? ""}/`;
  const cat = categoryLabel ?? review.category;

  const product = {
    "@type": "Product",
    name: review.title,
    description: review.description,
    brand: { "@type": "Brand", name: review.brand },
    ...(review.price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            price: review.price,
            priceCurrency: review.priceCurrency ?? "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: review.rating,
      bestRating: 10,
      worstRating: 0,
      ratingCount: 1,
      reviewCount: 1,
    },
    review: {
      "@type": "Review",
      reviewBody: review.verdict,
      datePublished: iso(review.publishedAt),
      ...(review.updatedAt ? { dateModified: iso(review.updatedAt) } : {}),
      author: {
        "@type": "Person",
        name: review.testedBy ?? "Alex Chen",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 10,
        worstRating: 0,
      },
      publisher: ORG,
    },
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${SITE}/reviews/` },
      { "@type": "ListItem", position: 3, name: cat, item: `${SITE}/reviews/${review.category}/` },
      { "@type": "ListItem", position: 4, name: review.title, item: url },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [product, breadcrumb],
  };
}

/** ItemList + FAQPage for a best-of / list page. */
export function generateListSchema(
  items: { name: string; url: string; rating?: number }[],
  name: string,
  faqs?: { question: string; answer: string }[],
) {
  const itemList = {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
      ...(item.rating !== undefined
        ? {
            item: {
              "@type": "Product",
              name: item.name,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: item.rating,
                bestRating: 10,
                worstRating: 0,
              },
            },
          }
        : {}),
    })),
  };

  const graph: unknown[] = [itemList];

  if (faqs && faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Product × N + Review × N for a comparison page. */
export function generateCompareSchema(
  products: ReviewLike[],
) {
  const graph = products.map((p) => ({
    "@type": "Product",
    name: p.title,
    brand: { "@type": "Brand", name: p.brand },
    ...(p.price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: p.priceCurrency ?? "USD",
          },
        }
      : {}),
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: p.rating,
        bestRating: 10,
        worstRating: 0,
      },
      author: { "@type": "Person", name: p.testedBy ?? "Alex Chen" },
    },
  }));

  return { "@context": "https://schema.org", "@graph": graph };
}

export interface GuideLike {
  title: string;
  description: string;
  slug?: string;
  steps?: { name: string; text: string }[];
  publishedAt?: Date | string;
}

/** HowTo + Article for a buying guide. */
export function generateGuideSchema(guide: GuideLike) {
  const url = `${SITE}/guides/${guide.slug ?? ""}/`;

  const howTo = {
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    ...(guide.publishedAt ? { datePublished: iso(guide.publishedAt) } : {}),
    step: (guide.steps ?? []).map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
  };

  const article = {
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url,
    author: { "@type": "Person", name: "Alex Chen" },
    publisher: ORG,
  };

  return { "@context": "https://schema.org", "@graph": [howTo, article] };
}

/** WebSite + SearchAction + Organization for the homepage / global. */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "GeekTechReview",
        url: SITE,
        publisher: ORG,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      ORG,
    ],
  };
}
