require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// デフォルト管理者パスワード
const DEFAULT_ADMIN_PASSWORD = 'Qh7A.(LDu%P-';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// サーバー起動時にデフォルト管理者を自動作成
async function seedAdmin() {
  try {
    const existing = await prisma.admin.findFirst();
    if (!existing) {
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      await prisma.admin.create({ data: { passwordHash } });
      console.log('Default admin created');
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
