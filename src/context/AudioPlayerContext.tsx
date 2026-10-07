import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Track } from '../types';
import { audioEngine } from '../services/audioEngine';
import { StorageService } from '../services/storage';
import { AudioStorage } from '../services/audioStorage';
import { TRACKS } from '../data/tracks';

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  isShuffle: boolean;
  isRepeat: boolean;
  volume: number;
  favorites: string[];
  isCarMode: boolean;
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;
  lastPlayedTrack: Track | null;
  allTracks: Track[];
  importedTracks: Track[];
  downloadedTrackIds: string[];
  isDownloaded: (trackId: string) => boolean;
  downloadTrack: (track: Track) => Promise<void>;
  removeDownloadedTrack: (trackId: string) => Promise<void>;
  downloadAllTracks: () => Promise<void>;
  isDownloadingAll: boolean;
  downloadAllProgress: { current: number; total: number; percentage: number } | null;

  // Actions
  playTrack: (track: Track, customQueue?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  playRandomTrack: () => void;
  playAll: (tracks: Track[], shuffleFirst?: boolean) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  openCarMode: () => void;
  closeCarMode: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  addCustomTracks: (newTracks: Track[]) => void;
  deleteCustomTrack: (trackId: string) => void;
  clearCustomTracks: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [downloadAllProgress, setDownloadAllProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(200);
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.9);
  const [isCarMode, setIsCarMode] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [lastPlayedTrack, setLastPlayedTrack] = useState<Track | null>(null);

  // Combine built-in tracks + user-imported tracks
  const allTracks = useMemo(() => {
    return [...importedTracks, ...TRACKS];
  }, [importedTracks]);

  // Initialize from localStorage and IndexedDB
  useEffect(() => {
    AudioStorage.getDownloadedTrackIds().then((ids) => {
      setDownloadedTrackIds(ids);
    });
    const savedImported = StorageService.getImportedTracks();
    setImportedTracks(savedImported);

    const savedFavorites = StorageService.getFavorites();
    setFavorites(savedFavorites);

    const savedSettings = StorageService.getSettings();
    setIsShuffle(savedSettings.shuffle);
    setIsRepeat(savedSettings.repeat);
    setVolumeState(savedSettings.volume);
    audioEngine.setVolume(savedSettings.volume);

    const combinedTracks = [...savedImported, ...TRACKS];
    setQueue(combinedTracks);

    const lastState = StorageService.getLastState();
    if (lastState) {
      const found = combinedTracks.find(t => t.id === lastState.trackId);
      if (found) {
        setLastPlayedTrack(found);
        setCurrentTrack(found);
        setCurrentTime(lastState.position || 0);
        setDuration(found.duration);
        const idx = combinedTracks.findIndex(t => t.id === found.id);
        if (idx !== -1) setQueueIndex(idx);
      }
    } else {
      setCurrentTrack(combinedTracks[0]);
      setDuration(combinedTracks[0].duration);
    }
  }, []);

  // Sync audio engine events
  useEffect(() => {
    const unsubPlay = audioEngine.onPlay(() => setIsPlaying(true));
    const unsubPause = audioEngine.onPause(() => setIsPlaying(false));
    const unsubTime = audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      if (dur > 0) setDuration(dur);
    });

    return () => {
      unsubPlay();
      unsubPause();
      unsubTime();
    };
  }, []);

  // Save current position periodically to localStorage
  useEffect(() => {
    if (currentTrack && currentTime > 0) {
      StorageService.setLastState({
        trackId: currentTrack.id,
        position: currentTime,
        updatedAt: Date.now(),
      });
    }
  }, [currentTrack, currentTime]);

  // Handle Play track
  const playTrack = useCallback((track: Track, customQueue?: Track[]) => {
    if (customQueue && customQueue.length > 0) {
      setQueue(customQueue);
      const idx = customQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setQueueIndex(idx);
      } else {
        const updated = [track, ...queue];
        setQueue(updated);
        setQueueIndex(0);
      }
    }

    setCurrentTrack(track);
    setLastPlayedTrack(track);
    StorageService.addRecentlyPlayed(track.id);
    audioEngine.playTrack(track, 0);
  }, [queue]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      if (currentTrack) {
        audioEngine.resume();
      } else if (queue.length > 0) {
        playTrack(queue[0]);
      }
    }
  }, [isPlaying, currentTrack, queue, playTrack]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * queue.length);
      setQueueIndex(randIdx);
      playTrack(queue[randIdx]);
      return;
    }

    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    playTrack(queue[nextIdx]);
  }, [queue, queueIndex, isShuffle, playTrack]);

  const previousTrack = useCallback(() => {
    if (queue.length === 0) return;

    // If more than 3 seconds played, restart song
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    playTrack(queue[prevIdx]);
  }, [queue, queueIndex, currentTime, playTrack]);

  // Handle audio track end automatically
  useEffect(() => {
    const unsubEnd = audioEngine.onEnded(() => {
      if (isRepeat && currentTrack) {
        audioEngine.playTrack(currentTrack, 0);
      } else {
        nextTrack();
      }
    });
    return unsubEnd;
  }, [isRepeat, currentTrack, nextTrack]);

  // Bluetooth & Car Audio Integration via Media Session API
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentTrack) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.genre || 'Rádio Modão',
          artwork: [
            { src: currentTrack.coverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '384x384', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (err) {
        console.warn('Error setting MediaSession metadata', err);
      }
    }

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        togglePlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePlayPause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        previousTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          audioEngine.seek(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('Error configuring MediaSession actions', err);
    }
  }, [currentTrack, isPlaying, togglePlayPause, previousTrack, nextTrack]);

  const seek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    audioEngine.setVolume(val);
    StorageService.setSettings({
      volume: val,
      shuffle: isShuffle,
      repeat: isRepeat,
    });
  }, [isShuffle, isRepeat]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const next = !prev;
      StorageService.setSettings({
        volume,
        shuffle: next,
        repeat: isRepeat,
      });
      return next;
    });
  }, [volume, isRepeat]);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => {
      const next = !prev;
      StorageService.setSettings({
        volume,
        shuffle: isShuffle,
        repeat: next,
      });
      return next;
    });
  }, [volume, isShuffle]);

  const toggleFavorite = useCallback((trackId: string) => {
    const updated = StorageService.toggleFavorite(trackId);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback((trackId: string) => {
    return favorites.includes(trackId);
  }, [favorites]);

  const playRandomTrack = useCallback(() => {
    const list = allTracks.length > 0 ? allTracks : TRACKS;
    const randomIndex = Math.floor(Math.random() * list.length);
    const selected = list[randomIndex];
    playTrack(selected, list);
  }, [allTracks, playTrack]);

  const addCustomTracks = useCallback((newTracks: Track[]) => {
    const updated = StorageService.addImportedTracks(newTracks);
    setImportedTracks(updated);
    setQueue(prev => [...newTracks, ...prev]);
  }, []);

  const deleteCustomTrack = useCallback((trackId: string) => {
    const updated = StorageService.deleteImportedTrack(trackId);
    setImportedTracks(updated);
    setQueue(prev => prev.filter(t => t.id !== trackId));
    AudioStorage.deleteTrack(trackId).catch(() => {});
  }, []);

  const clearCustomTracks = useCallback(() => {
    StorageService.clearImportedTracks();
    setImportedTracks([]);
    setQueue(TRACKS);
  }, []);

  const playAll = useCallback((tracks: Track[], shuffleFirst = false) => {
    if (tracks.length === 0) return;
    if (shuffleFirst) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    } else {
      playTrack(tracks[0], tracks);
    }
  }, [playTrack]);

  const isDownloaded = useCallback(
    (trackId: string) => downloadedTrackIds.includes(trackId),
    [downloadedTrackIds]
  );

  const downloadTrack = useCallback(async (track: Track) => {
    // 1. Cache cover in CacheStorage if supported
    if (typeof caches !== 'undefined' && track.coverUrl) {
      try {
        const cache = await caches.open('radio-modao-covers');
        const req = new Request(track.coverUrl, { mode: 'cors' });
        const res = await fetch(req);
        if (res.ok) await cache.put(req, res);
      } catch {}
    }

    // 2. Fetch and store audio
    const audioUrl = track.audioUrl || `/musicas/${track.id}.mp3`;
    try {
      const resp = await fetch(audioUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        await AudioStorage.saveAudioBlob(track.id, blob);
        if (typeof caches !== 'undefined') {
          try {
            const cache = await caches.open('radio-modao-media-v1');
            const req = new Request(audioUrl, { mode: 'cors' });
            await cache.put(req, new Response(blob));
          } catch {}
        }
        setDownloadedTrackIds(prev => (prev.includes(track.id) ? prev : [...prev, track.id]));
      }
    } catch (e) {
      console.warn('Failed to download track', e);
    }
  }, []);

  const removeDownloadedTrack = useCallback(async (trackId: string) => {
    await AudioStorage.deleteTrack(trackId);
    setDownloadedTrackIds(prev => prev.filter(id => id !== trackId));
  }, []);

  const downloadAllTracks = useCallback(async () => {
    setIsDownloadingAll(true);
    const total = allTracks.length;
    let completed = 0;
    const concurrency = 4;

    for (let i = 0; i < total; i += concurrency) {
      const batch = allTracks.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (t) => {
          await downloadTrack(t);
          completed++;
          setDownloadAllProgress({
            current: completed,
            total,
            percentage: Math.min(100, Math.round((completed / total) * 100)),
          });
        })
      );
    }
    StorageService.setOfflineDownloaded(true);
    setIsDownloadingAll(false);
    setTimeout(() => setDownloadAllProgress(null), 3000);
  }, [allTracks, downloadTrack]);

  const openFullPlayer = useCallback(() => setIsFullPlayerOpen(true), []);
  const closeFullPlayer = useCallback(() => setIsFullPlayerOpen(false), []);
  const openCarMode = useCallback(() => setIsCarMode(true), []);
  const closeCarMode = useCallback(() => setIsCarMode(false), []);
  const openQueue = useCallback(() => setIsQueueOpen(true), []);
  const closeQueue = useCallback(() => setIsQueueOpen(false), []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        queue,
        queueIndex,
        isShuffle,
        isRepeat,
        volume,
        favorites,
        isCarMode,
        isFullPlayerOpen,
        isQueueOpen,
        lastPlayedTrack,
        allTracks,
        importedTracks,
        downloadedTrackIds,
        isDownloaded,
        downloadTrack,
        removeDownloadedTrack,
        downloadAllTracks,
        isDownloadingAll,
        downloadAllProgress,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
        isFavorite,
        playRandomTrack,
        playAll,
        openFullPlayer,
        closeFullPlayer,
        openCarMode,
        closeCarMode,
        openQueue,
        closeQueue,
        addCustomTracks,
        deleteCustomTrack,
        clearCustomTracks,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
