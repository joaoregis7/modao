import { TRACKS } from '../data/tracks';
import { StorageService } from './storage';
import { AudioStorage } from './audioStorage';

const CACHE_NAME = 'radio-modao-media-v1';
const COVERS_CACHE = 'radio-modao-covers';

export interface OfflineDownloadProgress {
  total: number;
  current: number;
  percentage: number;
  currentTrackTitle: string;
}

export const OfflineCacheService = {
  // Checks if CacheStorage or IndexedDB is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && ('caches' in window || 'indexedDB' in window);
  },

  // Estimates stored cache size in MB
  async getEstimatedSizeMB(): Promise<number> {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageBytes = estimate.usage || 0;
        return Number((usageBytes / (1024 * 1024)).toFixed(1));
      } catch {
        return 0;
      }
    }
    return 0;
  },

  // Fast concurrent download of all tracks, covers and audio data
  async downloadAllForOffline(onProgress?: (p: OfflineDownloadProgress) => void): Promise<boolean> {
    try {
      let mediaCache: Cache | null = null;
      let coversCache: Cache | null = null;
      if (typeof caches !== 'undefined') {
        try {
          mediaCache = await caches.open(CACHE_NAME);
          coversCache = await caches.open(COVERS_CACHE);
        } catch {}
      }

      const total = TRACKS.length;
      let completedCount = 0;

      // Process in concurrent batches of 4 for maximum speed without overloading mobile network
      const concurrency = 4;
      for (let i = 0; i < total; i += concurrency) {
        const batch = TRACKS.slice(i, i + concurrency);

        await Promise.all(
          batch.map(async (track) => {
            // 1. Cache cover image
            if (coversCache && track.coverUrl) {
              try {
                const coverReq = new Request(track.coverUrl, { mode: 'cors' });
                const coverRes = await fetch(coverReq);
                if (coverRes && coverRes.ok) {
                  await coversCache.put(coverReq, coverRes);
                }
              } catch {}
            }

            // 2. Fetch real MP3 audio file
            if (track.audioUrl) {
              try {
                const audioRes = await fetch(track.audioUrl);
                if (audioRes && audioRes.ok) {
                  const blob = await audioRes.blob();

                  // Save into IndexedDB for persistent 100% offline playback
                  await AudioStorage.saveAudioBlob(track.id, blob);

                  // Also save into CacheStorage for service worker streaming
                  if (mediaCache) {
                    try {
                      const audioReq = new Request(track.audioUrl, { mode: 'cors' });
                      await mediaCache.put(audioReq, new Response(blob));
                    } catch {}
                  }
                }
              } catch (err) {
                console.warn(`Failed downloading track ${track.title}`, err);
              }
            }

            completedCount++;
            if (onProgress) {
              onProgress({
                total,
                current: completedCount,
                percentage: Math.min(100, Math.round((completedCount / total) * 100)),
                currentTrackTitle: track.title,
              });
            }
          })
        );
      }

      StorageService.setOfflineDownloaded(true);
      return true;
    } catch (err) {
      console.warn('Offline cache download error', err);
      StorageService.setOfflineDownloaded(true);
      return true;
    }
  },

  // Clear offline cache and indexedDB to free device storage
  async clearCache(): Promise<boolean> {
    try {
      if (typeof caches !== 'undefined') {
        await caches.delete(CACHE_NAME);
        await caches.delete(COVERS_CACHE);
      }
      await AudioStorage.clearAll();
      StorageService.setOfflineDownloaded(false);
      return true;
    } catch {
      return false;
    }
  },
};
