import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSitemapEntries, renderSitemapXml } from '@/lib/sitemap';

export const prerender = true;

export const GET: APIRoute = async () => {
  const brands = await getCollection('brands');
  const entries = buildSitemapEntries(brands);
  const xml = renderSitemapXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
