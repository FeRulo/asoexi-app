import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const SECTOR_IDS = [
  'electrico',
  'ferretero-construccion',
  'hidraulico-pinturas',
] as const;

export type SectorId = (typeof SECTOR_IDS)[number];

export const brandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sector: z.enum(SECTOR_IDS),
  isTractor: z.boolean(),
  logo: z.string().nullable().optional(),
  description: z.string().min(1),
  applicationNotes: z.string(),
  pdfCatalogUrl: z.string().nullable().optional(),
});

export const categorySchema = z.object({
  id: z.enum(SECTOR_IDS),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  icon: z.string().optional(),
});

export type Brand = z.infer<typeof brandSchema>;
export type Category = z.infer<typeof categorySchema>;

const brands = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/brands' }),
  schema: brandSchema,
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: categorySchema,
});

export const collections = {
  brands,
  categories,
};
