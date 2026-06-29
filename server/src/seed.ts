import bcrypt from 'bcryptjs';
import db from './db.js';

const DEMO_EMAIL = 'test@test.com';
const DEMO_PASSWORD = 'test1234';

export function ensureDemoUser() {
  if (db.findUserByEmail(DEMO_EMAIL)) return;

  const now = new Date().toISOString();
  db.insertUser({
    id: crypto.randomUUID(),
    email: DEMO_EMAIL,
    password_hash: bcrypt.hashSync(DEMO_PASSWORD, 10),
    onboarding_data: JSON.stringify({
      complete: true,
      introChatComplete: true,
      selectedGenre: 'K-POP',
    }),
    created_at: now,
  });

  console.log(`[seed] 테스트 계정 생성: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}
