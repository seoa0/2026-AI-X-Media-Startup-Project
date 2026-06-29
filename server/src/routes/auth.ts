import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db, { type UserRow } from '../db.js';
import { signToken, authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

function toUserResponse(row: UserRow) {
  let onboarding = null;
  if (row.onboarding_data) {
    try {
      onboarding = JSON.parse(row.onboarding_data);
    } catch {
      onboarding = null;
    }
  }
  return {
    id: row.id,
    email: row.email,
    onboarding,
    createdAt: row.created_at,
  };
}

router.post('/signup', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' });
    return;
  }

  const normalized = email.trim().toLowerCase();
  if (db.findUserByEmail(normalized)) {
    res.status(409).json({ message: '이미 가입된 이메일입니다.' });
    return;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(password, 10);

  const user: UserRow = {
    id,
    email: normalized,
    password_hash: passwordHash,
    onboarding_data: null,
    created_at: now,
  };
  db.insertUser(user);

  const token = signToken({ userId: id, email: normalized });
  res.status(201).json({ token, user: toUserResponse(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    return;
  }

  const user = db.findUserByEmail(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: toUserResponse(user) });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.findUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    return;
  }
  res.json({ user: toUserResponse(user) });
});

router.patch('/me/onboarding', authMiddleware, (req: AuthRequest, res) => {
  const { onboarding } = req.body as { onboarding?: Record<string, unknown> };
  if (!onboarding || typeof onboarding !== 'object') {
    res.status(400).json({ message: '온보딩 데이터가 필요합니다.' });
    return;
  }

  db.updateUserOnboarding(req.user!.userId, JSON.stringify(onboarding));
  const user = db.findUserById(req.user!.userId)!;
  res.json({ user: toUserResponse(user) });
});

export default router;
