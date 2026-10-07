import React, { useState } from 'react';
import { X, Plus, Search, Check, Music2, ListPlus } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { StorageService, CustomPlaylist } from '../../services/storage';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newPlaylist: CustomPlaylist) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { allTracks } = useAudioPlayer();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const filteredTracks = allTracks.filter(t => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  const toggleTrack = (id: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedTrackIds(allTracks.map(t => t.id));
  };

  const clearAll = () => {
    setSelectedTrackIds([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const firstTrack = allTracks.find(t => selectedTrackIds.includes(t.id));
    const fallbackTrack = allTracks[0];
    const newPlaylist: CustomPlaylist = {
      id: `custom-pl-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Minha seleção personalizada de modões.',
      badge: 'Minha Playlist',
      trackIds: selectedTrackIds.length > 0 ? selectedTrackIds : [fallbackTrack.id],
      coverUrl: firstTrack?.coverUrl || fallbackTrack.coverUrl,
      createdAt: Date.now(),
    };

    StorageService.saveCustomPlaylist(newPlaylist);
    onCreated(newPlaylist);
    onClose();
    setTitle('');
    setDescription('');
    setSelectedTrackIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1B1B1B] border border-[#2E2E2E] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C98A2E]/20 flex items-center justify-center text-[#C98A2E]">
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[#FAF7F2]">
                Criar Nova Playlist
              </h3>
              <p className="text-xs text-[#A7A7A7]">
                Selecione os modões do seu gosto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A7A7A7] hover:text-[#FAF7F2] rounded-full hover:bg-[#242424] transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Playlist Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FAF7F2] mb-1.5">
                Nome da Playlist <span className="text-[#C98A2E]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Modão de Churrasco, Estrada Sem Fim..."
                required
                className="w-full bg-[#242424] border border-[#3A3A3A] focus:border-[#C98A2E] rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-[#FAF7F2] placeholder-[#666666] focus:outline-none transition"
              />
            </div>

            {/* Playlist Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A7A7A7] mb-1.5">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: As melhores modas para ouvir com os amigos..."
                className="w-full bg-[#242424] border border-[#3A3A3A] focus:border-[#C98A2E] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#FAF7F2] placeholder-[#666666] focus:outline-none transition"
              />
            </div>

            {/* Song Selector Header */}
            <div className="pt-2 border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">
                  Músicas ({selectedTrackIds.length} selecionadas)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[#C98A2E] hover:underline"
                  >
                    Marcar todas
                  </button>
                  <span className="text-[#444]">•</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[#A7A7A7] hover:underline"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {/* Quick search inside song selector */}
              <div className="relative mb-2.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C98A2E]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filtrar músicas do catálogo..."
                  className="w-full bg-[#242424] border border-[#333333] focus:border-[#C98A2E] rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-[#FAF7F2] placeholder-[#666666] focus:outline-none"
                />
              </div>

              {/* Songs List with Checkboxes */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredTracks.map(track => {
                  const isChecked = selectedTrackIds.includes(track.id);
                  return (
                    <div
                      key={track.id}
                      onClick={() => toggleTrack(track.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition select-none border ${
                        isChecked
                          ? 'bg-[#242424] border-[#C98A2E]/60 text-[#FAF7F2]'
                          : 'bg-[#181818]/60 hover:bg-[#222222] border-transparent text-[#A7A7A7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                            isChecked
                              ? 'bg-[#C98A2E] border-[#C98A2E] text-black font-bold'
                              : 'border-[#555555] bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${isChecked ? 'text-[#FAF7F2]' : 'text-[#CCC]'}`}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-[#888] truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-[#777] shrink-0 ml-2">
                        {track.durationFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-[#2A2A2A] bg-[#161616] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#3A3A3A] hover:bg-[#242424] text-xs sm:text-sm font-semibold text-[#A7A7A7] hover:text-[#FAF7F2] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C98A2E] to-[#D97706] text-black font-heading font-black text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
