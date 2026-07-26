import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  AppConfig,
  ContentType,
  ParsedM3U,
  PlaylistItem,
  PlaylistSource,
  SeriesEpisode,
  SeriesGroup,
  UserAccount,
} from "./src/types";

const PORT = 3000;
const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "server-data.json")
  : path.join(process.cwd(), "server-data.json");

// Default initial database content
const DEFAULT_CONFIG: AppConfig = {
  appName: "PICAPAU MEDIA LEVE",
  adminPin: "1234",
  downloaderCode: "792014",
  announcement: "Bem-vindo ao PICAPAU MEDIA LEVE! Sistema otimizado para TV Box, Smart TV e Celular.",
  allowGuestDemo: true,
  autoEnrichMetadata: true,
};

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr_admin_demo",
    username: "admin",
    password: "123",
    code: "888888",
    name: "Administrador / Demo",
    active: true,
    expiresAt: "Ilimitado",
    maxConnections: 5,
    notes: "Conta principal de teste",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_amigo_1",
    username: "amigo1",
    password: "123",
    code: "123456",
    name: "Acesso Amigo 1",
    active: true,
    expiresAt: "2028-12-31",
    maxConnections: 2,
    notes: "Instalado na TV Box da Sala",
    createdAt: new Date().toISOString(),
  }
];

// Sample public demonstration streams (24/7 Open content, Open movies, Open cartoons)
const DEFAULT_SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-id="sbt.br" tvg-name="SBT HD" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/SBT_logo.svg/320px-SBT_logo.svg.png" group-title="CANAIS | TV ABERTA",SBT Brasil HD
https://sbt-live.akamaized.net/hls/live/2034176/sbt/master.m3u8

#EXTINF:-1 tvg-id="record.br" tvg-name="Record TV" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/RecordTV_logo.svg/320px-RecordTV_logo.svg.png" group-title="CANAIS | TV ABERTA",Record TV HD
https://0c239d3326eb.us-east-1.playback.live-video.net/api/video/v1/us-east-1.123281140920.channel.a177N5BwJ22X.m3u8

#EXTINF:-1 tvg-id="band.br" tvg-name="Band HD" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Band_Logo_2018.svg/320px-Band_Logo_2018.svg.png" group-title="CANAIS | TV ABERTA",Rede Bandeirantes (Band)
https://d2e1asnsl7d26a.cloudfront.net/out/v1/7888825efce64bb9b307040b28489a80/index.m3u8

#EXTINF:-1 tvg-id="cazetv" tvg-name="Cazé TV" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500" group-title="CANAIS | ESPORTES",Cazé TV Esportes Live
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8

#EXTINF:-1 tvg-id="espn.demo" tvg-name="ESPN Demo" tvg-logo="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500" group-title="CANAIS | ESPORTES",ESPN Sports Highlight
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8

#EXTINF:-1 tvg-id="cartoon.demo" tvg-name="Cartoon Zone" tvg-logo="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500" group-title="CANAIS | INFANTIL",Desenhos 24 Horas
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="cinema.demo" tvg-name="Cine Top" tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500" group-title="CANAIS | FILMES 24H",Cine Hits 24 Horas
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4

#EXTINF:-1 tvg-id="big_buck_bunny" tvg-name="Big Buck Bunny" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/300px-Big_buck_bunny_poster_big.jpg" group-title="FILMES | ANIMAÇÃO",Big Buck Bunny (4K Ultra HD)
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="tears_of_steel" tvg-name="Tears of Steel" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Tears_of_Steel_poster.jpg/300px-Tears_of_Steel_poster.jpg" group-title="FILMES | FICÇÃO CIENTÍFICA",Tears of Steel (Sci-Fi Action)
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4

#EXTINF:-1 tvg-id="sintel_movie" tvg-name="Sintel" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sintel_poster.jpg/300px-Sintel_poster.jpg" group-title="FILMES | AVENTURA",Sintel: O Dragão Perdido
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8

#EXTINF:-1 tvg-id="elephants_dream" tvg-name="Elephants Dream" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_poster.jpg/300px-Elephants_Dream_poster.jpg" group-title="FILMES | ANIMAÇÃO",Elephants Dream (Curta Metragem)
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="agent_327" tvg-name="Agent 327" tvg-logo="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500" group-title="FILMES | AÇÃO",Agente 327: Operação Barbeiro
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="series_bb_s01e01" tvg-name="Aventuras de Bunny S01E01" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/300px-Big_buck_bunny_poster_big.jpg" group-title="SERIES | ANIMAÇÃO",Aventuras do Coelho S01E01 - O Começo
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="series_bb_s01e02" tvg-name="Aventuras de Bunny S01E02" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/300px-Big_buck_bunny_poster_big.jpg" group-title="SERIES | ANIMAÇÃO",Aventuras do Coelho S01E02 - A Floresta Encantada
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4

#EXTINF:-1 tvg-id="series_bb_s02e01" tvg-name="Aventuras de Bunny S02E01" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/300px-Big_buck_bunny_poster_big.jpg" group-title="SERIES | ANIMAÇÃO",Aventuras do Coelho S02E01 - O Retorno
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4
`;

interface ServerStore {
  config: AppConfig;
  sources: PlaylistSource[];
  users: UserAccount[];
}

let store: ServerStore = {
  config: DEFAULT_CONFIG,
  sources: [
    {
      id: "src_default_sample",
      name: "Lista Aberta Exemplo Picapau",
      type: "raw",
      content: DEFAULT_SAMPLE_M3U,
      updatedAt: new Date().toISOString(),
      itemCount: 14,
      active: true,
    }
  ],
  users: DEFAULT_USERS,
};

// Cached parsed data
let cachedParsedData: ParsedM3U | null = null;

// Load data from disk if exists
function loadServerStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      store = { ...store, ...parsed };
      console.log("Server data loaded from server-data.json");
    } else {
      saveServerStore();
    }
  } catch (err) {
    console.error("Error loading server-data.json:", err);
  }
}

function saveServerStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
    cachedParsedData = null; // invalidate cache
  } catch (err) {
    console.error("Error saving server-data.json:", err);
  }
}

// M3U Parser logic
function parseM3UContent(m3uText: string): ParsedM3U {
  const lines = m3uText.split(/\r?\n/);
  const rawItems: PlaylistItem[] = [];

  let currentInfo: Partial<PlaylistItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF:")) {
      currentInfo = {};

      // Parse attributes
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const tvgNameMatch = line.match(/tvg-name="([^"]+)"/i);
      const epgMatch = line.match(/tvg-id="([^"]+)"/i);

      // Title is after the last comma
      const commaIdx = line.lastIndexOf(",");
      let name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : "Sem Nome";
      if (!name && tvgNameMatch) {
        name = tvgNameMatch[1];
      }

      const logo = logoMatch ? logoMatch[1] : undefined;
      const group = groupMatch ? groupMatch[1].toUpperCase() : "OUTROS";
      const epgId = epgMatch ? epgMatch[1] : undefined;

      currentInfo = {
        id: `item_${Math.random().toString(36).substring(2, 9)}_${i}`,
        name: name || "Conteúdo Sem Nome",
        group: group || "GERAL",
        logo: logo,
        epgId: epgId,
        url: "",
      };
    } else if (line.length > 0 && !line.startsWith("#")) {
      // Stream URL line
      if (currentInfo) {
        currentInfo.url = line;

        // Categorize into Live / Movie / Series
        const upperGroup = currentInfo.group?.toUpperCase() || "";
        const upperName = currentInfo.name?.toUpperCase() || "";

        let type: ContentType = "live";

        if (
          upperGroup.includes("FILME") ||
          upperGroup.includes("MOVIE") ||
          upperGroup.includes("VOD") ||
          upperGroup.includes("CINEMA") ||
          upperGroup.includes("4K FILMES") ||
          line.endsWith(".mp4") ||
          line.endsWith(".mkv") ||
          line.endsWith(".avi")
        ) {
          type = "movie";
        } else if (
          upperGroup.includes("SERIE") ||
          upperGroup.includes("SÉRIE") ||
          upperGroup.includes("SEASON") ||
          upperGroup.includes("NOVELA") ||
          /S\d{1,2}E\d{1,2}/i.test(upperName) ||
          /\d{1,2}x\d{1,2}/i.test(upperName)
        ) {
          type = "series";
        }

        currentInfo.type = type;
        rawItems.push(currentInfo as PlaylistItem);
        currentInfo = null;
      }
    }
  }

  // Separate channels, movies, series
  const channels: PlaylistItem[] = [];
  const movies: PlaylistItem[] = [];
  const seriesMap: Map<string, SeriesGroup> = new Map();

  const channelCategoriesSet = new Set<string>();
  const movieCategoriesSet = new Set<string>();
  const seriesCategoriesSet = new Set<string>();

  for (const item of rawItems) {
    if (item.type === "live") {
      channels.push(item);
      channelCategoriesSet.add(item.group);
    } else if (item.type === "movie") {
      movies.push(item);
      movieCategoriesSet.add(item.group);
    } else {
      // Series grouping logic
      seriesCategoriesSet.add(item.group);

      // Extract series name, season, episode
      let seriesTitle = item.name;
      let seasonNumber = 1;
      let episodeNumber = 1;

      // Pattern like S01E02 or S1E2
      const seMatch = item.name.match(/^(.*?)\s*S(\d{1,2})\s*E(\d{1,2})/i);
      // Pattern like 1x02
      const altMatch = item.name.match(/^(.*?)\s*(\d{1,2})x(\d{1,2})/i);

      if (seMatch) {
        seriesTitle = seMatch[1].trim() || item.name;
        seasonNumber = parseInt(seMatch[2], 10);
        episodeNumber = parseInt(seMatch[3], 10);
      } else if (altMatch) {
        seriesTitle = altMatch[1].trim() || item.name;
        seasonNumber = parseInt(altMatch[2], 10);
        episodeNumber = parseInt(altMatch[3], 10);
      }

      const seriesKey = `${item.group}_${seriesTitle.toLowerCase()}`;

      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          id: `series_${Math.random().toString(36).substring(2, 9)}`,
          name: seriesTitle,
          group: item.group,
          logo: item.logo,
          episodes: [],
          seasonsCount: 1,
        });
      }

      const sGroup = seriesMap.get(seriesKey)!;
      sGroup.episodes.push({
        id: item.id,
        episodeNumber,
        seasonNumber,
        title: item.name,
        url: item.url,
        logo: item.logo || sGroup.logo,
      });

      if (seasonNumber > sGroup.seasonsCount) {
        sGroup.seasonsCount = seasonNumber;
      }
    }
  }

  const series = Array.from(seriesMap.values());

  return {
    totalCount: rawItems.length,
    channelsCount: channels.length,
    moviesCount: movies.length,
    seriesCount: series.length,
    categories: {
      channels: Array.from(channelCategoriesSet).sort(),
      movies: Array.from(movieCategoriesSet).sort(),
      series: Array.from(seriesCategoriesSet).sort(),
    },
    channels,
    movies,
    series,
  };
}

// Fetch and combine all active sources
async function getCombinedContent(): Promise<ParsedM3U> {
  if (cachedParsedData) {
    return cachedParsedData;
  }

  let combinedM3U = "";

  for (const src of store.sources) {
    if (!src.active) continue;

    if (src.type === "raw" && src.content) {
      combinedM3U += "\n" + src.content;
    } else if (src.type === "url" && src.url) {
      try {
        console.log(`Fetching remote M3U URL: ${src.url}`);
        const response = await fetch(src.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IPTV Player Picapau",
          },
        });
        if (response.ok) {
          const text = await response.text();
          combinedM3U += "\n" + text;
        }
      } catch (err) {
        console.error(`Failed to fetch M3U from URL: ${src.url}`, err);
      }
    }
  }

  cachedParsedData = parseM3UContent(combinedM3U);
  return cachedParsedData;
}

// Initialize server
async function startServer() {
  loadServerStore();

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: store.config.appName });
  });

  // Get Public Config & App Info (Downloader Code, Announcement, etc.)
  app.get("/api/config", (req, res) => {
    res.json({
      appName: store.config.appName,
      downloaderCode: store.config.downloaderCode,
      announcement: store.config.announcement,
      allowGuestDemo: store.config.allowGuestDemo,
    });
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { pin } = req.body;
    if (pin === store.config.adminPin) {
      res.json({ success: true, message: "Acesso administrativo concedido." });
    } else {
      res.status(401).json({ success: false, message: "PIN administrativo incorreto." });
    }
  });

  // Admin - Update Config
  app.post("/api/admin/config", (req, res) => {
    const { pin, appName, downloaderCode, adminPin, announcement, allowGuestDemo } = req.body;
    if (pin !== store.config.adminPin) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    if (appName) store.config.appName = appName;
    if (downloaderCode) store.config.downloaderCode = downloaderCode;
    if (adminPin) store.config.adminPin = adminPin;
    if (announcement !== undefined) store.config.announcement = announcement;
    if (allowGuestDemo !== undefined) store.config.allowGuestDemo = allowGuestDemo;

    saveServerStore();
    res.json({ success: true, config: store.config });
  });

  // Admin - Get Sources
  app.get("/api/admin/sources", (req, res) => {
    res.json(store.sources);
  });

  // Admin - Add M3U Source (Link URL or Raw Text)
  app.post("/api/admin/sources", async (req, res) => {
    const { name, type, url, content } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Nome e Tipo são obrigatórios." });
    }

    let itemCount = 0;
    if (type === "raw" && content) {
      const parsed = parseM3UContent(content);
      itemCount = parsed.totalCount;
    } else if (type === "url" && url) {
      try {
        const resp = await fetch(url, { headers: { "User-Agent": "PicapauMediaIPTV" } });
        if (resp.ok) {
          const txt = await resp.text();
          const parsed = parseM3UContent(txt);
          itemCount = parsed.totalCount;
        }
      } catch (err) {
        console.warn("Could not preview remote URL items count:", err);
      }
    }

    const newSource: PlaylistSource = {
      id: `src_${Math.random().toString(36).substring(2, 9)}`,
      name,
      type,
      url,
      content,
      updatedAt: new Date().toISOString(),
      itemCount,
      active: true,
    };

    store.sources.push(newSource);
    saveServerStore();

    res.json({ success: true, source: newSource });
  });

  // Admin - Toggle / Delete Source
  app.put("/api/admin/sources/:id", (req, res) => {
    const { id } = req.params;
    const { active, name, url, content } = req.body;

    const source = store.sources.find((s) => s.id === id);
    if (!source) return res.status(404).json({ error: "Fonte não encontrada." });

    if (active !== undefined) source.active = active;
    if (name) source.name = name;
    if (url !== undefined) source.url = url;
    if (content !== undefined) source.content = content;
    source.updatedAt = new Date().toISOString();

    saveServerStore();
    res.json({ success: true, source });
  });

  app.delete("/api/admin/sources/:id", (req, res) => {
    const { id } = req.params;
    store.sources = store.sources.filter((s) => s.id !== id);
    saveServerStore();
    res.json({ success: true });
  });

  // Admin - Force Sync Content
  app.post("/api/admin/sources/sync", async (req, res) => {
    cachedParsedData = null;
    const content = await getCombinedContent();
    res.json({
      success: true,
      message: "Listas sincronizadas com sucesso!",
      stats: {
        total: content.totalCount,
        channels: content.channelsCount,
        movies: content.moviesCount,
        series: content.seriesCount,
      },
    });
  });

  // Admin - Users CRUD
  app.get("/api/admin/users", (req, res) => {
    res.json(store.users);
  });

  app.post("/api/admin/users", (req, res) => {
    const { username, password, code, name, expiresAt, maxConnections, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome do usuário é obrigatório." });
    }

    // Generate random 6-digit activation code if not provided
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: UserAccount = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      username: username || `user_${randomCode}`,
      password: password || "123456",
      code: code || randomCode,
      name,
      active: true,
      expiresAt: expiresAt || "2028-12-31",
      maxConnections: maxConnections || 2,
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    saveServerStore();

    res.json({ success: true, user: newUser });
  });

  app.put("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    const user = store.users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const { username, password, code, name, active, expiresAt, maxConnections, notes } = req.body;

    if (username !== undefined) user.username = username;
    if (password !== undefined) user.password = password;
    if (code !== undefined) user.code = code;
    if (name !== undefined) user.name = name;
    if (active !== undefined) user.active = active;
    if (expiresAt !== undefined) user.expiresAt = expiresAt;
    if (maxConnections !== undefined) user.maxConnections = maxConnections;
    if (notes !== undefined) user.notes = notes;

    saveServerStore();
    res.json({ success: true, user });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    store.users = store.users.filter((u) => u.id !== id);
    saveServerStore();
    res.json({ success: true });
  });

  // Client Authentication (Login by Code or Username/Password)
  app.post("/api/user/login", (req, res) => {
    const { code, username, password } = req.body;

    let user: UserAccount | undefined;

    if (code) {
      user = store.users.find((u) => u.code.trim() === code.trim());
    } else if (username && password) {
      user = store.users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
    }

    // Demo guest fallback if enabled
    if (!user && store.config.allowGuestDemo && code === "000000") {
      user = {
        id: "usr_guest",
        username: "visitante",
        code: "000000",
        name: "Visitante Demonstrativo",
        active: true,
        expiresAt: "Ilimitado",
        maxConnections: 1,
        createdAt: new Date().toISOString(),
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Código de ativação ou usuário/senha inválidos.",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Esta conta está desativada. Fale com o administrador.",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        code: user.code,
        expiresAt: user.expiresAt,
      },
    });
  });

  // Client Content Endpoint - Fetch parsed playlists
  app.get("/api/content", async (req, res) => {
    try {
      const data = await getCombinedContent();
      res.json(data);
    } catch (err) {
      console.error("Error fetching content:", err);
      res.status(500).json({ error: "Erro ao carregar lista de conteúdo." });
    }
  });

  // Stream Proxy to handle CORS / custom user-agents for external channels
  app.get("/api/stream/proxy", async (req, res) => {
    const streamUrl = req.query.url as string;
    if (!streamUrl) {
      return res.status(400).send("URL parameter is required");
    }

    try {
      const response = await fetch(streamUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", response.headers.get("content-type") || "video/mp2t");

      if (response.body) {
        // @ts-ignore
        const reader = response.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) return res.end();
          res.write(value);
          return pump();
        };
        pump();
      } else {
        res.status(500).send("Stream body empty");
      }
    } catch (err: any) {
      res.status(502).send(`Proxy stream error: ${err.message}`);
    }
  });

  // Optional Gemini AI auto-enrichment endpoint for movie/series metadata (Posters, Synopsis)
  app.post("/api/admin/enrich", async (req, res) => {
    const { title, type } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY não configurada no servidor." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Você é um assistente de banco de dados de cinema e IPTV. Retorne estritamente um JSON válido com informações para o título de ${type === "movie" ? "filme" : "série"}: "${title}".
JSON esperado:
{
  "description": "Sinopse curta em português (máx 180 caracteres)",
  "year": "Ano de lançamento ex: 2023",
  "rating": "Nota ex: 8.5/10",
  "genre": "Gênero principal ex: Ação, Aventura"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const cleanedJson = text.replace(/```json|```/g, "").trim();
      const meta = JSON.parse(cleanedJson);

      res.json({ success: true, metadata: meta });
    } catch (err: any) {
      console.error("Gemini enrichment error:", err);
      res.status(500).json({ error: "Falha ao gerar metadados via IA." });
    }
  });

  // Vite middleware for dev / Static file serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`PICAPAU MEDIA LEVE Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
