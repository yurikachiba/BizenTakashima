const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, getJwtSecret } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'パスワードが必要です' });
    }

    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.status(401).json({ error: '管理者が設定されていません' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'パスワードが正しくありません' });
    }

    const token = jwt.sign({ adminId: admin.id }, getJwtSecret(), { expiresIn: '30m' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '現在のパスワードと新しいパスワードが必要です' });
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    if (!admin) {
      return res.status(404).json({ error: '管理者が見つかりません' });
    }

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: '現在のパスワードが正しくありません' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: req.adminId },
      data: { passwordHash }
    });

    res.json({ message: 'パスワードを変更しました' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// POST /api/auth/setup - Initial admin setup (only works if no admin exists)
router.post('/setup', async (req, res) => {
  try {
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return res.status(400).json({ error: '管理者は既に設定されています' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'パスワードが必要です' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({ data: { passwordHash } });

    res.json({ message: '管理者を作成しました' });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// GET /api/auth/verify - Verify token is valid
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

module.exports = router;
