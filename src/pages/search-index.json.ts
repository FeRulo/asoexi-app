import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSearchIndex } from '@/lib/search';

export const prerender = true;

export const GET: APIRoute = async () => {
  const brands = await getCollection('brands');
  const categories = await getCollection('categories');
  const index = buildSearchIndex(
    brands.map((b) => b.data),
    categories.map((c) => c.data)
  );

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
