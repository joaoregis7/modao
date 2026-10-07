import React from 'react';
import { Heart, Play, Shuffle, Music, Compass } from 'lucide-react';
import { ViewState } from '../../types';
import { TRACKS } from '../../data/tracks';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { TrackListItem } from '../common/TrackListItem';

interface FavoritesViewProps {
  onNavigate: (view: ViewState) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onNavigate }) => {
  const { favorites, playAll, allTracks } = useAudioPlayer();

  const favoriteTracks = allTracks.filter(t => favorites.includes(t.id));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-[#996016] flex items-center justify-center shadow-lg text-white">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#FAF7F2]">
              Meus Modões ❤️
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A7A7]">
              {favoriteTracks.length === 1
                ? '1 música favorita salva no seu celular'
                : `${favoriteTracks.length} músicas favoritas salvas no seu celular`}
            </p>
          </div>
        </div>

        {favoriteTracks.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => playAll(favoriteTracks, false)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Tocar Tudo</span>
            </button>

            <button
              onClick={() => playAll(favoriteTracks, true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] text-[#FAF7F2] font-semibold text-sm active:scale-95 transition"
            >
              <Shuffle className="w-4 h-4 text-[#C98A2E]" />
              <span>Aleatório</span>
            </button>
          </div>
        )}
      </div>

      {/* List or Empty State */}
      {favoriteTracks.length === 0 ? (
        <div className="py-20 px-6 text-center bg-[#1B1B1B] rounded-3xl border border-[#242424] max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#242424] mx-auto flex items-center justify-center text-red-400 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-black text-xl text-[#FAF7F2]">
            Você ainda não favoritou nenhum modão
          </h3>
          <p className="text-xs sm:text-sm text-[#A7A7A7] mt-2 mb-6 leading-relaxed">
            Para salvar suas músicas preferidas sem precisar de cadastro ou conta, basta tocar no ícone de <strong className="text-red-400">coração</strong> ao lado de qualquer música.
          </p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C98A2E] text-black font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Explorar músicas agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {favoriteTracks.map((track, idx) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={idx}
              showIndex
              playlistContext={favoriteTracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};
