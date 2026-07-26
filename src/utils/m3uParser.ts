import { ParsedM3U, PlaylistItem, ContentType, SeriesGroup, PlaylistSource } from "../types";

export function normalizeUrl(url: string): string {
  let trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "http://" + trimmed;
  }
  return trimmed;
}

export function parseM3UContent(m3uText: string): ParsedM3U {
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

      let seriesTitle = item.name;
      let seasonNumber = 1;
      let episodeNumber = 1;

      const seMatch = item.name.match(/^(.*?)\s*S(\d{1,2})\s*E(\d{1,2})/i);
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

export async function fetchM3UTextClient(url: string, timeoutMs: number = 10000): Promise<string | null> {
  const targetUrl = normalizeUrl(url);
  if (!targetUrl) return null;

  // Attempt 1: Direct Fetch
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (resp.ok) {
      const txt = await resp.text();
      if (txt && (txt.includes("#EXTM3U") || txt.includes("#EXTINF:"))) {
        return txt;
      }
    }
  } catch (err) {
    console.warn("Direct fetch failed for M3U URL, trying CORS proxy...", err);
  }

  // Attempt 2: CORS Proxy 1 (allorigins)
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (resp.ok) {
      const txt = await resp.text();
      if (txt && (txt.includes("#EXTM3U") || txt.includes("#EXTINF:") || txt.length > 50)) {
        return txt;
      }
    }
  } catch (err) {
    console.warn("Proxy 1 failed:", err);
  }

  // Attempt 3: CORS Proxy 2 (corsproxy.io)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (resp.ok) {
      const txt = await resp.text();
      if (txt) return txt;
    }
  } catch (err) {
    console.warn("Proxy 2 failed:", err);
  }

  return null;
}

export async function syncClientSources(sources: PlaylistSource[]): Promise<ParsedM3U> {
  let combined = "";

  for (const src of sources) {
    if (!src.active) continue;

    if (src.type === "raw" && src.content) {
      combined += "\n" + src.content;
    } else if (src.type === "url" && src.url) {
      const txt = await fetchM3UTextClient(src.url);
      if (txt) {
        combined += "\n" + txt;
      }
    }
  }

  const parsed = parseM3UContent(combined);
  try {
    localStorage.setItem("picapau_cached_content", JSON.stringify(parsed));
  } catch {
    // quota handled
  }
  return parsed;
}
