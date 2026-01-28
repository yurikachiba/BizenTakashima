const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/content - Get all content (public)
router.get('/', async (req, res) => {
  try {
    const contents = await prisma.content.findMany({
      orderBy: [{ page: 'asc' }, { key: 'asc' }]
    });

    // Group by page
    const grouped = {};
    for (const item of contents) {
      if (!grouped[item.page]) {
        grouped[item.page] = {};
      }
      grouped[item.page][item.key] = item.value;
    }

    res.json(grouped);
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// GET /api/content/:page - Get content for a specific page (public)
router.get('/:page', async (req, res) => {
  try {
    const contents = await prisma.content.findMany({
      where: { page: req.params.page }
    });

    const result = {};
    for (const item of contents) {
      result[item.key] = item.value;
    }

    res.json(result);
  } catch (err) {
    console.error('Get page content error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// PUT /api/content/:page - Update content for a page (admin only)
router.put('/:page', authenticateToken, async (req, res) => {
  try {
    const { page } = req.params;
    const data = req.body;

    const entries = Object.entries(data);
    if (entries.length === 0) {
      return res.json({ message: '保存するコンテンツがありません' });
    }

    // Try interactive transaction first, fall back to individual upserts on connection error
    try {
      await prisma.$transaction(
        async (tx) => {
          for (const [key, value] of entries) {
            await tx.content.upsert({
              where: { page_key: { page, key } },
              update: { value: String(value) },
              create: { page, key, value: String(value) }
            });
          }
        },
        { timeout: 30000, maxWait: 10000 }
      );
      return res.json({ message: `${page}のコンテンツを保存しました` });
    } catch (txErr) {
      console.warn('Transaction save failed, retrying with individual upserts:', txErr);
    }

    // Fallback: reconnect and save entries individually
    try { await prisma.$disconnect(); } catch { /* ignore */ }

    for (const [key, value] of entries) {
      await prisma.content.upsert({
        where: { page_key: { page, key } },
        update: { value: String(value) },
        create: { page, key, value: String(value) }
      });
    }

    res.json({ message: `${page}のコンテンツを保存しました` });
  } catch (err) {
    console.error('Update content error:', err);
    const detail = err instanceof Error ? err.message : undefined;
    res.status(500).json({ error: 'コンテンツの保存中にエラーが発生しました', detail });
  }
});

// POST /api/content/import - Import all content from JSON (admin only)
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const data = req.body;

    const allEntries = [];
    for (const [page, entries] of Object.entries(data)) {
      for (const [key, value] of Object.entries(entries)) {
        allEntries.push({ page, key, value: String(value) });
      }
    }

    // Try interactive transaction first, fall back to individual upserts on connection error
    try {
      await prisma.$transaction(
        async (tx) => {
          for (const { page, key, value } of allEntries) {
            await tx.content.upsert({
              where: { page_key: { page, key } },
              update: { value },
              create: { page, key, value }
            });
          }
        },
        { timeout: 60000, maxWait: 10000 }
      );
      return res.json({ message: 'コンテンツをインポートしました', count: allEntries.length });
    } catch (txErr) {
      console.warn('Transaction import failed, retrying with individual upserts:', txErr);
    }

    // Fallback: reconnect and save entries individually
    try { await prisma.$disconnect(); } catch { /* ignore */ }

    for (const { page, key, value } of allEntries) {
      await prisma.content.upsert({
        where: { page_key: { page, key } },
        update: { value },
        create: { page, key, value }
      });
    }

    res.json({ message: 'コンテンツをインポートしました', count: allEntries.length });
  } catch (err) {
    console.error('Import content error:', err);
    const detail = err instanceof Error ? err.message : undefined;
    res.status(500).json({ error: 'インポート中にエラーが発生しました', detail });
  }
});

// DELETE /api/content - Clear all content (admin only)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await prisma.content.deleteMany();
    res.json({ message: '全コンテンツを削除しました', count: result.count });
  } catch (err) {
    console.error('Delete content error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
