import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Track } from '../types';
import { audioEngine } from '../services/audioEngine';
import { StorageService } from '../services/storage';
import { AudioStorage } from '../services/audioStorage';
import { TRACKS } from '../data/tracks';

export interface ToastData {
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

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
  downloadTrack: (track: Track, triggerFileDownload?: boolean) => Promise<void>;
  removeDownloadedTrack: (trackId: string) => Promise<void>;
  downloadAllTracks: () => Promise<void>;
  isDownloadingAll: boolean;
  downloadAllProgress: { current: number; total: number; percentage: number } | null;
  toast: ToastData | null;

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
  isInstallModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  addCustomTracks: (newTracks: Track[]) => void;
  deleteCustomTrack: (trackId: string) => void;
  clearCustomTracks: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

function triggerBrowserFileDownload(blobOrUrl: Blob | string, filename: string) {
  try {
    const cleanName = filename.replace(/[\\/*?:"<>|]/g, '').trim() || 'modao';
    const finalFilename = cleanName.toLowerCase().endsWith('.mp3') ? cleanName : `${cleanName}.mp3`;

    let url: string;
    let isBlob = false;
    if (typeof blobOrUrl === 'string') {
      url = blobOrUrl;
    } else {
      url = URL.createObjectURL(blobOrUrl);
      isBlob = true;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.setAttribute('download', finalFilename);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        if (isBlob) {
          URL.revokeObjectURL(url);
        }
      } catch {}
    }, 15000);
  } catch (err) {
    console.warn('Failed to trigger browser download', err);
  }
}

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [downloadAllProgress, setDownloadAllProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);

  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ title, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [lastPlayedTrack, setLastPlayedTrack] = useState<Track | null>(null);

  const currentTrackRef = useRef<Track | null>(null);
  currentTrackRef.current = currentTrack;
  const lastSavedPositionRef = useRef<number>(0);
  const lastMediaSessionUpdateRef = useRef<number>(0);

  // Exibe o popup de instalação ao entrar no aplicativo no celular (se ainda não instalado)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    try {
      const dismissed = localStorage.getItem('modao_pwa_dismissed');
      if (dismissed !== 'true') {
        const timer = setTimeout(() => {
          setIsInstallModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

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
        setDuration(found.duration);
        const idx = combinedTracks.findIndex(t => t.id === found.id);
        if (idx !== -1) setQueueIndex(idx);
      }
    } else {
      setCurrentTrack(combinedTracks[0]);
      setDuration(combinedTracks[0].duration);
    }
  }, []);

  // Sync audio engine events (optimized: without high-frequency React re-renders)
  useEffect(() => {
    audioEngine.setAccessEnabled(true);
    const unsubPlay = audioEngine.onPlay(() => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    const unsubPause = audioEngine.onPause(() => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      const cur = currentTrackRef.current;
      if (cur) {
        StorageService.setLastState({
          trackId: cur.id,
          position: audioEngine.getCurrentTime(),
          updatedAt: Date.now(),
        });
      }
    });

    const unsubTime = audioEngine.onTimeUpdate((time, dur) => {
      const cur = currentTrackRef.current;
      if (cur && time > 0) {
        // Salva progresso no localStorage suavemente (a cada 5 segundos) sem bloquear thread
        if (Math.abs(time - lastSavedPositionRef.current) >= 5) {
          lastSavedPositionRef.current = time;
          StorageService.setLastState({
            trackId: cur.id,
            position: time,
            updatedAt: Date.now(),
          });
        }

        // Sincroniza HUD de Bluetooth/carro a cada 4 segundos
        if (
          'mediaSession' in navigator &&
          'setPositionState' in navigator.mediaSession &&
          Math.abs(time - lastMediaSessionUpdateRef.current) >= 4
        ) {
          lastMediaSessionUpdateRef.current = time;
          try {
            navigator.mediaSession.setPositionState({
              duration: Math.max(1, dur > 0 ? dur : (cur.duration || 200)),
              playbackRate: 1,
              position: Math.min(Math.max(0, time), dur > 0 ? dur : 200),
            });
          } catch {}
        }
      }
    });

    return () => {
      audioEngine.setAccessEnabled(false);
      unsubPlay();
      unsubPause();
      unsubTime();
    };
  }, []);

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
    setDuration(track.duration || 200);
    StorageService.addRecentlyPlayed(track.id);
    audioEngine.playTrack(track, 0);
  }, [queue]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      const trackToPlay = currentTrack || lastPlayedTrack || queue[0] || allTracks[0];
      if (!trackToPlay) return;

      const engineTrack = audioEngine.getCurrentTrack();
      // If the engine hasn't loaded or started this track yet, start playback from beginning!
      if (!engineTrack || engineTrack.id !== trackToPlay.id) {
        playTrack(trackToPlay, queue.length > 0 ? queue : allTracks);
      } else {
        audioEngine.resume();
      }
    }
  }, [isPlaying, currentTrack, lastPlayedTrack, queue, allTracks, playTrack]);

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

    // Se tocou mais de 3 segundos, reinicia a música atual para o início
    if (audioEngine.getCurrentTime() > 3) {
      audioEngine.seek(0);
      return;
    }

    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    playTrack(queue[prevIdx]);
  }, [queue, queueIndex, playTrack]);

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
      navigator.mediaSession.setActionHandler('stop', () => {
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
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        audioEngine.seek(audioEngine.getCurrentTime() + offset);
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        audioEngine.seek(Math.max(0, audioEngine.getCurrentTime() - offset));
      });
    } catch (err) {
      console.warn('Error configuring MediaSession actions', err);
    }
    return () => {
      for (const action of ['play', 'pause', 'stop', 'previoustrack', 'nexttrack', 'seekto', 'seekforward', 'seekbackward'] as MediaSessionAction[]) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch {}
      }
      navigator.mediaSession.metadata = null;
    };
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

  const downloadTrack = useCallback(async (track: Track, triggerFileDownload = true) => {
    const audioUrl = track.audioUrl || `/musicas/${track.id}.mp3`;
    const cleanFilename = `${track.title} - ${track.artist}`.replace(/[\\/*?:"<>|]/g, '').trim();

    if (triggerFileDownload) {
      showToast('Baixando modão...', `Preparando "${track.title}" para salvar no seu celular.`, 'info');
    }

    try {
      // 1. Baixa o blob de áudio real
      const resp = await fetch(audioUrl);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const blob = await resp.blob();

      // 2. Salva no IndexedDB para reprodução 100% offline dentro da plataforma
      await AudioStorage.saveAudioBlob(track.id, blob);

      // 3. Cache da capa
      if (typeof caches !== 'undefined' && track.coverUrl) {
        try {
          const cache = await caches.open('radio-modao-covers');
          const req = new Request(track.coverUrl, { mode: 'cors' });
          const res = await fetch(req);
          if (res.ok) await cache.put(req, res);
        } catch {}
      }

      // 4. Cache do áudio no CacheStorage
      if (typeof caches !== 'undefined') {
        try {
          const cache = await caches.open('radio-modao-media-v1');
          const req = new Request(audioUrl, { mode: 'cors' });
          await cache.put(req, new Response(blob));
        } catch {}
      }

      setDownloadedTrackIds(prev => (prev.includes(track.id) ? prev : [...prev, track.id]));

      // 5. ACIONA O DOWNLOAD REAL DO ARQUIVO MP3 PARA O APARELHO/CELULAR
      if (triggerFileDownload) {
        triggerBrowserFileDownload(blob, `${cleanFilename}.mp3`);
        showToast(
          'Modão baixado com sucesso!',
          `"${track.title}" foi salvo no seu celular e está disponível offline.`,
          'success'
        );
      }
    } catch (e) {
      console.warn('Falha no fetch blob, acionando download direto do link no navegador', e);
      // Fallback: Aciona download direto pelo navegador para o celular receber o arquivo MP3
      if (triggerFileDownload) {
        triggerBrowserFileDownload(audioUrl, `${cleanFilename}.mp3`);
        showToast(
          'Download iniciado no celular!',
          `Baixando "${track.title}" diretamente para o seu aparelho.`,
          'success'
        );
      }
      setDownloadedTrackIds(prev => (prev.includes(track.id) ? prev : [...prev, track.id]));
    }
  }, [showToast]);

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
  const openInstallModal = useCallback(() => setIsInstallModalOpen(true), []);
  const closeInstallModal = useCallback(() => setIsInstallModalOpen(false), []);

  const contextValue = useMemo<AudioPlayerContextType>(() => ({
    currentTrack,
    isPlaying,
    currentTime: audioEngine.getCurrentTime(),
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
    isInstallModalOpen,
    toast,
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
    openInstallModal,
    closeInstallModal,
    showToast,
    hideToast,
    addCustomTracks,
    deleteCustomTrack,
    clearCustomTracks,
  }), [
    currentTrack,
    isPlaying,
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
    isInstallModalOpen,
    toast,
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
    openInstallModal,
    closeInstallModal,
    showToast,
    hideToast,
    addCustomTracks,
    deleteCustomTrack,
    clearCustomTracks,
  ]);

  return (
    <AudioPlayerContext.Provider value={contextValue}>
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
