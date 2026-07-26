import React, { useState, useEffect } from "react";
import { AppConfig, PlaylistSource, UserAccount } from "../types";
import {
  ShieldAlert,
  Link,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  Key,
  Copy,
  Check,
  Download,
  Settings,
  Sparkles,
  Lock,
  Radio,
  Tv,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AdminPanelProps {
  appName: string;
  downloaderCode: string;
  onRefreshContent: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appName,
  downloaderCode,
  onRefreshContent,
}) => {
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"playlists" | "users" | "settings" | "downloader">("playlists");

  // Playlists State
  const [sources, setSources] = useState<PlaylistSource[]>([]);
  const [newSourceType, setNewSourceType] = useState<"url" | "raw">("url");
  const [newSourceName, setNewSourceName] = useState<string>("");
  const [newSourceUrl, setNewSourceUrl] = useState<string>("");
  const [newSourceRaw, setNewSourceRaw] = useState<string>("");
  const [isSubmittingSource, setIsSubmittingSource] = useState<boolean>(false);

  // Users State
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserUsername, setNewUserUsername] = useState<string>("");
  const [newUserPassword, setNewUserPassword] = useState<string>("");
  const [newUserCode, setNewUserCode] = useState<string>("");
  const [newUserExpiration, setNewUserExpiration] = useState<string>("2028-12-31");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Settings State
  const [config, setConfig] = useState<AppConfig>({
    appName: "PICAPAU MEDIA LEVE",
    adminPin: "1234",
    downloaderCode: "792014",
    announcement: "Bem-vindo ao PICAPAU MEDIA LEVE! Sistema otimizado para TV Box, Smart TV e Celular.",
    allowGuestDemo: true,
    autoEnrichMetadata: true,
  });

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Fetch Admin Data
  const loadAdminData = async () => {
    try {
      const [srcRes, usrRes] = await Promise.all([
        fetch("/api/admin/sources"),
        fetch("/api/admin/users"),
      ]);

      if (srcRes.ok) {
        const srcData = await srcRes.json();
        setSources(srcData);
      }
      if (usrRes.ok) {
        const usrData = await usrRes.json();
        setUsers(usrData);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPinInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          loadAdminData();
          return;
        } else {
          setLoginError(data.message || "PIN Incorreto");
          return;
        }
      }
    } catch (err) {
      console.warn("Backend admin login unavailable, checking local PIN:", err);
    }

    if (adminPinInput === "1234" || adminPinInput === config.adminPin) {
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      setLoginError("PIN Administrativo incorreto.");
    }
  };

  // Add Playlist Source (URL or Raw)
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName) {
      setStatusMessage({ type: "error", text: "Digite um nome para a lista." });
      return;
    }
    if (newSourceType === "url" && !newSourceUrl) {
      setStatusMessage({ type: "error", text: "Digite o link URL da lista M3U." });
      return;
    }
    if (newSourceType === "raw" && !newSourceRaw) {
      setStatusMessage({ type: "error", text: "Cole o conteúdo M3U no campo de texto." });
      return;
    }

    setIsSubmittingSource(true);
    setStatusMessage(null);

    try {
      const body = {
        name: newSourceName,
        type: newSourceType,
        url: newSourceType === "url" ? newSourceUrl : undefined,
        content: newSourceType === "raw" ? newSourceRaw : undefined,
      };

      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatusMessage({
            type: "success",
            text: `Lista "${newSourceName}" adicionada com sucesso! (${data.source.itemCount} itens detectados)`,
          });
          setNewSourceName("");
          setNewSourceUrl("");
          setNewSourceRaw("");
          loadAdminData();
          onRefreshContent();
          return;
        } else {
          setStatusMessage({ type: "error", text: data.error || "Erro ao processar lista." });
          return;
        }
      } else {
        const errData = await res.json().catch(() => null);
        setStatusMessage({
          type: "error",
          text: errData?.error || `Erro no servidor (${res.status}) ao adicionar lista.`,
        });
      }
    } catch (err) {
      console.warn("Backend source upload error:", err);
      // Client-side fallback addition if backend is unreachable
      const fallbackSource: PlaylistSource = {
        id: `src_local_${Math.random().toString(36).substring(2, 7)}`,
        name: newSourceName,
        type: newSourceType,
        url: newSourceType === "url" ? newSourceUrl : undefined,
        content: newSourceType === "raw" ? newSourceRaw : undefined,
        updatedAt: new Date().toISOString(),
        itemCount: 0,
        active: true,
      };
      setSources((prev) => [...prev, fallbackSource]);
      setStatusMessage({
        type: "success",
        text: `Lista "${newSourceName}" registrada localmente!`,
      });
      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceRaw("");
    } finally {
      setIsSubmittingSource(false);
    }
  };

  // Sync / Reload Lists
  const handleForceSync = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/sources/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatusMessage({
            type: "success",
            text: `Sincronização concluída! Total de ${data.stats.total} itens (${data.stats.channels} Canais, ${data.stats.movies} Filmes, ${data.stats.series} Séries)`,
          });
          onRefreshContent();
          return;
        } else {
          setStatusMessage({ type: "error", text: data.error || "Erro ao sincronizar listas." });
          return;
        }
      } else {
        const errData = await res.json().catch(() => null);
        setStatusMessage({
          type: "error",
          text: errData?.error || errData?.message || `Erro no servidor (${res.status}). Verifique o link da lista.`,
        });
      }
    } catch (err) {
      console.warn("Sync error:", err);
      setStatusMessage({
        type: "error",
        text: "Não foi possível conectar ao servidor para sincronizar. Recarregue a página e tente novamente.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete Source
  const handleDeleteSource = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta lista?")) return;
    try {
      await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
      loadAdminData();
      onRefreshContent();
      setStatusMessage({ type: "success", text: "Lista removida com sucesso." });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao deletar fonte." });
    }
  };

  // Add User Account
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) {
      setStatusMessage({ type: "error", text: "Nome do amigo / cliente é obrigatório." });
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          username: newUserUsername,
          password: newUserPassword,
          code: newUserCode,
          expiresAt: newUserExpiration,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `Usuário "${data.user.name}" criado com Código: ${data.user.code}`,
        });
        setNewUserName("");
        setNewUserUsername("");
        setNewUserPassword("");
        setNewUserCode("");
        loadAdminData();
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao criar conta de usuário." });
    }
  };

  // Toggle User Status
  const handleToggleUser = async (user: UserAccount) => {
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remover esta conta de usuário?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPinInput || "1234", ...config }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "Configurações salvas com sucesso!" });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao salvar configurações." });
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // If not authenticated, show PIN form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#1A1A1F] border border-white/10 rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider font-mono">Painel do Administrador</h2>
          <p className="text-xs text-gray-400 mt-1">
            Digite o PIN mestre para gerenciar Listas IPTV e Contas de Usuários.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="Digite o PIN (Padrão: 1234)"
              className="w-full bg-[#0F0F12] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-orange-500/50 text-center font-mono font-bold tracking-widest text-lg"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-950/30 transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>ACESSAR PAINEL ADMIN</span>
          </button>
        </form>

        <p className="text-[11px] text-gray-500 font-mono">
          Dica: O PIN inicial de teste é <code className="text-orange-400 font-bold">1234</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight font-mono">Painel Administrativo</h2>
            <p className="text-xs text-gray-400">PICAPAU MEDIA LEVE • Gerenciamento M3U e Usuários</p>
          </div>
        </div>

        {/* Subtabs Navigation */}
        <div className="flex items-center space-x-2 bg-[#0F0F12] p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("playlists")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "playlists"
                ? "bg-orange-500 text-black font-bold shadow-md shadow-orange-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Listas M3U</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "users"
                ? "bg-orange-500 text-black font-bold shadow-md shadow-orange-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuários / Amigos</span>
          </button>

          <button
            onClick={() => setActiveTab("downloader")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "downloader"
                ? "bg-orange-500 text-black font-bold shadow-md shadow-orange-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloader TV</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "settings"
                ? "bg-orange-500 text-black font-bold shadow-md shadow-orange-900/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustes</span>
          </button>
        </div>
      </div>

      {/* Global Admin Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: PLAYLISTS MANAGEMENT (URL OR RAW TEXT) */}
      {activeTab === "playlists" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Insert Playlist */}
          <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Inserir Nova Lista IPTV</span>
            </h3>

            {/* Mode Switcher: Link vs Raw Text */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#0F0F12] rounded-xl border border-white/5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setNewSourceType("url")}
                className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  newSourceType === "url"
                    ? "bg-orange-500 text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Opção 1: Link URL</span>
              </button>

              <button
                type="button"
                onClick={() => setNewSourceType("raw")}
                className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  newSourceType === "raw"
                    ? "bg-orange-500 text-black font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Opção 2: Lista Aberta</span>
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nome Identificador da Lista:
                </label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="Ex: Minha Lista Principal, Servidor VIP, etc."
                  className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50"
                  required
                />
              </div>

              {newSourceType === "url" ? (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Link URL da Lista IPTV (M3U / M3U8):
                  </label>
                  <input
                    type="url"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    placeholder="http://seu-provedor.com/get.php?username=...&password=...&type=m3u_plus"
                    className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50 font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Suporta links padrão M3U e M3U_PLUS de qualquer provedor IPTV.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Cole o Conteúdo da Lista Aberta (Formato M3U):
                  </label>
                  <textarea
                    rows={8}
                    value={newSourceRaw}
                    onChange={(e) => setNewSourceRaw(e.target.value)}
                    placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-id=&quot;canal.br&quot; group-title=&quot;CANAIS | ABERTA&quot;, Globo HD&#10;http://stream.url/live.m3u8"
                    className="w-full bg-[#0F0F12] text-white p-3 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50 font-mono leading-relaxed"
                    required
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingSource}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
              >
                {isSubmittingSource ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>PROCESSAR E SALVAR LISTA</span>
              </button>
            </form>
          </div>

          {/* Right Table: Active Playlists */}
          <div className="lg:col-span-2 bg-[#1A1A1F] border border-white/10 rounded-2xl p-5 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Listas M3U Cadastradas ({sources.length})
                </h3>
                <p className="text-xs text-gray-400">
                  O sistema organiza automaticamente em Canais, Filmes e Séries.
                </p>
              </div>

              <button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-[#0F0F12] hover:bg-white/5 text-orange-400 font-bold text-xs rounded-xl border border-white/10 flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>RECARREGAR LISTAS</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-[#0F0F12] p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3 truncate">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                      {src.type === "url" ? <Link className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-semibold text-white truncate">{src.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1F] text-gray-300 font-mono border border-white/5">
                          {src.itemCount} itens
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5 font-mono">
                        {src.type === "url" ? src.url : "Lista Aberta em Texto M3U"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleDeleteSource(src.id)}
                      className="p-2 text-gray-500 hover:text-red-400 bg-[#1A1A1F] rounded-lg border border-white/5 transition-colors"
                      title="Excluir Lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS MANAGER */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Form */}
          <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Cadastrar Novo Amigo / Usuário</span>
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nome do Amigo ou Aparelho:
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Sala João, TV Quarto, Marcos Silva"
                  className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Código de Ativação (6 Dígitos):
                </label>
                <input
                  type="text"
                  value={newUserCode}
                  onChange={(e) => setNewUserCode(e.target.value)}
                  placeholder="Deixe em branco para gerar código aleatório"
                  className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-orange-500/50 font-mono"
                  maxLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Usuário:</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Senha:</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Validade do Acesso:</label>
                <select
                  value={newUserExpiration}
                  onChange={(e) => setNewUserExpiration(e.target.value)}
                  className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs"
                >
                  <option value="2028-12-31">Ilimitado (Uso Pessoal / Amigos)</option>
                  <option value="2026-12-31">1 Ano</option>
                  <option value="2026-08-25">30 Dias</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>CRIAR CONTA / CÓDIGO</span>
              </button>
            </form>
          </div>

          {/* User Accounts List */}
          <div className="lg:col-span-2 bg-[#1A1A1F] border border-white/10 rounded-2xl p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Contas de Usuários Ativas ({users.length})
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {users.map((usr) => (
                <div
                  key={usr.id}
                  className="bg-[#0F0F12] p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                      {usr.code}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-white flex items-center space-x-2">
                        <span>{usr.name}</span>
                        {usr.active ? (
                          <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono uppercase">
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[9px] bg-rose-950/60 text-rose-400 border border-rose-800/80 px-1.5 py-0.5 rounded font-mono uppercase">
                            Bloqueado
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Código: <strong className="text-orange-400 font-bold">{usr.code}</strong> • Validade: {usr.expiresAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(usr.code, usr.id)}
                      className="px-2.5 py-1.5 bg-[#1A1A1F] hover:bg-white/10 text-gray-200 text-xs font-mono font-bold rounded-lg border border-white/5 flex items-center space-x-1"
                    >
                      {copiedCodeId === usr.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-orange-400" />
                          <span>Copiar Cód</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleUser(usr)}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors border border-white/5 ${
                        usr.active
                          ? "bg-amber-950/40 text-amber-300 hover:bg-amber-900/60"
                          : "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60"
                      }`}
                    >
                      {usr.active ? "Bloquear" : "Ativar"}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(usr.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 bg-[#1A1A1F] rounded-lg border border-white/5 transition-colors"
                      title="Deletar Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOWNLOADER & TV BOX INSTALLATION GUIDE */}
      {activeTab === "downloader" && (
        <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl p-6 text-left space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500 text-black flex items-center justify-center font-bold">
              <Download className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase font-mono">
                Instalação em Smart TV e TV Box via App Downloader
              </h3>
              <p className="text-xs text-gray-400">
                Instruções passo a passo para você e seus amigos instalarem o app diretamente na TV Box.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0F0F12] p-4 rounded-xl border border-white/5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-black font-bold flex items-center justify-center text-xs font-mono">
                1
              </span>
              <h4 className="text-xs font-semibold text-white">Baixar Downloader</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Na sua TV Box ou Android TV, abra a Play Store e busque pelo aplicativo <strong className="text-orange-400">Downloader</strong> (ícone laranja).
              </p>
            </div>

            <div className="bg-[#0F0F12] p-4 rounded-xl border border-white/5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-black font-bold flex items-center justify-center text-xs font-mono">
                2
              </span>
              <h4 className="text-xs font-semibold text-white">Digitar Código do Sistema</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Abra o Downloader e no campo de URL digite o código do seu sistema:
              </p>
              <div className="p-2.5 bg-[#1A1A1F] border border-orange-500/30 rounded-lg text-center font-mono font-bold text-base text-orange-400">
                {downloaderCode}
              </div>
            </div>

            <div className="bg-[#0F0F12] p-4 rounded-xl border border-white/5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-black font-bold flex items-center justify-center text-xs font-mono">
                3
              </span>
              <h4 className="text-xs font-semibold text-white">Digitar Código de Acesso</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Ao abrir o sistema PICAPAU MEDIA LEVE na TV, digite seu código de 6 dígitos (Ex: <strong className="text-orange-400">888888</strong>) e aproveite!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl p-6 text-left max-w-2xl mx-auto space-y-5">
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <span>Ajustes e Configurações Gerais</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Nome do Sistema IPTV:
              </label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Código Downloader (Para TV Box):
              </label>
              <input
                type="text"
                value={config.downloaderCode}
                onChange={(e) => setConfig({ ...config, downloaderCode: e.target.value })}
                className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                PIN Mestre do Admin:
              </label>
              <input
                type="password"
                value={config.adminPin}
                onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Mensagem de Aviso para os Amigos / Usuários:
              </label>
              <input
                type="text"
                value={config.announcement}
                onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                className="w-full bg-[#0F0F12] text-white px-3 py-2 rounded-xl border border-white/10 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/30 transition-transform active:scale-95"
            >
              SALVAR CONFIGURAÇÕES DO SISTEMA
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
