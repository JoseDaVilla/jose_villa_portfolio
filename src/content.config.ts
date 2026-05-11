// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title:        z.string(),
    year:         z.number(),
    tagline:      z.string(),
    tags:         z.array(z.string()).max(6),
    category:     z.enum(['selected', 'other', 'archive']),
    order:        z.number(),
    coverImage:   image().optional(),
    previewVideo: z.string().optional(),
    embedUrl:     z.string().url().optional(),
    liveUrl:      z.string().url().optional(),
    repoUrl:      z.string().url().optional(),
    role:         z.string().optional(),
    period:       z.string().optional(),
    gallery:      z.array(image()).optional(),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company:    z.string(),
    role:       z.string(),
    period:     z.string(),
    companyUrl: z.string().url().optional(),
    tags:       z.array(z.string()).max(8),
    order:      z.number(),
  }),
});

export const collections = { projects, experience };
