import React, { useState, useMemo } from "react";
import { SeriesEpisode, SeriesGroup } from "../types";
import { VideoPlayer } from "./VideoPlayer";
import { Search, Clapperboard, Play, Star, Heart, X, ChevronRight, Layers } from "lucide-react";

interface SeriesCatalogProps {
  series: SeriesGroup[];
  categories: string[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const SeriesCatalog: React.FC<SeriesCatalogProps> = ({
  series,
  categories,
  favorites,
  toggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSeries, setActiveSeries] = useState<SeriesGroup | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<SeriesEpisode | null>(null);

  // Filter series
  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      const matchesCat =
        selectedCategory === "TODOS" ||
        (selectedCategory === "FAVORITOS" && favorites.includes(s.id)) ||
        s.group === selectedCategory;

      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.group.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [series, selectedCategory, searchQuery, favorites]);

  // Episodes for active season
  const seasonEpisodes = useMemo(() => {
    if (!activeSeries) return [];
    return activeSeries.episodes.filter((ep) => ep.seasonNumber === selectedSeason);
  }, [activeSeries, selectedSeason]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1A1F] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("TODOS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === "TODOS"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                : "bg-[#0F0F12] text-gray-300 hover:bg-white/5 border border-white/5"
            }`}
          >
            📺 Todas as Séries ({series.length})
          </button>

          <button
            onClick={() => setSelectedCategory("FAVORITOS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              selectedCategory === "FAVORITOS"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                : "bg-[#0F0F12] text-gray-300 hover:bg-white/5 border border-white/5"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
            <span>Favoritas ({favorites.length})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                  : "bg-[#0F0F12] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar série..."
            className="w-full bg-[#0F0F12] text-white pl-10 pr-4 py-2 rounded-xl text-xs border border-white/10 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredSeries.length > 0 ? (
          filteredSeries.map((s) => {
            const isFav = favorites.includes(s.id);

            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSeries(s);
                  setSelectedSeason(1);
                  setActiveEpisode(null);
                }}
                className="group relative bg-[#1A1A1F] rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-950/30 flex flex-col select-none"
              >
                <div className="relative aspect-[2/3] w-full bg-[#0F0F12] overflow-hidden flex items-center justify-center">
                  {s.logo ? (
                    <img
                      src={s.logo}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Clapperboard className="w-12 h-12 text-orange-500/40 mb-2" />
                      <p className="text-[10px] text-gray-500 font-medium">{s.name}</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Ver Episódios</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(s.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-gray-400 hover:text-red-400 z-10 backdrop-blur-sm"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                  </button>

                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-[#0F0F12] text-orange-400 border border-orange-500/20 text-[9px] font-mono font-bold rounded">
                    {s.episodes.length} Episódios
                  </span>
                </div>

                <div className="p-3 bg-[#1A1A1F] flex-1 flex flex-col justify-between border-t border-white/5">
                  <h3 className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {s.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 font-mono">
                    <span className="truncate">{s.group}</span>
                    <span className="flex items-center text-orange-400 font-bold">
                      <Layers className="w-3 h-3 mr-0.5" /> {s.seasonsCount} Temp.
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-400 bg-[#1A1A1F] rounded-2xl border border-white/5">
            <Clapperboard className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium">Nenhuma série encontrada nesta categoria.</p>
          </div>
        )}
      </div>

      {/* Series Details Modal & Seasons / Episodes Player */}
      {activeSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => {
                setActiveSeries(null);
                setActiveEpisode(null);
              }}
              className="absolute top-4 right-4 z-30 p-2 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Active Episode Player */}
            {activeEpisode ? (
              <div className="w-full flex flex-col">
                <div className="p-3.5 bg-[#0A0A0C] border-b border-white/5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setActiveEpisode(null)}
                      className="px-3.5 py-1.5 bg-[#1A1A1F] hover:bg-white/10 text-orange-400 font-bold rounded-lg border border-white/10"
                    >
                      ← Voltar aos Episódios
                    </button>
                    <span className="text-white font-bold">{activeSeries.name}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-orange-400">{activeEpisode.title}</span>
                  </div>
                </div>
                <div className="w-full min-h-[400px]">
                  <VideoPlayer
                    url={activeEpisode.url}
                    title={`${activeSeries.name} - ${activeEpisode.title}`}
                    logo={activeEpisode.logo || activeSeries.logo}
                    autoPlay={true}
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-32 md:w-40 rounded-xl overflow-hidden bg-[#1A1A1F] aspect-[2/3] shadow-xl border border-white/10 shrink-0">
                    {activeSeries.logo ? (
                      <img
                        src={activeSeries.logo}
                        alt={activeSeries.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Clapperboard className="w-10 h-10 text-orange-500/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-left">
                    <span className="text-xs text-orange-400 font-mono font-bold uppercase tracking-wider">{activeSeries.group}</span>
                    <h2 className="text-2xl font-bold text-white">{activeSeries.name}</h2>
                    <p className="text-xs text-gray-400 font-mono">
                      Total de {activeSeries.seasonsCount} Temporada(s) • {activeSeries.episodes.length} Episódios
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed bg-[#1A1A1F] p-3 rounded-xl border border-white/5">
                      Série completa em alta definição para assistir na TV Box ou Celular com carregamento ultra leve.
                    </p>
                  </div>
                </div>

                {/* Season Selector Tabs */}
                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Selecione a Temporada
                  </h3>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
                    {Array.from({ length: activeSeries.seasonsCount }, (_, i) => i + 1).map((seasonNum) => (
                      <button
                        key={seasonNum}
                        onClick={() => setSelectedSeason(seasonNum)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                          selectedSeason === seasonNum
                            ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                            : "bg-[#1A1A1F] hover:bg-white/5 text-gray-300 border border-white/5"
                        }`}
                      >
                        Temporada {seasonNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episode List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                    Episódios - Temporada {selectedSeason} ({seasonEpisodes.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {seasonEpisodes.map((ep) => (
                      <div
                        key={ep.id}
                        onClick={() => setActiveEpisode(ep)}
                        className="group flex items-center justify-between p-3.5 bg-[#1A1A1F] hover:bg-white/10 rounded-xl border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-500/10 group-hover:bg-orange-500 text-orange-400 group-hover:text-black flex items-center justify-center font-bold text-xs transition-colors shrink-0">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                              {ep.title}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              Episódio {ep.episodeNumber}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
