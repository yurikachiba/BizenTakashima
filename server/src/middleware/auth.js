const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET環境変数が設定されていません');
  }
  return secret;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    if (err.message === 'JWT_SECRET環境変数が設定されていません') {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'サーバー設定エラー' });
    }
    return res.status(403).json({ error: 'トークンが無効です' });
  }
}

module.exports = { authenticateToken, getJwtSecret };
