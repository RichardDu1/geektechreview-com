import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reviewsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/reviews" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    author: z.string().default("Alex Chen"),
    rating: z.number().default(8.0),
    score: z.number().default(8.0),
    price: z.string().default("$999"),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    bottomLine: z.string().default(""),
    verdict: z.string().default("Good"),
    publishedAt: z.date().default(() => new Date()),
    publishDate: z.string().default("2026-07-08"),
    slug: z.string().default(""),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  'reviews': reviewsCollection,
};
