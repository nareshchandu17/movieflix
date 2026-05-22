/**
 * @file schemas.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { z } from "zod";

export const SearchSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  type: z.enum(["movie", "tv", "multi"]).optional().default("multi"),
});

export const MovieDetailsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
  append_to_response: z.string().optional(),
});

export const HomeSchema = z.object({
  region: z.string().optional().default("US"),
});

export const TrailerSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
  type: z.enum(["movie", "tv"]).default("movie"),
});
