import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'db.json');

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  onboarding_data: string | null;
  created_at: string;
}

export interface SongRow {
  id: string;
  user_id: string;
  title: string;
  genre: string | null;
  package_id: string | null;
  progress: number;
  step: string;
  status: string;
  messages: string;
  created_at: string;
  updated_at: string;
}

interface Database {
  users: UserRow[];
  songs: SongRow[];
}

const EMPTY_DB: Database = { users: [], songs: [] };

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function load(): Database {
  if (!fs.existsSync(dbPath)) {
    save(EMPTY_DB);
    return { ...EMPTY_DB, users: [], songs: [] };
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(raw) as Database;
    return {
      users: parsed.users ?? [],
      songs: parsed.songs ?? [],
    };
  } catch {
    return { users: [], songs: [] };
  }
}

function save(data: Database) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  findUserByEmail(email: string) {
    return load().users.find((u) => u.email === email);
  },

  findUserById(id: string) {
    return load().users.find((u) => u.id === id);
  },

  insertUser(user: UserRow) {
    const data = load();
    data.users.push(user);
    save(data);
  },

  updateUserOnboarding(id: string, onboardingData: string) {
    const data = load();
    const user = data.users.find((u) => u.id === id);
    if (!user) return;
    user.onboarding_data = onboardingData;
    save(data);
  },

  findSongsByUser(userId: string, status?: string) {
    let songs = load().songs.filter((s) => s.user_id === userId);
    if (status) songs = songs.filter((s) => s.status === status);
    return songs.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  findSongById(id: string, userId: string) {
    return load().songs.find((s) => s.id === id && s.user_id === userId);
  },

  insertSong(song: SongRow) {
    const data = load();
    data.songs.push(song);
    save(data);
  },

  updateSong(id: string, patch: Partial<SongRow>) {
    const data = load();
    const song = data.songs.find((s) => s.id === id);
    if (!song) return null;
    Object.assign(song, patch);
    save(data);
    return song;
  },
};

export default db;
