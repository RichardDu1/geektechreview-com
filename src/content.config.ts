import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reviewsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reviews" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(), // e.g., "Laptops", "Audio", "Keyboards", "Monitors"
    author: z.string(),
    score: z.number(), // e.g., 9.5
    price: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    bottomLine: z.string(),
    verdict: z.string(), // e.g., "Editor's Choice", "Wait for Sale", "Do Not Buy"
    publishedAt: z.date()
  }),
});

export const collections = {
  'reviews': reviewsCollection,
};
