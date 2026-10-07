import React, { useState, useMemo } from 'react';
import { Search, X, Music, User, Radio, ListMusic } from 'lucide-react';
import { ViewState } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { ARTISTS } from '../../data/artists';
import { STATIONS } from '../../data/stations';
import { PLAYLISTS } from '../../data/playlists';
import { TrackListItem } from '../common/TrackListItem';
import { matchesSearchQuery, normalizeText } from '../../services/searchMatcher';

interface SearchViewProps {
  onNavigate: (view: ViewState) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onNavigate }) => {
  const { allTracks } = useAudioPlayer();
  const [query, setQuery] = useState('');

  const quickTags = [
    'Tião Carreiro',
    'Milionário & José Rico',
    'Moda de Viola',
    'Boteco',
    'Estrada',
    'Trio Parada Dura',
    'Boate Azul',
  ];

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return {
        tracks: [],
        artists: [],
        stations: [],
        playlists: [],
      };
    }

    const normQ = normalizeText(q);

    const matchedTracks = allTracks.filter(t => matchesSearchQuery(t, q));

    const matchedArtists = ARTISTS.filter(a => {
      const normName = normalizeText(a.name);
      const normRole = normalizeText(a.role);
      return normName.includes(normQ) || normRole.includes(normQ);
    });

    const matchedStations = STATIONS.filter(s => {
      const normName = normalizeText(s.name);
      const normDesc = normalizeText(s.description);
      return normName.includes(normQ) || normDesc.includes(normQ);
    });

    const matchedPlaylists = PLAYLISTS.filter(p => {
      const normTitle = normalizeText(p.title);
      const normDesc = normalizeText(p.description);
      return normTitle.includes(normQ) || normDesc.includes(normQ);
    });

    return {
      tracks: matchedTracks,
      artists: matchedArtists,
      stations: matchedStations,
      playlists: matchedPlaylists,
    };
  }, [query, allTracks]);

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.stations.length > 0 ||
    results.playlists.length > 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Search Input */}
      <div>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#FAF7F2] mb-1">
          Buscar no Rádio Modão
        </h2>
        <p className="text-xs sm:text-sm text-[#A7A7A7]">
          Encontre suas músicas, cantores, estações e modas preferidas
        </p>
      </div>

      {/* Big Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#C98A2E]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar música ou artista..."
          autoFocus
          className="w-full bg-[#1B1B1B] border-2 border-[#2E2E2E] focus:border-[#C98A2E] rounded-2xl py-4 pl-14 pr-12 text-[#FAF7F2] placeholder-[#777777] text-base sm:text-lg font-medium transition focus:outline-none shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#A7A7A7] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
            aria-label="Limpar busca"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggested Quick Tags */}
      {!query && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A7A7A7]">
            Sugestões para ouvir:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickTags.map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-2 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] hover:border-[#C98A2E] text-xs sm:text-sm font-semibold text-[#FAF7F2] transition active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Display */}
      {query && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {!hasResults ? (
            <div className="py-16 text-center bg-[#1B1B1B] rounded-2xl border border-[#2A2A2A]">
              <span className="text-4xl">📻</span>
              <h3 className="font-heading font-bold text-lg text-[#FAF7F2] mt-3">
                Nenhum resultado para "{query}"
              </h3>
              <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1 max-w-sm mx-auto">
                Tente procurar por nomes como Estrada da Vida, Tião Carreiro, Telefone Mudo ou Modão Raiz.
              </p>
            </div>
          ) : (
            <>
              {/* Songs Results */}
              {results.tracks.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="w-4 h-4 text-[#C98A2E]" />
                    <h3 className="font-heading font-bold text-lg text-[#FAF7F2]">
                      Músicas ({results.tracks.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {results.tracks.map((track) => (
                      <TrackListItem
                        key={track.id}
                        track={track}
                        playlistContext={results.tracks}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Artists Results */}
              {results.artists.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#C98A2E]" />
                    <h3 className="font-heading font-bold text-lg text-[#FAF7F2]">
                      Artistas ({results.artists.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {results.artists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => onNavigate({ type: 'artist', artistId: artist.id })}
                        className="p-3 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#2E2E2E] cursor-pointer flex items-center gap-3 transition"
                      >
                        <img
                          src={artist.photoUrl}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#FAF7F2] truncate">
                            {artist.name}
                          </h4>
                          <p className="text-xs text-[#A7A7A7] truncate">
                            {artist.origin}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Stations Results */}
              {results.stations.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-[#C98A2E]" />
                    <h3 className="font-heading font-bold text-lg text-[#FAF7F2]">
                      Estações ({results.stations.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.stations.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => onNavigate({ type: 'station', stationId: st.id })}
                        className="p-3.5 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#2E2E2E] cursor-pointer flex items-center gap-3.5 transition"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#C98A2E]/20 flex items-center justify-center text-[#C98A2E] shrink-0">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#FAF7F2] truncate">
                            {st.name}
                          </h4>
                          <p className="text-xs text-[#A7A7A7] truncate">
                            {st.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Playlists Results */}
              {results.playlists.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <ListMusic className="w-4 h-4 text-[#C98A2E]" />
                    <h3 className="font-heading font-bold text-lg text-[#FAF7F2]">
                      Playlists ({results.playlists.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => onNavigate({ type: 'playlist', playlistId: pl.id })}
                        className="p-3 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#2E2E2E] cursor-pointer flex items-center gap-3.5 transition"
                      >
                        <img
                          src={pl.coverUrl}
                          alt={pl.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#FAF7F2] truncate">
                            {pl.title}
                          </h4>
                          <p className="text-xs text-[#A7A7A7] truncate">
                            {pl.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
