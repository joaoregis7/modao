import React from 'react';
import { X, Play, Music, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    isQueueOpen,
    closeQueue,
    playTrack,
  } = useAudioPlayer();

  if (!isQueueOpen) return null;

  return (
    <div
      onClick={closeQueue}
      className="fixed inset-0 z-[60] flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#1B1B1B] h-full flex flex-col border-l border-[#2E2E2E] shadow-2xl animate-in slide-in-from-right duration-200 pb-safe"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-[#C98A2E]" />
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#FAF7F2]">
                Próximas músicas
              </h3>
              <p className="text-xs text-[#A7A7A7]">
                {queue.length} modões na fila
              </p>
            </div>
          </div>
          <button
            onClick={closeQueue}
            className="p-2 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#242424] transition"
            aria-label="Fechar fila"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of songs */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {queue.map((track, idx) => {
            const isCurrent = track.id === currentTrack?.id;
            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => playTrack(track, queue)}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition select-none ${
                  isCurrent
                    ? 'bg-[#242424] border border-[#C98A2E]/60 text-[#C98A2E]'
                    : 'hover:bg-[#242424]/60 text-[#FAF7F2]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-5 text-center text-xs font-semibold text-[#A7A7A7] shrink-0">
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-4 h-4 text-[#C98A2E] mx-auto animate-pulse" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#C98A2E]' : 'text-[#FAF7F2]'}`}>
                      {track.title}
                    </h5>
                    <p className="text-xs text-[#A7A7A7] truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-[#A7A7A7]">
                    {track.durationFormatted}
                  </span>
                  {isCurrent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C98A2E] text-black">
                      TOCANDO
                    </span>
                  ) : (
                    <button
                      className="p-1 text-[#A7A7A7] hover:text-[#FAF7F2]"
                      aria-label="Tocar esta faixa"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
