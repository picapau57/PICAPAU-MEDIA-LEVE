import React, { useState, useMemo } from "react";
import { PlaylistItem } from "../types";
import { VideoPlayer } from "./VideoPlayer";
import { Search, Heart, Tv, Radio, Sparkles, Filter } from "lucide-react";

interface ChannelGridProps {
  channels: PlaylistItem[];
  categories: string[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  categories,
  favorites,
  toggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<PlaylistItem | null>(
    channels.length > 0 ? channels[0] : null
  );

  // Filtered Channels
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const matchesCat =
        selectedCategory === "TODOS" ||
        (selectedCategory === "FAVORITOS" && favorites.includes(ch.id)) ||
        ch.group === selectedCategory;

      const matchesSearch =
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.group.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [channels, selectedCategory, searchQuery, favorites]);

  // Handle Channel Navigation (Next/Prev channel for TV remote)
  const currentIdx = filteredChannels.findIndex((c) => c.id === selectedChannel?.id);

  const handleNextChannel = () => {
    if (filteredChannels.length === 0) return;
    const nextIdx = (currentIdx + 1) % filteredChannels.length;
    setSelectedChannel(filteredChannels[nextIdx]);
  };

  const handlePrevChannel = () => {
    if (filteredChannels.length === 0) return;
    const prevIdx = (currentIdx - 1 + filteredChannels.length) % filteredChannels.length;
    setSelectedChannel(filteredChannels[prevIdx]);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Active Video Player Area */}
      {selectedChannel ? (
        <div className="w-full">
          <VideoPlayer
            url={selectedChannel.url}
            title={selectedChannel.name}
            logo={selectedChannel.logo}
            autoPlay={true}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-[#1A1A1F] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-gray-400">
          <Tv className="w-12 h-12 mb-2 text-gray-600 animate-pulse" />
          <p className="text-sm font-semibold">Nenhum canal selecionado</p>
        </div>
      )}

      {/* Categories & Channels Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Categories List */}
        <div className="bg-[#0A0A0C] rounded-2xl p-4 border border-white/5 flex flex-col space-y-2 max-h-[500px] overflow-y-auto">
          <div className="flex items-center space-x-2 text-orange-400 font-mono text-xs uppercase px-2 py-1.5 border-b border-white/5 tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Categorias ({categories.length})</span>
          </div>

          <button
            onClick={() => setSelectedCategory("TODOS")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              selectedCategory === "TODOS"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <span>📺 TODOS OS CANAIS</span>
            <span className="text-[10px] font-mono opacity-80">{channels.length}</span>
          </button>

          <button
            onClick={() => setSelectedCategory("FAVORITOS")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              selectedCategory === "FAVORITOS"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
              <span>CANAIS FAVORITOS</span>
            </span>
            <span className="text-[10px] font-mono opacity-80">{favorites.length}</span>
          </button>

          {categories.map((cat) => {
            const count = channels.filter((c) => c.group === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between truncate ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className="text-[10px] font-mono opacity-75 ml-2">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right Main Grid: Channels List */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          {/* Search & Stats Bar */}
          <div className="flex items-center justify-between gap-4 bg-[#1A1A1F] p-3 rounded-2xl border border-white/10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar canal por nome ou categoria..."
                className="w-full bg-[#0F0F12] text-white pl-10 pr-4 py-2 rounded-xl text-xs border border-white/10 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div className="text-xs text-gray-400 font-mono px-2 shrink-0">
              <span className="text-orange-400 font-bold">{filteredChannels.length}</span> canais
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto p-1">
            {filteredChannels.length > 0 ? (
              filteredChannels.map((ch, idx) => {
                const isSelected = selectedChannel?.id === ch.id;
                const isFav = favorites.includes(ch.id);

                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch)}
                    className={`relative group rounded-xl p-3 cursor-pointer transition-all border flex flex-col items-center justify-between text-center select-none ${
                      isSelected
                        ? "bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/40 scale-[1.02] shadow-xl"
                        : "bg-[#1A1A1F] hover:bg-white/10 border-white/5 hover:border-white/15"
                    }`}
                  >
                    {/* Favorite Star Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(ch.id);
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 transition-colors z-10"
                      title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? "fill-red-500 text-red-500" : "hover:text-red-400"
                        }`}
                      />
                    </button>

                    {/* Live Indicator / Channel Index */}
                    <span className="absolute top-2 left-2 flex items-center space-x-1 text-[9px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded uppercase">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      <span>{idx + 1}</span>
                    </span>

                    {/* Logo Image */}
                    <div className="w-16 h-16 my-2 flex items-center justify-center p-1.5 bg-[#0F0F12] rounded-lg border border-white/5">
                      {ch.logo ? (
                        <img
                          src={ch.logo}
                          alt={ch.name}
                          className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Tv className="w-8 h-8 text-orange-500/50" />
                      )}
                    </div>

                    {/* Channel Title */}
                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-orange-400 transition-colors w-full">
                      {ch.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono truncate w-full mt-0.5">
                      {ch.group}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 bg-[#1A1A1F] rounded-2xl border border-white/5">
                <p className="text-sm font-medium">Nenhum canal encontrado nesta categoria.</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Tente limpar a busca ou selecionar outra categoria no menu ao lado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
