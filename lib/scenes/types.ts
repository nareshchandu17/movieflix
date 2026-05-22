/**
 * @file types.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

export interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: string;
  publishedAt: string;
}

export interface CarouselConfig {
  id: string;
  title: string;
  query: string;
  icon: string;
}

export interface CarouselData {
  id: string;
  title: string;
  query: string;
  icon: string;
  clips: Clip[];
}

export interface ScenesApiResponse {
  clips: Clip[];
  cached?: boolean;
}
