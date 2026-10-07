import React from 'react';
import { ArrowLeft, Play, Shuffle, Radio } from 'lucide-react';
import { ViewState } from '../../types';
import { STATIONS } from '../../data/stations';
import { TRACKS } from '../../data/tracks';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { TrackListItem } from '../common/TrackListItem';

interface StationDetailViewProps {
  stationId: string;
  onNavigate: (view: ViewState) => void;
}

export const StationDetailView: React.FC<StationDetailViewProps> = ({ stationId, onNavigate }) => {
  const { playAll, allTracks } = useAudioPlayer();

  const station = STATIONS.find(s => s.id === stationId) || STATIONS[0];
  const stationTracks = allTracks.filter(t => t.stationId === station.id || station.trackIds.includes(t.id));

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

      {/* Station Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1F4D3A]/50 via-[#1B1B1B] to-[#121212] border border-[#2A2A2A] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shrink-0 shadow-2xl border-2 border-[#3A3A3A]">
          <img
            src={station.coverUrl}
            alt={station.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C98A2E]/20 text-[#C98A2E] text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            <span>Estação de Modão</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-4xl text-[#FAF7F2]">
            {station.name}
          </h1>

          <p className="text-sm sm:text-base text-[#A7A7A7] max-w-xl leading-relaxed">
            {station.description}
          </p>

          <p className="text-xs font-semibold text-[#FAF7F2]/80">
            {stationTracks.length} modões selecionados
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => playAll(stationTracks, false)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-extrabold text-sm sm:text-base shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Tocar Tudo</span>
            </button>

            <button
              onClick={() => playAll(stationTracks, true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] text-[#FAF7F2] font-semibold text-sm active:scale-95 transition"
            >
              <Shuffle className="w-4 h-4 text-[#C98A2E]" />
              <span>Aleatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-2">
        <h3 className="font-heading font-bold text-lg text-[#FAF7F2] px-1 mb-2">
          Músicas da Estação
        </h3>
        {stationTracks.map((track, idx) => (
          <TrackListItem
            key={track.id}
            track={track}
            index={idx}
            showIndex
            playlistContext={stationTracks}
          />
        ))}
      </div>
    </div>
  );
};
