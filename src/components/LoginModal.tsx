import React, { useState } from "react";
import { X, Sparkles, Key, Download, CheckCircle2, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; code: string; expiresAt: string }) => void;
  downloaderCode: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  downloaderCode,
}) => {
  const [code, setCode] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [useCredentials, setUseCredentials] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useCredentials ? { username, password } : { code: code || "888888" }
        ),
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.message || "Erro de autenticação.");
      }
    } catch (err) {
      setErrorMessage("Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setCode("000000");
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "000000" }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full bg-[#1A1A1F] border border-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-black flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 font-bold">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-lg font-bold font-mono text-white uppercase tracking-tight pt-1">
            Acessar PICAPAU MEDIA LEVE
          </h2>
          <p className="text-xs text-gray-400">
            Digite seu código de 6 dígitos fornecido pelo administrador.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {!useCredentials ? (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Código de Ativação (6 Dígitos):
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: 888888 ou 123456"
                  className="w-full bg-[#1A1A1F] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-orange-500/50 text-center font-mono font-bold text-lg tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Usuário:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário"
                  className="w-full bg-[#1A1A1F] text-white px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Senha:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-[#1A1A1F] text-white px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
          >
            {isLoading ? "ENTRANDO..." : "ENTRAR NO SISTEMA"}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => setUseCredentials(!useCredentials)}
            className="hover:text-orange-400 underline font-semibold transition-colors"
          >
            {useCredentials ? "Entrar com Código 6 Dígitos" : "Entrar com Usuário e Senha"}
          </button>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-orange-400 font-semibold hover:underline transition-colors"
          >
            Acesso Visitante (000000)
          </button>
        </div>

        {/* Downloader App Box */}
        <div className="p-3 bg-[#1A1A1F] rounded-xl border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400">Instalação TV Box (Downloader Code):</span>
          </div>
          <span className="font-mono font-bold text-orange-400">{downloaderCode}</span>
        </div>
      </div>
    </div>
  );
};
