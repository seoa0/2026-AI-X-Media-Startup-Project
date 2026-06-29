/**
 * DB에 테스트 계정을 직접 넣는 스크립트
 *
 * 사용법:
 *   cd server
 *   npm run seed -- your@email.com yourpassword
 *
 * 또는:
 *   EMAIL=your@email.com PASSWORD=yourpassword npm run seed
 */
import bcrypt from 'bcryptjs';
import db from '../src/db.js';

const email = (process.argv[2] ?? process.env.EMAIL ?? 'test@test.com').trim().toLowerCase();
const password = process.argv[3] ?? process.env.PASSWORD ?? 'test1234';

if (password.length < 8) {
  console.error('비밀번호는 8자 이상이어야 합니다.');
  process.exit(1);
}

if (db.findUserByEmail(email)) {
  console.log(`이미 등록된 이메일입니다: ${email}`);
  process.exit(0);
}

const id = crypto.randomUUID();
const now = new Date().toISOString();
const passwordHash = bcrypt.hashSync(password, 10);

db.insertUser({
  id,
  email,
  password_hash: passwordHash,
  onboarding_data: null,
  created_at: now,
});

console.log('계정이 등록되었습니다.');
console.log(`  이메일: ${email}`);
console.log(`  비밀번호: ${password}`);
console.log(`  user id: ${id}`);
console.log('\n데이터 파일: server/data/db.json');
console.log('서버 실행: cd server && npm run dev');
console.log('프론트 실행: npm run dev (프로젝트 루트)');
