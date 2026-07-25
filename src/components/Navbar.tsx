import React, { useState, useEffect } from "react";
import {
  Tv,
  Film,
  Clapperboard,
  Heart,
  Search,
  ShieldAlert,
  UserCheck,
  LogOut,
  Download,
  Gamepad2,
  Clock,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  activeTab: "live" | "movies" | "series" | "favorites" | "search" | "admin";
  setActiveTab: (tab: "live" | "movies" | "series" | "favorites" | "search" | "admin") => void;
  appName: string;
  downloaderCode: string;
  currentUser: { name: string; code: string; expiresAt: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  toggleRemoteGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  appName,
  downloaderCode,
  currentUser,
  onOpenLogin,
  onLogout,
  toggleRemoteGuide,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F12]/95 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Name & Status Badges */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            onClick={() => setActiveTab("live")}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
              <Tv className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base md:text-lg tracking-tight uppercase flex items-center gap-2">
                {appName}
                <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono tracking-widest px-2 py-0.5 rounded border border-orange-500/20">
                  LEVE
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
                Sistema IPTV de Baixo Consumo
              </p>
            </div>
          </div>

          {/* Clock on mobile top bar */}
          <div className="flex md:hidden items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1 text-gray-400 bg-[#1A1A1F] px-2.5 py-1 rounded-lg border border-white/10 font-mono">
              <Clock className="w-3 h-3 text-orange-400" />
              <span className="text-white font-bold">{currentTime}</span>
            </span>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto w-full md:w-auto py-1 no-scrollbar">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "live"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20 scale-105"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Canais ao Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab("movies")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "movies"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20 scale-105"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Filmes</span>
          </button>

          <button
            onClick={() => setActiveTab("series")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "series"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20 scale-105"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>Séries</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "favorites"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20 scale-105"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favoritos</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "search"
                ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-900/20 scale-105"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "admin"
                ? "bg-red-600 text-white font-bold shadow-lg shadow-red-900/20 scale-105"
                : "text-gray-400 hover:bg-white/5 hover:text-red-400"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Painel Admin</span>
          </button>
        </nav>

        {/* Right Info & Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Virtual Remote Control Help button */}
          <button
            onClick={toggleRemoteGuide}
            className="p-2 bg-[#1A1A1F] hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 transition-colors flex items-center space-x-1.5 text-xs font-medium"
            title="Ajuda do Controle Remoto / D-Pad"
          >
            <Gamepad2 className="w-4 h-4 text-orange-400" />
            <span>Controle</span>
          </button>

          {/* Downloader App Code Badge */}
          <div className="text-right">
            <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono">Código de Instalação</span>
            <span className="text-sm font-mono text-white font-bold">{downloaderCode}</span>
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2.5 bg-[#1A1A1F] px-3.5 py-1.5 rounded-lg border border-white/10">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">Cód: {currentUser.code}</p>
              </div>
              <button
                onClick={onLogout}
                className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Entrar / Código</span>
            </button>
          )}

          {/* Digital Clock */}
          <div className="flex items-center space-x-1.5 text-gray-300 bg-[#1A1A1F] px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
