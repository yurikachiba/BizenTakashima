const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

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

    const operations = Object.entries(data).map(([key, value]) =>
      prisma.content.upsert({
        where: { page_key: { page, key } },
        update: { value: String(value) },
        create: { page, key, value: String(value) }
      })
    );

    await prisma.$transaction(operations);
    res.json({ message: `${page}のコンテンツを保存しました` });
  } catch (err) {
    console.error('Update content error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// POST /api/content/import - Import all content from JSON (admin only)
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const data = req.body;

    const operations = [];
    for (const [page, entries] of Object.entries(data)) {
      for (const [key, value] of Object.entries(entries)) {
        operations.push(
          prisma.content.upsert({
            where: { page_key: { page, key } },
            update: { value: String(value) },
            create: { page, key, value: String(value) }
          })
        );
      }
    }

    await prisma.$transaction(operations);
    res.json({ message: 'コンテンツをインポートしました', count: operations.length });
  } catch (err) {
    console.error('Import content error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
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
