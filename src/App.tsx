import React, { useState, useEffect, useCallback } from "react";
import { AppConfig, ParsedM3U, PlaylistItem, SeriesGroup } from "./types";
import { Navbar } from "./components/Navbar";
import { ChannelGrid } from "./components/ChannelGrid";
import { MovieCatalog } from "./components/MovieCatalog";
import { SeriesCatalog } from "./components/SeriesCatalog";
import { AdminPanel } from "./components/AdminPanel";
import { FavoritesView } from "./components/FavoritesView";
import { SearchView } from "./components/SearchView";
import { LoginModal } from "./components/LoginModal";
import { TVRemoteGuide } from "./components/TVRemoteGuide";
import { AlertCircle, Megaphone, Radio, Tv } from "lucide-react";

const DEFAULT_FALLBACK_CONTENT: ParsedM3U = {
  totalCount: 10,
  channelsCount: 6,
  moviesCount: 3,
  seriesCount: 1,
  categories: {
    channels: ["CANAIS | TV ABERTA", "CANAIS | ESPORTES", "CANAIS | INFANTIL"],
    movies: ["FILMES | ANIMAÇÃO", "FILMES | FICÇÃO CIENTÍFICA", "FILMES | AVENTURA"],
    series: ["SERIES | ANIMAÇÃO"],
  },
  channels: [
    {
      id: "ch_sbt",
      name: "SBT Brasil HD",
      type: "live",
      group: "CANAIS | TV ABERTA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/SBT_logo.svg/320px-SBT_logo.svg.png",
      url: "https://sbt-live.akamaized.net/hls/live/2034176/sbt/master.m3u8",
    },
    {
      id: "ch_record",
      name: "Record TV HD",
      type: "live",
      group: "CANAIS | TV ABERTA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/RecordTV_logo.svg/320px-RecordTV_logo.svg.png",
      url: "https://0c239d3326eb.us-east-1.playback.live-video.net/api/video/v1/us-east-1.123281140920.channel.a177N5BwJ22X.m3u8",
    },
    {
      id: "ch_band",
      name: "Rede Bandeirantes (Band)",
      type: "live",
      group: "CANAIS | TV ABERTA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Band_Logo_2018.svg/320px-Band_Logo_2018.svg.png",
      url: "https://d2e1asnsl7d26a.cloudfront.net/out/v1/7888825efce64bb9b307040b28489a80/index.m3u8",
    },
    {
      id: "ch_caze",
      name: "Cazé TV Esportes Live",
      type: "live",
      group: "CANAIS | ESPORTES",
      logo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
      url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    },
    {
      id: "ch_espn",
      name: "ESPN Sports Highlight",
      type: "live",
      group: "CANAIS | ESPORTES",
      logo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    },
    {
      id: "ch_cartoon",
      name: "Desenhos 24 Horas",
      type: "live",
      group: "CANAIS | INFANTIL",
      logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ],
  movies: [
    {
      id: "mov_bbb",
      name: "Big Buck Bunny (4K Ultra HD)",
      type: "movie",
      group: "FILMES | ANIMAÇÃO",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/300px-Big_buck_bunny_poster_big.jpg",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      description: "Um coelho gigante e amigável busca paz na floresta contra animais travessos.",
      year: "2008",
      rating: "8.5",
    },
    {
      id: "mov_tos",
      name: "Tears of Steel (Sci-Fi)",
      type: "movie",
      group: "FILMES | FICÇÃO CIENTÍFICA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Tears_of_Steel_poster.jpg/300px-Tears_of_Steel_poster.jpg",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      description: "Um grupo de guerreiros futuristas luta para salvar Amsterdam de robôs gigantes.",
      year: "2012",
      rating: "8.0",
    },
    {
      id: "mov_sintel",
      name: "Sintel: O Dragão Perdido",
      type: "movie",
      group: "FILMES | AVENTURA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sintel_poster.jpg/300px-Sintel_poster.jpg",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      description: "Uma jovem solitária parte em uma jornada épica para encontrar seu filhote de dragão roubado.",
      year: "2010",
      rating: "8.9",
    },
  ],
  series: [
    {
      id: "ser_bunny",
      name: "Aventuras do Coelho",
      group: "SERIES | ANIMAÇÃO",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/300px-Big_buck_bunny_poster_big.jpg",
      seasonsCount: 2,
      episodes: [
        {
          id: "ep_s01e01",
          seasonNumber: 1,
          episodeNumber: 1,
          title: "S01E01 - O Começo",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
        {
          id: "ep_s01e02",
          seasonNumber: 1,
          episodeNumber: 2,
          title: "S01E02 - A Floresta Encantada",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        },
      ],
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "live" | "movies" | "series" | "favorites" | "search" | "admin"
  >("live");

  const [config, setConfig] = useState<AppConfig>({
    appName: "PICAPAU MEDIA LEVE",
    adminPin: "1234",
    downloaderCode: "792014",
    announcement: "Bem-vindo ao PICAPAU MEDIA LEVE! Sistema otimizado para TV Box, Smart TV e Celular.",
    allowGuestDemo: true,
    autoEnrichMetadata: true,
  });

  const [content, setContent] = useState<ParsedM3U | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    code: string;
    expiresAt: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("picapau_user");
      return saved ? JSON.parse(saved) : { name: "Usuário Demo", code: "888888", expiresAt: "2028-12-31" };
    } catch {
      return null;
    }
  });

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("picapau_favs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isRemoteGuideOpen, setIsRemoteGuideOpen] = useState<boolean>(false);

  // Fetch Config
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  // Fetch Content
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        if (data && data.channels) {
          setContent(data);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend content fetch error, using default sample content:", err);
    }
    setContent(DEFAULT_FALLBACK_CONTENT);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchContent();
  }, [fetchContent]);

  // Handle Favorites toggle
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("picapau_favs", JSON.stringify(updated));
      return updated;
    });
  };

  // Handle User Login / Logout
  const handleLoginSuccess = (user: { name: string; code: string; expiresAt: string }) => {
    setCurrentUser(user);
    localStorage.setItem("picapau_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("picapau_user");
  };

  // TV Remote Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Escape" || e.key === "Backspace") {
        if (isLoginOpen) setIsLoginOpen(false);
        if (isRemoteGuideOpen) setIsRemoteGuideOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginOpen, isRemoteGuideOpen]);

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white font-sans flex flex-col selection:bg-orange-500 selection:text-black antialiased">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appName={config.appName}
        downloaderCode={config.downloaderCode}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        toggleRemoteGuide={() => setIsRemoteGuideOpen(!isRemoteGuideOpen)}
      />

      {/* Announcement Banner */}
      {config.announcement && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 text-orange-400 py-2 px-4 text-xs font-mono font-medium flex items-center justify-center space-x-2">
          <Megaphone className="w-4 h-4 fill-current shrink-0 animate-pulse text-orange-400" />
          <span className="truncate">{config.announcement}</span>
        </div>
      )}

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h2 className="text-sm font-mono font-bold text-orange-400 uppercase tracking-widest animate-pulse">
                Sincronizando {config.appName}...
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">Carregando catálogo e listas de baixo consumo</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "live" && (
              <ChannelGrid
                channels={content?.channels || []}
                categories={content?.categories.channels || []}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {activeTab === "movies" && (
              <MovieCatalog
                movies={content?.movies || []}
                categories={content?.categories.movies || []}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {activeTab === "series" && (
              <SeriesCatalog
                series={content?.series || []}
                categories={content?.categories.series || []}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {activeTab === "favorites" && (
              <FavoritesView
                content={content}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onSelectChannel={() => setActiveTab("live")}
                onSelectMovie={() => setActiveTab("movies")}
                onSelectSeries={() => setActiveTab("series")}
              />
            )}

            {activeTab === "search" && (
              <SearchView
                content={content}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onSelectChannel={() => setActiveTab("live")}
                onSelectMovie={() => setActiveTab("movies")}
                onSelectSeries={() => setActiveTab("series")}
              />
            )}

            {activeTab === "admin" && (
              <AdminPanel
                appName={config.appName}
                downloaderCode={config.downloaderCode}
                onRefreshContent={fetchContent}
              />
            )}
          </>
        )}
      </main>

      {/* Login / Activation Code Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        downloaderCode={config.downloaderCode}
      />

      {/* Virtual Remote Control D-Pad Helper Guide */}
      <TVRemoteGuide
        isOpen={isRemoteGuideOpen}
        onClose={() => setIsRemoteGuideOpen(false)}
      />

      {/* Bottom Footer Info */}
      <footer className="border-t border-white/5 bg-[#0A0A0C] py-4 px-8 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <p className="font-medium text-gray-400">
          © {new Date().getFullYear()} {config.appName} • Clean Minimalism Engine
        </p>
        <div className="flex items-center space-x-4 text-gray-500 font-mono text-[11px]">
          <span>Código Downloader: <b className="text-white font-mono">{config.downloaderCode}</b></span>
          <span>•</span>
          <span>Otimizado para Smart TV, TV Box & Celulares</span>
        </div>
      </footer>
    </div>
  );
}
