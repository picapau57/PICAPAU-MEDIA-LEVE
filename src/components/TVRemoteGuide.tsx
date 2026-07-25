import React from "react";
import { Gamepad2, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft, Volume2 } from "lucide-react";

interface TVRemoteGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TVRemoteGuide: React.FC<TVRemoteGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-5 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full bg-[#1A1A1F] border border-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white uppercase tracking-tight">Guia de Controle Remoto (TV Box)</h2>
            <p className="text-xs text-gray-400">Teclas rápidas de navegação no D-Pad do seu controle</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#1A1A1F] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center space-x-2 text-orange-400 font-semibold">
              <div className="flex space-x-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <ArrowDown className="w-3.5 h-3.5" />
                <ArrowLeft className="w-3.5 h-3.5" />
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <span>Setas / Direcionais</span>
            </div>
            <p className="text-[11px] text-gray-400">Navega entre canais, categorias e capas de filmes no grid.</p>
          </div>

          <div className="bg-[#1A1A1F] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center space-x-2 text-orange-400 font-semibold">
              <CornerDownLeft className="w-4 h-4" />
              <span>OK / ENTER</span>
            </div>
            <p className="text-[11px] text-gray-400">Sintoniza o canal ou abre o player em tela cheia.</p>
          </div>

          <div className="bg-[#1A1A1F] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center space-x-2 text-orange-400 font-semibold">
              <span>CH+ / CH-</span>
            </div>
            <p className="text-[11px] text-gray-400">Troca rápida para o canal seguinte ou anterior ao assistir.</p>
          </div>

          <div className="bg-[#1A1A1F] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center space-x-2 text-orange-400 font-semibold">
              <Volume2 className="w-4 h-4" />
              <span>Vol+ / Vol-</span>
            </div>
            <p className="text-[11px] text-gray-400">Ajusta o volume do áudio do canal ao vivo.</p>
          </div>
        </div>

        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[11px] text-orange-300">
          💡 O sistema <strong className="text-white">PICAPAU MEDIA LEVE</strong> foi programado para responder nativamente aos comandos do controle remoto das TV Boxes (Android TV, Mi Box, Aquário, Fire TV, etc.).
        </div>
      </div>
    </div>
  );
};
