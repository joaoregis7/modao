import { Track } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'radio_modao_favorites',
  RECENTLY_PLAYED: 'radio_modao_recent',
  LAST_STATE: 'radio_modao_last_state',
  SETTINGS: 'radio_modao_settings',
  CUSTOM_PLAYLISTS: 'radio_modao_custom_playlists',
  IMPORTED_TRACKS: 'radio_modao_imported_tracks',
};

export interface CustomPlaylist {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  badge?: string;
  trackIds: string[];
  createdAt: number;
}

export interface StoredLastState {
  trackId: string;
  position: number;
  updatedAt: number;
}

export interface StoredSettings {
  volume: number;
  shuffle: boolean;
  repeat: boolean;
}

export const StorageService = {
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  },

  toggleFavorite(trackId: string): string[] {
    const current = this.getFavorites();
    const updated = current.includes(trackId)
      ? current.filter(id => id !== trackId)
      : [trackId, ...current];
    this.setFavorites(updated);
    return updated;
  },

  isFavorite(trackId: string): boolean {
    const list = this.getFavorites();
    return list.includes(trackId);
  },

  getRecentlyPlayed(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecentlyPlayed(trackId: string): string[] {
    const current = this.getRecentlyPlayed().filter(id => id !== trackId);
    const updated = [trackId, ...current].slice(0, 30);
    try {
      localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent tracks', e);
    }
    return updated;
  },

  getLastState(): StoredLastState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setLastState(state: StoredLastState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save last state', e);
    }
  },

  getSettings(): StoredSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {}
    return { volume: 0.9, shuffle: false, repeat: false };
  },

  setSettings(settings: StoredSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  },

  getCustomPlaylists(): CustomPlaylist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPlaylist(playlist: CustomPlaylist): CustomPlaylist[] {
    const list = this.getCustomPlaylists();
    const existingIdx = list.findIndex(p => p.id === playlist.id);
    let updated: CustomPlaylist[];
    if (existingIdx !== -1) {
      updated = [...list];
      updated[existingIdx] = playlist;
    } else {
      updated = [playlist, ...list];
    }
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save custom playlists', e);
    }
    return updated;
  },

  deleteCustomPlaylist(id: string): CustomPlaylist[] {
    const list = this.getCustomPlaylists();
    const updated = list.filter(p => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete custom playlist', e);
    }
    return updated;
  },

  isOfflineDownloaded(): boolean {
    try {
      return localStorage.getItem('radio_modao_offline_ready') === 'true';
    } catch {
      return false;
    }
  },

  setOfflineDownloaded(val: boolean): void {
    try {
      localStorage.setItem('radio_modao_offline_ready', val ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to set offline ready flag', e);
    }
  },

  getImportedTracks(): Track[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IMPORTED_TRACKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveImportedTracks(tracks: Track[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.IMPORTED_TRACKS, JSON.stringify(tracks));
    } catch (e) {
      console.warn('Failed to save imported tracks', e);
    }
  },

  addImportedTracks(newTracks: Track[]): Track[] {
    const existing = this.getImportedTracks();
    const existingIds = new Set(existing.map(t => t.id));
    const toAdd = newTracks.filter(t => !existingIds.has(t.id));
    const updated = [...existing, ...toAdd];
    this.saveImportedTracks(updated);
    return updated;
  },

  deleteImportedTrack(trackId: string): Track[] {
    const existing = this.getImportedTracks();
    const updated = existing.filter(t => t.id !== trackId);
    this.saveImportedTracks(updated);
    return updated;
  },

  clearImportedTracks(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.IMPORTED_TRACKS);
    } catch {}
  },
};
