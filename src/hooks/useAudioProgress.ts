import { useState, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';

export interface AudioProgress {
  currentTime: number;
  duration: number;
}

/**
 * Hook de alta performance para progresso de áudio.
 * Inscreve-se diretamente nos eventos do audioEngine sem disparar
 * re-renderizações no contexto global do applet ou na lista de faixas.
 */
export function useAudioProgress(): AudioProgress {
  const [progress, setProgress] = useState<AudioProgress>(() => ({
    currentTime: audioEngine.getCurrentTime(),
    duration: audioEngine.getDuration() || 200,
  }));

  useEffect(() => {
    // Sincroniza imediatamente o estado atual
    setProgress({
      currentTime: audioEngine.getCurrentTime(),
      duration: audioEngine.getDuration() || 200,
    });

    const unsubscribe = audioEngine.onTimeUpdate((time, dur) => {
      setProgress({
        currentTime: time,
        duration: dur > 0 ? dur : 200,
      });
    });

    return unsubscribe;
  }, []);

  return progress;
}
