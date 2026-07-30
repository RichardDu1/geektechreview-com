import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content Collections — GeekTechReview (REBUILD_PLAN §4.3).
 *
 * Reviews use a strict schema (rating 0-10, category enum, brand/model,
 * verdict label, subscores, images). The old `score`/`bottomLine`/string
 * `price` fields are gone.
 */

const reviewsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/reviews" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "laptops",
      "phones",
      "audio",
      "gaming",
      "pc-components",
      "smart-home",
      "ai-devices",
      "creator-gear",
    ]),
    author: z.string().default("Alex Chen"),

    // Product identity
    brand: z.string(),
    model: z.string(),
    slug: z.string().default(""),

    // Pricing
    price: z.number().optional(),
    priceCurrency: z.string().default("USD"),

    // Amazon affiliate
    amazonAsin: z.string().optional(),
    amazonUrl: z.string().optional(),

    // Scoring
    rating: z.number().min(0).max(10),
    subscores: z
      .object({
        performance: z.number(),
        value: z.number(),
        design: z.number(),
        features: z.number(),
        battery: z.number().optional(),
      })
      .optional(),

    // Verdict
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    verdict: z.string(),
    verdictLabel: z.enum(["buy", "wait", "skip"]),

    // Editorial / freshness
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    testedBy: z.string().default("Alex Chen"),
    testMethodology: z.string().default("v1.0"),
    featured: z.boolean().default(false),

    // Images
    images: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const bestOfsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/best-ofs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "laptops",
      "phones",
      "audio",
      "gaming",
      "pc-components",
      "smart-home",
      "ai-devices",
      "creator-gear",
    ]),
    useCase: z.string().optional(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    items: z
      .array(
        z.object({
          rank: z.number(),
          name: z.string(),
          reviewSlug: z.string().optional(),
          blurb: z.string(),
        }),
      )
      .default([]),
  }),
});

const comparisonsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/comparisons" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    productA: z.string(),
    productB: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    verdict: z.string(),
    winner: z.enum(["a", "b", "tie"]),
  }),
});

const guidesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    steps: z
      .array(
        z.object({
          name: z.string(),
          text: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = {
  reviews: reviewsCollection,
  "best-ofs": bestOfsCollection,
  comparisons: comparisonsCollection,
  guides: guidesCollection,
};
