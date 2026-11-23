import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://asoexi.com',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
