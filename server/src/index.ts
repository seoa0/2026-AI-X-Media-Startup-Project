import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import songsRoutes from './routes/songs.js';
import { ensureDemoUser } from './seed.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

ensureDemoUser();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
