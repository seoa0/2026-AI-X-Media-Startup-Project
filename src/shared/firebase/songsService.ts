import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getPackageById } from '../constants/packages';
import type { ChatMessage } from '../types/chat';
import type { CreateSongRequest, Song, SongStatus, UpdateSongRequest } from '../types/song';
import {
  calcProgress,
  calcStep,
  createInitialTimeline,
  deriveSongFieldsFromMessages,
} from '../utils/songProduction';
import { getFirebaseUser } from './authService';
import { db } from './config';
import { withTimeout } from './withTimeout';

const FIRESTORE_TIMEOUT_MS = 8000;

const PRODUCTION_START_MESSAGE =
  '좋습니다! 이제 본격적으로 곡을 만들어 보겠습니다.\n어떤 느낌의 곡을 원하시나요? 자유롭게 말씀해 주세요!';

function createInitialMessages(packageId?: string): ChatMessage[] {
  const pkg = packageId ? getPackageById(packageId) : null;
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const text = pkg
    ? `${pkg.title} 패키지로 시작하겠습니다!\n${PRODUCTION_START_MESSAGE}`
    : PRODUCTION_START_MESSAGE;

  return [{ id: crypto.randomUUID(), role: 'bot', text, time }];
}

function requireUid() {
  const uid = getFirebaseUser()?.uid;
  if (!uid) throw new Error('auth/user-not-found');
  return uid;
}

function toSong(id: string, data: Record<string, unknown>): Song {
  const style = (data.style as string | null) ?? (data.genre as string | null) ?? null;
  return {
    id,
    title: (data.title as string) ?? '새로운 곡',
    style,
    genre: (data.genre as string | null) ?? style,
    packageId: (data.packageId as string | null) ?? null,
    progress: (data.progress as number) ?? 0,
    step: (data.step as string) ?? '제작 시작',
    status: (data.status as SongStatus) ?? 'in_progress',
    lyrics: (data.lyrics as string | null) ?? null,
    melody: (data.melody as string | null) ?? null,
    timeline: (data.timeline as Song['timeline']) ?? createInitialTimeline(),
    messages: (data.messages as ChatMessage[]) ?? [],
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
  };
}

export async function firebaseListSongs(status?: SongStatus) {
  const uid = requireUid();
  const q = query(collection(db, 'songs'), where('userId', '==', uid));
  const snap = await withTimeout(getDocs(q), FIRESTORE_TIMEOUT_MS);

  let songs = snap.docs
    .map((d) => toSong(d.id, d.data()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (status) {
    songs = songs.filter((s) => s.status === status);
  }

  return songs;
}

export async function firebaseGetSong(id: string) {
  const uid = requireUid();
  const snap = await withTimeout(getDoc(doc(db, 'songs', id)), FIRESTORE_TIMEOUT_MS);
  if (!snap.exists() || snap.data().userId !== uid) {
    throw new Error('not-found');
  }
  return toSong(snap.id, snap.data());
}

export async function firebaseCreateSong(data: CreateSongRequest) {
  const uid = requireUid();
  const now = new Date().toISOString();
  const messages = createInitialMessages(data.packageId);
  const style = data.style?.trim() || data.genre?.trim() || null;
  const timeline = createInitialTimeline();

  const payload = {
    userId: uid,
    title: data.title?.trim() || '새로운 곡',
    style,
    genre: style,
    packageId: data.packageId || null,
    progress: calcProgress(messages.length),
    step: calcStep(messages.length),
    status: 'in_progress' as const,
    lyrics: null,
    melody: null,
    timeline,
    messages,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await withTimeout(addDoc(collection(db, 'songs'), payload), FIRESTORE_TIMEOUT_MS);
  return toSong(ref.id, payload);
}

export async function firebaseUpdateSong(id: string, data: UpdateSongRequest) {
  const uid = requireUid();
  const ref = doc(db, 'songs', id);
  const snap = await withTimeout(getDoc(ref), FIRESTORE_TIMEOUT_MS);

  if (!snap.exists() || snap.data().userId !== uid) {
    throw new Error('not-found');
  }

  const current = snap.data();
  const nextMessages = data.messages ?? (current.messages as ChatMessage[]);
  const derived = deriveSongFieldsFromMessages(nextMessages, {
    lyrics: data.lyrics ?? (current.lyrics as string | null),
    melody: data.melody ?? (current.melody as string | null),
    style: data.style ?? (current.style as string | null) ?? (current.genre as string | null),
    genre: data.genre ?? (current.genre as string | null),
    timeline: data.timeline ?? (current.timeline as Song['timeline']),
  });

  const now = new Date().toISOString();
  const style = data.style?.trim() ?? derived.style ?? current.genre ?? null;

  const patch = {
    title: data.title?.trim() ?? current.title,
    style,
    genre: data.genre?.trim() ?? style,
    progress: data.progress ?? derived.progress,
    step: data.step ?? derived.step,
    status: data.status ?? current.status,
    lyrics: data.lyrics ?? derived.lyrics,
    melody: data.melody ?? derived.melody,
    timeline: data.timeline ?? derived.timeline,
    messages: nextMessages,
    updatedAt: now,
  };

  await withTimeout(updateDoc(ref, patch), FIRESTORE_TIMEOUT_MS);
  return toSong(id, { ...current, ...patch });
}

export async function firebaseDeleteSong(id: string) {
  const uid = requireUid();
  const ref = doc(db, 'songs', id);
  const snap = await withTimeout(getDoc(ref), FIRESTORE_TIMEOUT_MS);

  if (!snap.exists() || snap.data().userId !== uid) {
    throw new Error('not-found');
  }

  await withTimeout(deleteDoc(ref), FIRESTORE_TIMEOUT_MS);
}
