const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/analytics/log - Log a page visit (public)
router.post('/log', async (req, res) => {
  try {
    const { page } = req.body;
    if (!page) {
      return res.status(400).json({ error: 'ページ名が必要です' });
    }

    await prisma.visitorLog.create({
      data: {
        page,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null
      }
    });

    res.json({ message: 'ok' });
  } catch (err) {
    console.error('Log visit error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// GET /api/analytics/stats - Get visitor stats (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total visits in period
    const totalVisits = await prisma.visitorLog.count({
      where: { createdAt: { gte: since } }
    });

    // Visits grouped by page
    const byPage = await prisma.visitorLog.groupBy({
      by: ['page'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { id: 'desc' } }
    });

    // Daily visits
    const logs = await prisma.visitorLog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, page: true }
    });

    const daily = {};
    for (const log of logs) {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      if (!daily[dateKey]) daily[dateKey] = {};
      if (!daily[dateKey][log.page]) daily[dateKey][log.page] = 0;
      daily[dateKey][log.page]++;
    }

    // Content stats
    const contentCount = await prisma.content.count();
    const lastUpdated = await prisma.content.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    res.json({
      totalVisits,
      byPage: byPage.map(p => ({ page: p.page, count: p._count.id })),
      daily,
      contentStats: {
        totalEntries: contentCount,
        lastUpdated: lastUpdated?.updatedAt || null
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
