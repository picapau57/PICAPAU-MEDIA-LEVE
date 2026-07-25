import React, { useState, useMemo } from "react";
import { ParsedM3U, PlaylistItem, SeriesGroup } from "../types";
import { Search, Tv, Film, Clapperboard, Play, Star, Heart } from "lucide-react";

interface SearchViewProps {
  content: ParsedM3U | null;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onSelectChannel: (channel: PlaylistItem) => void;
  onSelectMovie: (movie: PlaylistItem) => void;
  onSelectSeries: (series: SeriesGroup) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  content,
  favorites,
  toggleFavorite,
  onSelectChannel,
  onSelectMovie,
  onSelectSeries,
}) => {
  const [query, setQuery] = useState<string>("");

  const searchResults = useMemo(() => {
    if (!content || !query.trim()) {
      return { channels: [], movies: [], series: [] };
    }

    const q = query.toLowerCase();

    const matchedChannels = content.channels.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );

    const matchedMovies = content.movies.filter(
      (m) => m.name.toLowerCase().includes(q) || m.group.toLowerCase().includes(q)
    );

    const matchedSeries = content.series.filter(
      (s) => s.name.toLowerCase().includes(q) || s.group.toLowerCase().includes(q)
    );

    return {
      channels: matchedChannels.slice(0, 15),
      movies: matchedMovies.slice(0, 15),
      series: matchedSeries.slice(0, 15),
    };
  }, [content, query]);

  return (
    <div className="space-y-6 text-left">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-orange-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar canais, filmes, futebol, séries..."
          className="w-full bg-[#1A1A1F] text-white pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 focus:border-orange-500/50 font-semibold text-sm shadow-xl focus:outline-none transition-colors"
          autoFocus
        />
      </div>

      {!query.trim() ? (
        <div className="text-center py-16 text-gray-500 space-y-2">
          <Search className="w-12 h-12 mx-auto text-gray-600 animate-pulse" />
          <p className="text-sm font-semibold text-white">Digite algo para buscar em todo o catálogo IPTV</p>
          <p className="text-xs text-gray-500 font-mono">Busca rápida em canais ao vivo, filmes 4K e séries completas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Matched Channels */}
          {searchResults.channels.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-2">
                <Tv className="w-4 h-4" />
                <span>Canais ao Vivo ({searchResults.channels.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResults.channels.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => onSelectChannel(ch)}
                    className="bg-[#1A1A1F] hover:bg-white/10 p-3.5 rounded-xl border border-white/5 hover:border-orange-500/50 cursor-pointer flex flex-col items-center text-center space-y-2 transition-all"
                  >
                    <div className="w-12 h-12 flex items-center justify-center p-1 bg-[#0F0F12] rounded-lg border border-white/5">
                      {ch.logo ? (
                        <img src={ch.logo} alt={ch.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Tv className="w-6 h-6 text-orange-400" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-white line-clamp-1">{ch.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Movies */}
          {searchResults.movies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-2">
                <Film className="w-4 h-4" />
                <span>Filmes ({searchResults.movies.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResults.movies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => onSelectMovie(movie)}
                    className="bg-[#1A1A1F] hover:bg-white/10 rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 cursor-pointer flex flex-col transition-all"
                  >
                    <div className="aspect-[2/3] w-full bg-[#0F0F12]">
                      {movie.logo && <img src={movie.logo} alt={movie.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-white line-clamp-1">{movie.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Series */}
          {searchResults.series.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-2">
                <Clapperboard className="w-4 h-4" />
                <span>Séries ({searchResults.series.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResults.series.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onSelectSeries(s)}
                    className="bg-[#1A1A1F] hover:bg-white/10 rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 cursor-pointer flex flex-col transition-all"
                  >
                    <div className="aspect-[2/3] w-full bg-[#0F0F12]">
                      {s.logo && <img src={s.logo} alt={s.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-white line-clamp-1">{s.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
