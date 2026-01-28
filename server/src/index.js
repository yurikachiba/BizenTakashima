require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const imageRoutes = require('./routes/images');
const analyticsRoutes = require('./routes/analytics');
const prisma = require('./lib/prisma');
const app = express();
const PORT = process.env.PORT || 3001;

// デフォルト管理者パスワード
const DEFAULT_ADMIN_PASSWORD = 'Qh7A.(LDu%P-';

// Middleware
const allowedOrigins = [];
if (process.env.FRONTEND_URL) {
  // FRONTEND_URL が指定されている場合、www有り/無し両方を許可
  allowedOrigins.push(process.env.FRONTEND_URL);
  const url = process.env.FRONTEND_URL;
  if (url.includes('://www.')) {
    allowedOrigins.push(url.replace('://www.', '://'));
  } else {
    allowedOrigins.push(url.replace('://', '://www.'));
  }
}
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5500',
    'http://localhost:5173',  // Vite dev server
    'http://localhost:4173',  // Vite preview
    'http://localhost:3000',
  );
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // Allow Vercel preview/deployment URLs
    if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parse error:', err.message);
    return res.status(400).json({ error: '不正なJSONフォーマットです' });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORSエラー: このオリジンからのアクセスは許可されていません' });
  }

  // Handle other errors
  console.error('Server error:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// サーバー起動時にデフォルト管理者を自動作成・パスワード同期
async function seedAdmin() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    const existing = await prisma.admin.findFirst();
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.admin.create({ data: { passwordHash } });
      console.log('Default admin created');
    } else {
      const match = await bcrypt.compare(adminPassword, existing.passwordHash);
      if (!match) {
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        await prisma.admin.update({
          where: { id: existing.id },
          data: { passwordHash }
        });
        console.log('Admin password synced to configured default');
      }
    }
  } catch (err) {
    console.error('Admin seed error:', err);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedAdmin();
});

module.exports = { app, prisma };
