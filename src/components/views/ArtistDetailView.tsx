import React from 'react';
import { ArrowLeft, Play, Shuffle, Mic2 } from 'lucide-react';
import { ViewState } from '../../types';
import { ARTISTS } from '../../data/artists';
import { TRACKS } from '../../data/tracks';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { TrackListItem } from '../common/TrackListItem';

interface ArtistDetailViewProps {
  artistId: string;
  onNavigate: (view: ViewState) => void;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({ artistId, onNavigate }) => {
  const { playAll, allTracks } = useAudioPlayer();

  const artist = ARTISTS.find(a => a.id === artistId) || ARTISTS[0];
  const primaryName = artist.name.split('&')[0].trim().toLowerCase();
  const artistTracks = allTracks.filter(t => 
    t.artistId === artist.id || 
    artist.trackIds.includes(t.id) ||
    t.artist.toLowerCase().includes(primaryName)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Back button */}
      <button
        onClick={() => onNavigate({ type: 'home' })}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#A7A7A7] hover:text-[#FAF7F2] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao início</span>
      </button>

      {/* Artist Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#242424] to-[#121212] border border-[#2A2A2A] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shrink-0 shadow-2xl border-4 border-[#3A3A3A]">
          <img
            src={artist.photoUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C98A2E]/20 text-[#C98A2E] text-xs font-bold uppercase tracking-wider">
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lendas do Sertanejo</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-4xl text-[#FAF7F2]">
            {artist.name}
          </h1>

          <p className="text-sm font-semibold text-[#C98A2E]">
            {artist.role}
          </p>

          <p className="text-xs sm:text-sm text-[#A7A7A7] max-w-xl leading-relaxed">
            {artist.bio}
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => playAll(artistTracks, false)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-extrabold text-sm sm:text-base shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Tocar Tudo</span>
            </button>

            <button
              onClick={() => playAll(artistTracks, true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] text-[#FAF7F2] font-semibold text-sm active:scale-95 transition"
            >
              <Shuffle className="w-4 h-4 text-[#C98A2E]" />
              <span>Aleatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="space-y-2">
        <h3 className="font-heading font-bold text-lg text-[#FAF7F2] px-1 mb-2">
          Músicas do Artista ({artistTracks.length})
        </h3>
        {artistTracks.map((track, idx) => (
          <TrackListItem
            key={track.id}
            track={track}
            index={idx}
            showIndex
            playlistContext={artistTracks}
          />
        ))}
      </div>
    </div>
  );
};
