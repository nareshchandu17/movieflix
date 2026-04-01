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
