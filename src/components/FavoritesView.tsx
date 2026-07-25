import React from "react";
import { ParsedM3U, PlaylistItem, SeriesGroup } from "../types";
import { Heart, Tv, Film, Clapperboard, Play, Trash2 } from "lucide-react";

interface FavoritesViewProps {
  content: ParsedM3U | null;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onSelectChannel: (channel: PlaylistItem) => void;
  onSelectMovie: (movie: PlaylistItem) => void;
  onSelectSeries: (series: SeriesGroup) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  content,
  favorites,
  toggleFavorite,
  onSelectChannel,
  onSelectMovie,
  onSelectSeries,
}) => {
  if (!content) return null;

  const favChannels = content.channels.filter((c) => favorites.includes(c.id));
  const favMovies = content.movies.filter((m) => favorites.includes(m.id));
  const favSeries = content.series.filter((s) => favorites.includes(s.id));

  const totalFavs = favChannels.length + favMovies.length + favSeries.length;

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3 bg-[#1A1A1F] p-4 md:p-5 rounded-2xl border border-white/10">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-bold">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight font-mono">Meus Conteúdos Favoritos</h2>
          <p className="text-xs text-gray-400">Total de {totalFavs} itens favoritados</p>
        </div>
      </div>

      {totalFavs === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-[#1A1A1F] rounded-2xl border border-white/5 space-y-2">
          <Heart className="w-12 h-12 mx-auto text-gray-600" />
          <p className="text-sm font-semibold text-white">Sua lista de favoritos está vazia</p>
          <p className="text-xs text-gray-500">
            Clique no ícone de coração nos canais, filmes e séries para guardar aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {favChannels.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-2">
                <Tv className="w-4 h-4" />
                <span>Canais Favoritos ({favChannels.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {favChannels.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => onSelectChannel(ch)}
                    className="relative group bg-[#1A1A1F] hover:bg-white/10 p-3.5 rounded-xl border border-white/5 hover:border-orange-500/50 cursor-pointer flex flex-col items-center text-center space-y-2 transition-all"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(ch.id);
                      }}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

          {favMovies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-2">
                <Film className="w-4 h-4" />
                <span>Filmes Favoritos ({favMovies.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {favMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => onSelectMovie(movie)}
                    className="relative bg-[#1A1A1F] hover:bg-white/10 rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/50 cursor-pointer flex flex-col transition-all"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movie.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full text-red-500 hover:text-white z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
        </div>
      )}
    </div>
  );
};
