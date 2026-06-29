import { Router } from 'express';
import db, { type SongRow } from '../db.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { getPackageById } from '../utils/packages.js';

const router = Router();

interface ChatMessageDto {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
}

const PRODUCTION_START_MESSAGE =
  '좋아! 이제 본격적으로 곡을 만들어볼까?\n어떤 느낌의 곡을 원해? 자유롭게 말해줘!';

function parseMessages(raw: string): ChatMessageDto[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toSongResponse(row: SongRow) {
  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    packageId: row.package_id,
    progress: row.progress,
    step: row.step,
    status: row.status,
    messages: parseMessages(row.messages),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function calcProgress(messageCount: number) {
  return Math.min(90, Math.max(5, messageCount * 8));
}

function calcStep(messageCount: number) {
  if (messageCount <= 2) return '제작 시작';
  if (messageCount <= 4) return '아이디어 수집 중';
  if (messageCount <= 6) return '멜로디 생성 중';
  if (messageCount <= 8) return '보컬 합성 중';
  return '믹싱 중';
}

function createInitialMessages(packageId?: string): ChatMessageDto[] {
  const pkg = packageId ? getPackageById(packageId) : null;
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const text = pkg
    ? `${pkg.title} 패키지로 시작할게!\n${PRODUCTION_START_MESSAGE}`
    : PRODUCTION_START_MESSAGE;

  return [{ id: crypto.randomUUID(), role: 'bot', text, time }];
}

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  const status = req.query.status as string | undefined;
  const rows = db.findSongsByUser(req.user!.userId, status);
  res.json({ songs: rows.map(toSongResponse) });
});

router.get('/:id', (req: AuthRequest, res) => {
  const row = db.findSongById(req.params.id, req.user!.userId);

  if (!row) {
    res.status(404).json({ message: '곡을 찾을 수 없습니다.' });
    return;
  }

  res.json({ song: toSongResponse(row) });
});

router.post('/', (req: AuthRequest, res) => {
  const { packageId, genre, title } = req.body as {
    packageId?: string;
    genre?: string;
    title?: string;
  };

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const messages = createInitialMessages(packageId);

  const song: SongRow = {
    id,
    user_id: req.user!.userId,
    title: title?.trim() || '새로운 곡',
    genre: genre?.trim() || null,
    package_id: packageId || null,
    progress: calcProgress(messages.length),
    step: calcStep(messages.length),
    status: 'in_progress',
    messages: JSON.stringify(messages),
    created_at: now,
    updated_at: now,
  };

  db.insertSong(song);
  res.status(201).json({ song: toSongResponse(song) });
});

router.patch('/:id', (req: AuthRequest, res) => {
  const row = db.findSongById(req.params.id, req.user!.userId);

  if (!row) {
    res.status(404).json({ message: '곡을 찾을 수 없습니다.' });
    return;
  }

  const { title, genre, progress, step, status, messages } = req.body as {
    title?: string;
    genre?: string;
    progress?: number;
    step?: string;
    status?: string;
    messages?: ChatMessageDto[];
  };

  const nextMessages = messages ?? parseMessages(row.messages);
  const messageCount = nextMessages.length;
  const now = new Date().toISOString();

  const updated = db.updateSong(req.params.id, {
    title: title?.trim() ?? row.title,
    genre: genre?.trim() ?? row.genre,
    progress: progress ?? calcProgress(messageCount),
    step: step ?? calcStep(messageCount),
    status: status ?? row.status,
    messages: JSON.stringify(nextMessages),
    updated_at: now,
  });

  res.json({ song: toSongResponse(updated!) });
});

export default router;
