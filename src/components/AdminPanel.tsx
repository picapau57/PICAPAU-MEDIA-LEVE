import React, { useState, useEffect } from "react";
import { AppConfig, PlaylistSource, UserAccount } from "../types";
import { syncClientSources, normalizeUrl } from "../utils/m3uParser";
import { generate10SampleMovieLists } from "../utils/sampleMovieLists";
import {
  fetchCloudSources,
  saveCloudSources,
  saveCloudParsedContent,
  fetchCloudUsers,
  saveCloudUsers,
  fetchCloudConfig,
  saveCloudConfig,
} from "../lib/firebase";
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
  Eraser,
  Film,
  RotateCcw,
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

  // Fetch Admin Data from Cloud Firestore & API
  const loadAdminData = async () => {
    try {
      // 1. Try Cloud Firestore sources
      const cloudSources = await fetchCloudSources();
      if (cloudSources && cloudSources.length > 0) {
        setSources(cloudSources);
        localStorage.setItem("picapau_sources", JSON.stringify(cloudSources));
      } else {
        const srcRes = await fetch("/api/admin/sources").catch(() => null);
        if (srcRes && srcRes.ok) {
          const srcData = await srcRes.json();
          if (Array.isArray(srcData)) {
            setSources(srcData);
            localStorage.setItem("picapau_sources", JSON.stringify(srcData));
          }
        } else {
          const saved = localStorage.getItem("picapau_sources");
          if (saved) setSources(JSON.parse(saved));
        }
      }

      // 2. Try Cloud Firestore users
      const cloudUsers = await fetchCloudUsers();
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      } else {
        const usrRes = await fetch("/api/admin/users").catch(() => null);
        if (usrRes && usrRes.ok) {
          const usrData = await usrRes.json();
          if (Array.isArray(usrData)) {
            setUsers(usrData);
          }
        }
      }

      // 3. Try Cloud Firestore config
      const cloudCfg = await fetchCloudConfig();
      if (cloudCfg) {
        setConfig((prev) => ({ ...prev, ...cloudCfg }));
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      const saved = localStorage.getItem("picapau_sources");
      if (saved) setSources(JSON.parse(saved));
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
    if (!newSourceName.trim()) {
      setStatusMessage({ type: "error", text: "Digite um nome para a lista." });
      return;
    }
    if (newSourceType === "url" && !newSourceUrl.trim()) {
      setStatusMessage({ type: "error", text: "Digite o link URL da lista M3U." });
      return;
    }
    if (newSourceType === "raw" && !newSourceRaw.trim()) {
      setStatusMessage({ type: "error", text: "Cole o conteúdo M3U no campo de texto." });
      return;
    }

    setIsSubmittingSource(true);
    setStatusMessage(null);

    const formattedUrl = newSourceType === "url" ? normalizeUrl(newSourceUrl) : undefined;

    try {
      const body = {
        name: newSourceName.trim(),
        type: newSourceType,
        url: formattedUrl,
        content: newSourceType === "raw" ? newSourceRaw : undefined,
      };

      let isBackendSaved = false;
      let serverItemCount = 0;

      try {
        const res = await fetch("/api/admin/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            isBackendSaved = true;
            serverItemCount = data.source.itemCount;
          }
        }
      } catch (err) {
        console.warn("Backend add source unavailable, using client local storage fallback:", err);
      }

      const newSource: PlaylistSource = {
        id: `src_${Math.random().toString(36).substring(2, 9)}`,
        name: newSourceName.trim(),
        type: newSourceType,
        url: formattedUrl,
        content: newSourceType === "raw" ? newSourceRaw : undefined,
        updatedAt: new Date().toISOString(),
        itemCount: serverItemCount,
        active: true,
      };

      const updatedSources = [...sources, newSource];
      setSources(updatedSources);
      try {
        localStorage.setItem("picapau_sources", JSON.stringify(updatedSources));
      } catch (err) {
        console.warn("LocalStorage save error:", err);
      }

      // Save to Firebase Firestore Cloud
      await saveCloudSources(updatedSources);

      // Run client sync so content is parsed and saved to Firestore immediately
      const parsed = await syncClientSources(updatedSources);

      setStatusMessage({
        type: "success",
        text: `Lista "${newSourceName.trim()}" adicionada e sincronizada com sucesso! (${parsed.totalCount} itens detectados)`,
      });

      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceRaw("");
      onRefreshContent();
    } catch (err: any) {
      console.error("Error adding playlist source:", err);
      setStatusMessage({
        type: "error",
        text: "Erro ao adicionar lista. Verifique os dados e tente novamente.",
      });
    } finally {
      setIsSubmittingSource(false);
    }
  };

  // Sync / Reload Lists
  const handleForceSync = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      let serverSynced = false;
      try {
        const res = await fetch("/api/admin/sources/sync", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            serverSynced = true;
            setStatusMessage({
              type: "success",
              text: `Sincronização concluída! Total de ${data.stats.total} itens (${data.stats.channels} Canais, ${data.stats.movies} Filmes, ${data.stats.series} Séries)`,
            });
            onRefreshContent();
          }
        }
      } catch (err) {
        console.warn("Server sync endpoint unavailable, syncing client side:", err);
      }

      if (!serverSynced) {
        const currentSources = sources.length > 0 ? sources : (() => {
          try {
            const saved = localStorage.getItem("picapau_sources");
            return saved ? JSON.parse(saved) : [];
          } catch {
            return [];
          }
        })();

        const parsed = await syncClientSources(currentSources);
        setStatusMessage({
          type: "success",
          text: `Sincronização concluída! Total de ${parsed.totalCount} itens (${parsed.channelsCount} Canais, ${parsed.moviesCount} Filmes, ${parsed.seriesCount} Séries)`,
        });
        onRefreshContent();
      }
    } catch (err) {
      console.warn("Sync error:", err);
      setStatusMessage({
        type: "error",
        text: "Erro ao sincronizar listas. Verifique os links M3U cadastrados.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear Content of a Single Source (Esvaziar Lista)
  const handleClearSingleSource = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente esvaziar todo o conteúdo da lista "${name}"?`)) return;
    try {
      const updatedSources = sources.map((s) => {
        if (s.id === id) {
          return { ...s, url: "", content: "", itemCount: 0, updatedAt: new Date().toISOString() };
        }
        return s;
      });
      setSources(updatedSources);
      localStorage.setItem("picapau_sources", JSON.stringify(updatedSources));

      // Save to Firebase Cloud
      await saveCloudSources(updatedSources);

      // Update backend if possible
      fetch(`/api/admin/sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "", content: "" }),
      }).catch(() => null);

      await syncClientSources(updatedSources);
      onRefreshContent();
      setStatusMessage({ type: "success", text: `Lista "${name}" foi esvaziada com sucesso.` });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao esvaziar a lista." });
    }
  };

  // Delete Source
  const handleDeleteSource = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta lista?")) return;
    try {
      fetch(`/api/admin/sources/${id}`, { method: "DELETE" }).catch(() => null);
      const updatedSources = sources.filter((s) => s.id !== id);
      setSources(updatedSources);
      localStorage.setItem("picapau_sources", JSON.stringify(updatedSources));

      // Save to Firebase Cloud
      await saveCloudSources(updatedSources);

      await syncClientSources(updatedSources);
      onRefreshContent();
      setStatusMessage({ type: "success", text: "Lista removida com sucesso." });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao deletar fonte." });
    }
  };

  // Clear ALL Sources (Limpar Todas as Listas)
  const handleClearAllSources = async () => {
    if (!confirm("⚠️ ATENÇÃO: Tem certeza que deseja LIMPAR TODAS AS LISTAS? Todos os canais e filmes cadastrados serão removidos.")) {
      return;
    }
    try {
      setIsSyncing(true);
      fetch("/api/admin/sources", { method: "DELETE" }).catch(() => null);

      setSources([]);
      localStorage.setItem("picapau_sources", "[]");

      // Save empty list and empty catalog to Firebase Cloud
      await saveCloudSources([]);
      const emptyParsed = await syncClientSources([]);
      await saveCloudParsedContent(emptyParsed);

      localStorage.setItem("picapau_cached_content", JSON.stringify(emptyParsed));

      onRefreshContent();
      setStatusMessage({
        type: "success",
        text: "Todas as listas foram apagadas com sucesso! O sistema está limpo para novas listas.",
      });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao limpar todas as listas." });
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto Load 10 Sample Movie Lists
  const handleLoad10MovieLists = async () => {
    if (sources.length > 0 && !confirm("Deseja adicionar as 10 listas de filmes demonstrativas às suas listas atuais?")) {
      return;
    }
    try {
      setIsSyncing(true);
      const new10Lists = generate10SampleMovieLists();
      const updatedSources = [...sources, ...new10Lists];

      setSources(updatedSources);
      localStorage.setItem("picapau_sources", JSON.stringify(updatedSources));

      // Save to Firebase Cloud
      await saveCloudSources(updatedSources);

      const parsed = await syncClientSources(updatedSources);
      onRefreshContent();
      setStatusMessage({
        type: "success",
        text: `10 Listas com Filmes criadas e sincronizadas! Total de ${parsed.moviesCount} filmes carregados.`,
      });
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao carregar as 10 listas de filmes." });
    } finally {
      setIsSyncing(false);
    }
  };

  // Add User Account
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) {
      setStatusMessage({ type: "error", text: "Nome do amigo / cliente é obrigatório." });
      return;
    }

    const generatedCode = newUserCode.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    const newUserObj: UserAccount = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: newUserName.trim(),
      username: newUserUsername.trim() || undefined,
      password: newUserPassword.trim() || undefined,
      code: generatedCode,
      expiresAt: newUserExpiration || "2028-12-31",
      active: true,
      maxConnections: 2,
      createdAt: new Date().toISOString(),
    };

    try {
      fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          username: newUserUsername,
          password: newUserPassword,
          code: newUserCode,
          expiresAt: newUserExpiration,
        }),
      }).catch(() => null);

      const updatedUsers = [...users, newUserObj];
      setUsers(updatedUsers);
      await saveCloudUsers(updatedUsers);

      setStatusMessage({
        type: "success",
        text: `Usuário "${newUserObj.name}" criado e salvo na nuvem com Código: ${newUserObj.code}`,
      });
      setNewUserName("");
      setNewUserUsername("");
      setNewUserPassword("");
      setNewUserCode("");
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao criar conta de usuário." });
    }
  };

  // Toggle User Status
  const handleToggleUser = async (user: UserAccount) => {
    try {
      const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u));
      setUsers(updatedUsers);
      await saveCloudUsers(updatedUsers);

      fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      }).catch(() => null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remover esta conta de usuário?")) return;
    try {
      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);
      await saveCloudUsers(updatedUsers);

      fetch(`/api/admin/users/${id}`, { method: "DELETE" }).catch(() => null);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCloudConfig(config);

      fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPinInput || "1234", ...config }),
      }).catch(() => null);

      setStatusMessage({ type: "success", text: "Configurações salvas e sincronizadas na nuvem com sucesso!" });
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
                  Atalhos Rápidos de Lista (Slots 1 a 10):
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewSourceName(`Lista ${num}: Filmes`)}
                      className="py-1 px-2 bg-[#0F0F12] hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 border border-white/10 rounded-lg text-[10px] font-mono transition-colors"
                      title={`Preencher nome como Lista ${num}`}
                    >
                      Slot #{num}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nome Identificador da Lista:
                </label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="Ex: Lista 1: Filmes Ação, Servidor VIP, etc."
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Listas M3U Cadastradas ({sources.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Gerencie ou esvazie cada lista individualmente para trocar de conteúdo com facilidade.
                </p>
              </div>

              {/* Action Buttons Header */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoad10MovieLists}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-xs rounded-xl border border-orange-500/30 flex items-center space-x-1.5 transition-colors"
                  title="Gerar automaticamente 10 listas de filmes demonstrativos (5 a 10 filmes cada)"
                >
                  <Film className="w-3.5 h-3.5 shrink-0" />
                  <span>GERAR 10 LISTAS (FILMES)</span>
                </button>

                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-[#0F0F12] hover:bg-white/5 text-gray-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 flex items-center space-x-1.5 transition-colors"
                  title="Sincronizar e reprocessar listas cadastradas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>RECARREGAR</span>
                </button>

                {sources.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSources}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 flex items-center space-x-1.5 transition-colors"
                    title="Apagar todas as listas cadastradas no sistema"
                  >
                    <Eraser className="w-3.5 h-3.5 shrink-0" />
                    <span>LIMPAR TODAS</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {sources.length === 0 ? (
                <div className="p-8 text-center bg-[#0F0F12] rounded-xl border border-dashed border-white/10 space-y-3">
                  <Film className="w-8 h-8 text-gray-600 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-gray-300">Nenhuma lista cadastrada no momento.</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Adicione um link M3U no formulário ao lado ou clique em{" "}
                      <strong className="text-orange-400 font-mono">"GERAR 10 LISTAS (FILMES)"</strong> para preencher automaticamente com 10 listas prontas.
                    </p>
                  </div>
                </div>
              ) : (
                sources.map((src, index) => (
                  <div
                    key={src.id}
                    className="bg-[#0F0F12] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start space-x-3 truncate">
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0 font-mono text-xs font-bold flex items-center justify-center min-w-[36px]">
                        #{index + 1}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-semibold text-white truncate">{src.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                            src.itemCount > 0
                              ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/20"
                              : "bg-gray-800 text-gray-400 border-white/5"
                          }`}>
                            {src.itemCount} {src.itemCount === 1 ? "item" : "itens"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5 font-mono">
                          {src.type === "url" && src.url ? src.url : src.content ? "Lista M3U em Texto (Conteúdo Ativo)" : "Lista Vazia / Sem Conteúdo"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button
                        type="button"
                        onClick={() => handleClearSingleSource(src.id, src.name)}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-[#1A1A1F] hover:bg-orange-500/10 rounded-lg border border-orange-500/20 transition-colors flex items-center space-x-1"
                        title="Esvaziar conteúdo desta lista"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Esvaziar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSource(src.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 bg-[#1A1A1F] hover:bg-rose-500/10 rounded-lg border border-white/5 transition-colors"
                        title="Excluir Lista Permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
