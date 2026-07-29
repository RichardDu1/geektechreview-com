// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://geektechreview.com',
  integrations: [
    sitemap({ lastmod: new Date('2026-07-29') }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
