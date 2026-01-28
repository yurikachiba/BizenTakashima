const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'), false);
    }
  }
});

// GET /api/images/:page - List image keys for a page (public)
router.get('/:page', async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      where: { page: req.params.page },
      select: { key: true }
    });
    res.json({ keys: images.map(img => img.key) });
  } catch (err) {
    console.error('Get image keys error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// GET /api/images/:page/:key - Serve image binary (public)
router.get('/:page/:key', async (req, res) => {
  try {
    const image = await prisma.image.findUnique({
      where: { page_key: { page: req.params.page, key: req.params.key } }
    });
    if (!image) {
      return res.status(404).json({ error: '画像が見つかりません' });
    }
    const buffer = Buffer.from(image.data, 'base64');
    res.set('Content-Type', image.mimeType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    console.error('Get image error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// PUT /api/images/:page/:key - Upload/update image (admin only)
router.put('/:page/:key', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像ファイルが必要です' });
    }
    const { page, key } = req.params;
    const data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    await prisma.image.upsert({
      where: { page_key: { page, key } },
      update: { data, mimeType },
      create: { page, key, data, mimeType }
    });

    res.json({ message: '画像を保存しました' });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// DELETE /api/images/:page/:key - Delete image (admin only)
router.delete('/:page/:key', authenticateToken, async (req, res) => {
  try {
    await prisma.image.delete({
      where: { page_key: { page: req.params.page, key: req.params.key } }
    });
    res.json({ message: '画像を削除しました' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: '画像が見つかりません' });
    }
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
