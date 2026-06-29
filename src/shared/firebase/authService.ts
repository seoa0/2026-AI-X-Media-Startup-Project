import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from '../types/user';
import { auth, db } from './config';
import { withTimeout } from './withTimeout';

const FIRESTORE_TIMEOUT_MS = 8000;

let authReady = false;
let cachedUser: FirebaseUser | null = auth.currentUser;

export function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    cachedUser = user;
    authReady = true;
  });
}

export function getFirebaseUser() {
  return cachedUser ?? auth.currentUser;
}

export function isFirebaseLoggedIn() {
  return Boolean(getFirebaseUser());
}

export function waitForAuthInit(): Promise<FirebaseUser | null> {
  if (authReady) return Promise.resolve(cachedUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      cachedUser = user;
      authReady = true;
      resolve(user);
    });
  });
}

function buildUser(uid: string, email: string, data?: Record<string, unknown>): User {
  return {
    id: uid,
    name: (data?.name as string) ?? email.split('@')[0],
    email,
    onboarding: (data?.onboarding as Record<string, unknown> | null) ?? null,
    createdAt: (data?.createdAt as string) ?? new Date().toISOString(),
  };
}

async function fetchUserProfile(uid: string, email: string): Promise<User> {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, 'users', uid)),
      FIRESTORE_TIMEOUT_MS,
    );
    if (snap.exists()) {
      return buildUser(uid, email, snap.data());
    }
    return buildUser(uid, email);
  } catch {
    return buildUser(uid, email);
  }
}

async function saveUserDoc(
  uid: string,
  email: string,
  fields: { name?: string; onboarding?: unknown } = {},
) {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    email: email.trim().toLowerCase(),
    updatedAt: now,
    ...fields,
  };
  if (fields.name) payload.name = fields.name.trim();

  await withTimeout(
    setDoc(doc(db, 'users', uid), payload, { merge: true }),
    FIRESTORE_TIMEOUT_MS,
  );
}

export async function firebaseLogin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const normalizedEmail = credential.user.email ?? email.trim().toLowerCase();

  try {
    await saveUserDoc(credential.user.uid, normalizedEmail);
  } catch {
    // 프로필 문서 저장 실패해도 로그인은 성공 처리
  }

  const user = await fetchUserProfile(credential.user.uid, normalizedEmail);
  return { user };
}

export async function firebaseSignup(email: string, password: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const now = new Date().toISOString();

  try {
    await withTimeout(
      setDoc(doc(db, 'users', credential.user.uid), {
        name: trimmedName,
        email: normalizedEmail,
        onboarding: null,
        createdAt: now,
        updatedAt: now,
      }),
      FIRESTORE_TIMEOUT_MS,
    );
  } catch {
    // Firestore 미생성 시에도 Auth 가입은 완료됨
  }

  return {
    user: buildUser(credential.user.uid, normalizedEmail, {
      name: trimmedName,
      onboarding: null,
      createdAt: now,
    }),
  };
}

export async function firebaseLogout() {
  await signOut(auth);
}

export async function firebaseMe() {
  const fbUser = getFirebaseUser();
  if (!fbUser?.email) throw new Error('auth/user-not-found');
  const user = await fetchUserProfile(fbUser.uid, fbUser.email);
  return { user };
}

export async function firebaseSyncOnboarding(onboarding: Record<string, unknown>) {
  const fbUser = getFirebaseUser();
  if (!fbUser?.email) throw new Error('auth/user-not-found');

  try {
    await withTimeout(
      updateDoc(doc(db, 'users', fbUser.uid), { onboarding, updatedAt: new Date().toISOString() }),
      FIRESTORE_TIMEOUT_MS,
    );
  } catch {
    try {
      await saveUserDoc(fbUser.uid, fbUser.email, { onboarding });
    } catch {
      // Firestore 실패 시 로컬 온보딩만 유지
    }
  }

  const user = await fetchUserProfile(fbUser.uid, fbUser.email);
  return { user };
}
