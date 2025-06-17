export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  externalUrls?: Record<string, string>;
  uri?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  totalTracks: number;
  owner?: string;
}

export interface MatchResult {
  originalTrack: Track;
  matchedTrack?: Track;
  confidence: number;
  status: 'matched' | 'failed' | 'partial';
}

export interface TransferProgress {
  id: string;
  totalTracks: number;
  processedTracks: number;
  successfulMatches: number;
  failedMatches: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: MatchResult[];
}

export type Platform = 'spotify' | 'apple';