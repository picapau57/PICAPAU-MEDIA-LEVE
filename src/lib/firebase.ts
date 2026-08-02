import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  Firestore,
} from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";
import { AppConfig, ParsedM3U, PlaylistSource, UserAccount, PlaylistItem, SeriesGroup } from "../types";

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if present
const databaseId = firebaseConfigJson.firestoreDatabaseId || "(default)";
export const db: Firestore = databaseId && databaseId !== "(default)"
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Collection References
const SOURCES_COL = "sources";
const USERS_COL = "userAccounts";
const CONFIG_DOC = "appConfig/main";
const FAVORITES_COL = "userFavorites";

/**
 * Utility: Remove undefined properties recursively to avoid Firestore invalid data errors
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Sources Management in Firestore
 */
export async function fetchCloudSources(): Promise<PlaylistSource[] | null> {
  try {
    const querySnapshot = await getDocs(collection(db, SOURCES_COL));
    if (querySnapshot.empty) return [];
    const sources: PlaylistSource[] = [];
    querySnapshot.forEach((docSnap) => {
      sources.push(docSnap.data() as PlaylistSource);
    });
    return sources;
  } catch (err) {
    console.warn("Firestore fetchCloudSources warning:", err);
    return null;
  }
}

export async function saveCloudSources(sources: PlaylistSource[]): Promise<boolean> {
  try {
    const cleanSources = sanitizeForFirestore(sources);

    // Clean existing
    const existing = await getDocs(collection(db, SOURCES_COL));
    for (const d of existing.docs) {
      await deleteDoc(d.ref);
    }

    // Save sources
    for (const src of cleanSources) {
      const ref = doc(db, SOURCES_COL, src.id);
      await setDoc(ref, src);
    }

    return true;
  } catch (err) {
    console.error("Firestore saveCloudSources error:", err);
    return false;
  }
}

/**
 * Parsed Content (Channels, Movies, Series) in Firestore with Document Chunking
 */
export async function fetchCloudParsedContent(): Promise<ParsedM3U | null> {
  try {
    const mainDocRef = doc(db, "parsedContent", "main");
    const mainSnap = await getDoc(mainDocRef);
    if (!mainSnap.exists()) return null;

    const mainData = mainSnap.data();
    const channelsChunksCount = mainData.channelsChunksCount || mainData.itemsChunksCount || 0;
    const moviesChunksCount = mainData.moviesChunksCount || 0;
    const seriesChunksCount = mainData.seriesChunksCount || 0;

    // Fetch all chunks in parallel
    const channelsPromises = [];
    for (let i = 0; i < channelsChunksCount; i++) {
      channelsPromises.push(
        getDoc(doc(db, "parsedContent", `channels_${i}`)).catch(() =>
          getDoc(doc(db, "parsedContent", `items_${i}`))
        )
      );
    }

    const moviesPromises = [];
    for (let i = 0; i < moviesChunksCount; i++) {
      moviesPromises.push(getDoc(doc(db, "parsedContent", `movies_${i}`)));
    }

    const seriesPromises = [];
    for (let i = 0; i < seriesChunksCount; i++) {
      seriesPromises.push(getDoc(doc(db, "parsedContent", `series_${i}`)));
    }

    const [channelsSnaps, moviesSnaps, seriesSnaps] = await Promise.all([
      Promise.all(channelsPromises),
      Promise.all(moviesPromises),
      Promise.all(seriesPromises),
    ]);

    let allChannels: PlaylistItem[] = [];
    channelsSnaps.forEach((s) => {
      if (s && s.exists()) {
        const data = s.data();
        if (Array.isArray(data.channels)) {
          allChannels = allChannels.concat(data.channels);
        } else if (Array.isArray(data.items)) {
          allChannels = allChannels.concat(data.items);
        }
      }
    });

    let allMovies: PlaylistItem[] = [];
    moviesSnaps.forEach((s) => {
      if (s && s.exists() && Array.isArray(s.data().movies)) {
        allMovies = allMovies.concat(s.data().movies);
      }
    });

    let allSeries: SeriesGroup[] = [];
    seriesSnaps.forEach((s) => {
      if (s && s.exists() && Array.isArray(s.data().series)) {
        allSeries = allSeries.concat(s.data().series);
      }
    });

    // Fallback if saved in single doc format
    if (allChannels.length === 0 && allMovies.length === 0 && allSeries.length === 0) {
      if (Array.isArray(mainData.channels)) allChannels = mainData.channels;
      if (Array.isArray(mainData.items)) allChannels = mainData.items;
      if (Array.isArray(mainData.movies)) allMovies = mainData.movies;
      if (Array.isArray(mainData.series)) allSeries = mainData.series;
    }

    return {
      updatedAt: mainData.updatedAt || new Date().toISOString(),
      totalCount: mainData.totalCount || (allChannels.length + allMovies.length),
      channelsCount: mainData.channelsCount || allChannels.length,
      moviesCount: mainData.moviesCount || allMovies.length,
      seriesCount: mainData.seriesCount || allSeries.length,
      categories: mainData.categories || { channels: [], movies: [], series: [] },
      channels: allChannels,
      movies: allMovies,
      series: allSeries,
    };
  } catch (err) {
    console.warn("Firestore fetchCloudParsedContent warning:", err);
    return null;
  }
}

export async function saveCloudParsedContent(parsed: ParsedM3U): Promise<boolean> {
  try {
    const cleanParsed: ParsedM3U = sanitizeForFirestore(parsed);

    const CHUNK_SIZE = 250;
    const channels = cleanParsed.channels || [];
    const movies = cleanParsed.movies || [];
    const series = cleanParsed.series || [];

    const channelsChunksCount = Math.ceil(channels.length / CHUNK_SIZE);
    const moviesChunksCount = Math.ceil(movies.length / CHUNK_SIZE);
    const seriesChunksCount = Math.ceil(series.length / CHUNK_SIZE);

    // Main summary doc
    const mainData = {
      updatedAt: cleanParsed.updatedAt || new Date().toISOString(),
      totalCount: cleanParsed.totalCount || 0,
      channelsCount: cleanParsed.channelsCount || 0,
      moviesCount: cleanParsed.moviesCount || 0,
      seriesCount: cleanParsed.seriesCount || 0,
      categories: cleanParsed.categories || { channels: [], movies: [], series: [] },
      channelsChunksCount,
      moviesChunksCount,
      seriesChunksCount,
    };

    await setDoc(doc(db, "parsedContent", "main"), mainData);

    // Save channels chunks
    for (let i = 0; i < channels.length; i += CHUNK_SIZE) {
      const chunk = channels.slice(i, i + CHUNK_SIZE);
      const index = Math.floor(i / CHUNK_SIZE);
      await setDoc(doc(db, "parsedContent", `channels_${index}`), { channels: chunk });
    }

    // Save movies chunks
    for (let i = 0; i < movies.length; i += CHUNK_SIZE) {
      const chunk = movies.slice(i, i + CHUNK_SIZE);
      const index = Math.floor(i / CHUNK_SIZE);
      await setDoc(doc(db, "parsedContent", `movies_${index}`), { movies: chunk });
    }

    // Save series chunks
    for (let i = 0; i < series.length; i += CHUNK_SIZE) {
      const chunk = series.slice(i, i + CHUNK_SIZE);
      const index = Math.floor(i / CHUNK_SIZE);
      await setDoc(doc(db, "parsedContent", `series_${index}`), { series: chunk });
    }

    console.log(`Saved cloud catalog to Firestore: ${movies.length} movies, ${channels.length} channels, ${series.length} series.`);
    return true;
  } catch (err) {
    console.error("Firestore saveCloudParsedContent error:", err);
    return false;
  }
}

/**
 * App Config in Firestore
 */
export async function fetchCloudConfig(): Promise<AppConfig | null> {
  try {
    const docRef = doc(db, CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppConfig;
    }
    return null;
  } catch (err) {
    console.warn("Firestore fetchCloudConfig warning:", err);
    return null;
  }
}

export async function saveCloudConfig(config: AppConfig): Promise<boolean> {
  try {
    const cleanConfig = sanitizeForFirestore(config);
    const docRef = doc(db, CONFIG_DOC);
    await setDoc(docRef, cleanConfig);
    return true;
  } catch (err) {
    console.error("Firestore saveCloudConfig error:", err);
    return false;
  }
}

/**
 * User Accounts in Firestore
 */
export async function fetchCloudUsers(): Promise<UserAccount[] | null> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COL));
    if (querySnapshot.empty) return null;
    const users: UserAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserAccount);
    });
    return users;
  } catch (err) {
    console.warn("Firestore fetchCloudUsers warning:", err);
    return null;
  }
}

export async function saveCloudUsers(users: UserAccount[]): Promise<boolean> {
  try {
    const cleanUsers = sanitizeForFirestore(users);

    const existing = await getDocs(collection(db, USERS_COL));
    for (const d of existing.docs) {
      await deleteDoc(d.ref);
    }

    for (const usr of cleanUsers) {
      const ref = doc(db, USERS_COL, usr.id);
      await setDoc(ref, usr);
    }

    return true;
  } catch (err) {
    console.error("Firestore saveCloudUsers error:", err);
    return false;
  }
}

/**
 * User Favorites per User Code
 */
export async function fetchCloudFavorites(userCode: string): Promise<string[] | null> {
  if (!userCode) return null;
  try {
    const docRef = doc(db, FAVORITES_COL, userCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return (docSnap.data()?.favoriteIds as string[]) || [];
    }
    return null;
  } catch (err) {
    console.warn("Firestore fetchCloudFavorites warning:", err);
    return null;
  }
}

export async function saveCloudFavorites(userCode: string, favoriteIds: string[]): Promise<boolean> {
  if (!userCode) return false;
  try {
    const docRef = doc(db, FAVORITES_COL, userCode);
    await setDoc(docRef, { userCode, favoriteIds, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error("Firestore saveCloudFavorites error:", err);
    return false;
  }
}

