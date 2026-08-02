export type ContentType = 'live' | 'movie' | 'series';

export interface PlaylistItem {
  id: string;
  name: string;
  type: ContentType;
  group: string; // e.g. "CANAIS | ESPORTES", "FILMES | AÇÃO", "SERIES | NETFLIX"
  logo?: string;
  url: string;
  epgId?: string;
  // Movie/Series specific
  description?: string;
  year?: string;
  rating?: string;
  genre?: string;
  duration?: string;
  // Series specific
  season?: number;
  episode?: number;
  seriesName?: string;
}

export interface SeriesEpisode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  url: string;
  logo?: string;
  overview?: string;
}

export interface SeriesGroup {
  id: string;
  name: string;
  group: string;
  logo?: string;
  description?: string;
  year?: string;
  rating?: string;
  genre?: string;
  episodes: SeriesEpisode[];
  seasonsCount: number;
}

export interface ParsedM3U {
  updatedAt?: string;
  totalCount: number;
  channelsCount: number;
  moviesCount: number;
  seriesCount: number;
  categories: {
    channels: string[];
    movies: string[];
    series: string[];
  };
  channels: PlaylistItem[];
  movies: PlaylistItem[];
  series: SeriesGroup[];
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  code: string; // e.g. "884920" for Downloader / TV Box quick access
  name: string;
  active: boolean;
  expiresAt: string; // ISO date string or "2026-12-31" or "Ilimitado"
  maxConnections: number;
  notes?: string;
  createdAt: string;
}

export interface PlaylistSource {
  id: string;
  name: string;
  type: 'url' | 'raw';
  url?: string;
  content?: string; // Raw M3U text
  updatedAt: string;
  itemCount: number;
  active: boolean;
}

export interface AppConfig {
  appName: string;
  adminPin: string;
  downloaderCode: string;
  announcement: string;
  allowGuestDemo: boolean;
  autoEnrichMetadata: boolean;
}

export interface PlayHistoryItem {
  itemId: string;
  itemType: ContentType;
  title: string;
  logo?: string;
  progressPercent: number; // 0-100
  lastPlayedAt: string;
}
