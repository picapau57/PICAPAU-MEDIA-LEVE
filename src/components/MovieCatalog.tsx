import React, { useState, useMemo } from "react";
import { PlaylistItem } from "../types";
import { VideoPlayer } from "./VideoPlayer";
import { Search, Film, Play, Star, Heart, X, Info, Sparkles } from "lucide-react";

interface MovieCatalogProps {
  movies: PlaylistItem[];
  categories: string[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const MovieCatalog: React.FC<MovieCatalogProps> = ({
  movies,
  categories,
  favorites,
  toggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeMovie, setActiveMovie] = useState<PlaylistItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesCat =
        selectedCategory === "TODOS" ||
        (selectedCategory === "FAVORITOS" && favorites.includes(m.id)) ||
        m.group === selectedCategory;

      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.group.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [movies, selectedCategory, searchQuery, favorites]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Category Tabs & Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1A1A1F] p-4 rounded-2xl border border-white/10">
        {/* Category Pills Slider */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("TODOS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === "TODOS"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20"
                : "bg-[#0F0F12] text-gray-300 hover:bg-white/5 border border-white/5"
            }`}
          >
            🎬 Todos os Filmes ({movies.length})
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
            <span>Favoritos ({favorites.length})</span>
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

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar filme..."
            className="w-full bg-[#0F0F12] text-white pl-10 pr-4 py-2 rounded-xl text-xs border border-white/10 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      {/* Movies Poster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => {
            const isFav = favorites.includes(movie.id);

            return (
              <div
                key={movie.id}
                onClick={() => {
                  setActiveMovie(movie);
                  setIsPlaying(false);
                }}
                className="group relative bg-[#1A1A1F] rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-950/30 flex flex-col select-none"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full bg-[#0F0F12] overflow-hidden flex items-center justify-center">
                  {movie.logo ? (
                    <img
                      src={movie.logo}
                      alt={movie.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Film className="w-12 h-12 text-orange-500/40 mb-2" />
                      <p className="text-[10px] text-gray-500 font-medium">{movie.name}</p>
                    </div>
                  )}

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Assistir</span>
                  </div>

                  {/* Favorite button badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(movie.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-gray-400 hover:text-red-400 z-10 backdrop-blur-sm"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                  </button>

                  {/* HD / 4K Badge */}
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-orange-500 text-black text-[9px] font-mono font-bold rounded uppercase tracking-wider">
                    HD
                  </span>
                </div>

                {/* Movie Title & Info */}
                <div className="p-3 bg-[#1A1A1F] flex-1 flex flex-col justify-between border-t border-white/5">
                  <h3 className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {movie.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 font-mono">
                    <span className="truncate">{movie.group}</span>
                    <span className="flex items-center text-orange-400 font-bold">
                      <Star className="w-3 h-3 fill-current mr-0.5" /> 8.5
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-400 bg-[#1A1A1F] rounded-2xl border border-white/5">
            <Film className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium">Nenhum filme encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      {/* Movie Details Modal / Direct Player */}
      {activeMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => {
                setActiveMovie(null);
                setIsPlaying(false);
              }}
              className="absolute top-4 right-4 z-30 p-2 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {isPlaying ? (
              <div className="w-full h-full min-h-[380px]">
                <VideoPlayer
                  url={activeMovie.url}
                  title={activeMovie.name}
                  logo={activeMovie.logo}
                  autoPlay={true}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 overflow-y-auto">
                {/* Poster Left */}
                <div className="relative rounded-xl overflow-hidden bg-[#1A1A1F] aspect-[2/3] shadow-2xl border border-white/10">
                  {activeMovie.logo ? (
                    <img
                      src={activeMovie.logo}
                      alt={activeMovie.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <Film className="w-16 h-16 text-orange-500/40" />
                    </div>
                  )}
                </div>

                {/* Details Right */}
                <div className="md:col-span-2 flex flex-col justify-between space-y-4 text-left">
                  <div>
                    <div className="flex items-center space-x-2 text-xs text-orange-400 font-mono font-bold uppercase mb-1">
                      <span>{activeMovie.group}</span>
                      <span>•</span>
                      <span>4K Ultra HD</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {activeMovie.name}
                    </h2>

                    <div className="flex items-center space-x-4 text-xs text-gray-400 my-3 font-mono">
                      <span className="flex items-center text-orange-400 font-bold">
                        <Star className="w-4 h-4 fill-current mr-1 text-orange-400" /> 8.8 / 10
                      </span>
                      <span>2024</span>
                      <span className="px-2 py-0.5 bg-[#1A1A1F] rounded border border-white/10 font-medium text-gray-300">
                        Dublado / Legendado
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed font-normal bg-[#1A1A1F] p-4 rounded-xl border border-white/5">
                      {activeMovie.description ||
                        "Assista a este filme incrível no PICAPAU MEDIA LEVE. Qualidade de áudio e vídeo otimizados para Smart TV, TV Box e dispositivos móveis."}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="flex-1 py-3.5 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-900/30 flex items-center justify-center space-x-2 transition-transform active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>ASSISTIR AGORA</span>
                    </button>

                    <button
                      onClick={() => toggleFavorite(activeMovie.id)}
                      className="p-3.5 bg-[#1A1A1F] hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
                      title="Favoritar"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(activeMovie.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
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
