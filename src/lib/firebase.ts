import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  writeBatch,
  Firestore,
} from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";
import { AppConfig, ParsedM3U, PlaylistSource, UserAccount } from "../types";

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
const PARSED_CONTENT_DOC = "parsedContent/main";
const FAVORITES_COL = "userFavorites";

/**
 * Sources Management in Firestore
 */
export async function fetchCloudSources(): Promise<PlaylistSource[] | null> {
  try {
    const querySnapshot = await getDocs(collection(db, SOURCES_COL));
    if (querySnapshot.empty) return null;
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
    const batch = writeBatch(db);
    // Delete old docs if any
    const existing = await getDocs(collection(db, SOURCES_COL));
    existing.forEach((d) => batch.delete(d.ref));

    // Write new sources
    sources.forEach((src) => {
      const ref = doc(db, SOURCES_COL, src.id);
      batch.set(ref, src);
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error("Firestore saveCloudSources error:", err);
    return false;
  }
}

/**
 * Parsed Content (Channels, Movies, Series) in Firestore
 */
export async function fetchCloudParsedContent(): Promise<ParsedM3U | null> {
  try {
    const docRef = doc(db, PARSED_CONTENT_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ParsedM3U;
    }
    return null;
  } catch (err) {
    console.warn("Firestore fetchCloudParsedContent warning:", err);
    return null;
  }
}

export async function saveCloudParsedContent(parsed: ParsedM3U): Promise<boolean> {
  try {
    const docRef = doc(db, PARSED_CONTENT_DOC);
    await setDoc(docRef, parsed);
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
    const docRef = doc(db, CONFIG_DOC);
    await setDoc(docRef, config);
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
    const batch = writeBatch(db);
    const existing = await getDocs(collection(db, USERS_COL));
    existing.forEach((d) => batch.delete(d.ref));

    users.forEach((usr) => {
      const ref = doc(db, USERS_COL, usr.id);
      batch.set(ref, usr);
    });

    await batch.commit();
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
