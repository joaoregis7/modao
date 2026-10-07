export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  duration: number; // in seconds
  durationFormatted: string; // e.g. "03:32"
  coverUrl: string;
  audioUrl?: string;
  stationId: string;
  genre: string;
  year?: number;
  bpm?: number;
  musicalKey?: string;
}

export interface Station {
  id: string;
  name: string;
  emoji: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  gradient: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  origin: string;
  yearsActive: string;
  trackIds: string[];
  bio: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  badge: string;
  trackIds: string[];
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'search' }
  | { type: 'favorites' }
  | { type: 'all_tracks'; searchQuery?: string; genre?: string }
  | { type: 'station'; stationId: string }
  | { type: 'artist'; artistId: string }
  | { type: 'playlist'; playlistId: string };
