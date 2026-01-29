const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/analytics/log - Log a page visit (public)
router.post('/log', async (req, res) => {
  try {
    const { page, referrer, screenSize, language } = req.body;
    if (!page) {
      return res.status(400).json({ error: 'ページ名が必要です' });
    }

    await prisma.visitorLog.create({
      data: {
        page,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        referrer: referrer || null,
        screenSize: screenSize || null,
        language: language || null
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

    // Calculate previous period for comparison
    const prevSince = new Date();
    prevSince.setDate(prevSince.getDate() - days * 2);
    const prevEnd = new Date();
    prevEnd.setDate(prevEnd.getDate() - days);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    // Run all DB queries in parallel for better performance
    const [
      totalVisits,
      prevTotalVisits,
      uniqueIPs,
      prevUniqueIPs,
      todayVisits,
      yesterdayVisits,
      byPage,
      logs,
      referrerLogs,
      directCount,
      deviceLogs,
      languageLogs,
      contentCount,
      lastUpdated
    ] = await Promise.all([
      // Total visits in period
      prisma.visitorLog.count({
        where: { createdAt: { gte: since } }
      }),
      // Previous period total visits
      prisma.visitorLog.count({
        where: { createdAt: { gte: prevSince, lt: prevEnd } }
      }),
      // Unique visitors (by IP)
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: since }, ipAddress: { not: null } },
        distinct: ['ipAddress'],
        select: { ipAddress: true }
      }),
      // Previous period unique visitors
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: prevSince, lt: prevEnd }, ipAddress: { not: null } },
        distinct: ['ipAddress'],
        select: { ipAddress: true }
      }),
      // Today's visits
      prisma.visitorLog.count({
        where: { createdAt: { gte: todayStart } }
      }),
      // Yesterday's visits
      prisma.visitorLog.count({
        where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } }
      }),
      // Visits grouped by page
      prisma.visitorLog.groupBy({
        by: ['page'],
        _count: { id: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { id: 'desc' } }
      }),
      // Daily visits
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, page: true }
      }),
      // Referrer logs
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: since }, referrer: { not: null } },
        select: { referrer: true }
      }),
      // Direct visits count
      prisma.visitorLog.count({
        where: {
          createdAt: { gte: since },
          OR: [{ referrer: null }, { referrer: '' }]
        }
      }),
      // Device logs
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: since }, userAgent: { not: null } },
        select: { userAgent: true, screenSize: true }
      }),
      // Language logs
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: since }, language: { not: null } },
        select: { language: true }
      }),
      // Content stats
      prisma.content.count(),
      prisma.content.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    const uniqueVisitors = uniqueIPs.length;
    const prevUniqueVisitors = prevUniqueIPs.length;
    const avgVisitsPerDay = days > 0 ? Math.round(totalVisits / days) : 0;

    // Process hourly stats
    const hourly = Array(24).fill(0);
    for (const log of logs) {
      const hour = log.createdAt.getHours();
      hourly[hour]++;
    }

    // Process language stats
    const languageCounts = {};
    for (const log of languageLogs) {
      const lang = log.language || 'unknown';
      if (!languageCounts[lang]) languageCounts[lang] = 0;
      languageCounts[lang]++;
    }
    const languages = Object.entries(languageCounts)
      .map(function (entry) { return { language: entry[0], count: entry[1] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 10);

    // Process daily stats
    const daily = {};
    for (const log of logs) {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      if (!daily[dateKey]) daily[dateKey] = { total: 0 };
      if (!daily[dateKey][log.page]) daily[dateKey][log.page] = 0;
      daily[dateKey][log.page]++;
      daily[dateKey].total++;
    }

    // Process referrer stats
    const referrerCounts = {};
    for (const log of referrerLogs) {
      const ref = log.referrer || '(direct)';
      if (!referrerCounts[ref]) referrerCounts[ref] = 0;
      referrerCounts[ref]++;
    }
    if (directCount > 0) {
      referrerCounts['(direct)'] = directCount;
    }
    const referrers = Object.entries(referrerCounts)
      .map(function (entry) { return { referrer: entry[0], count: entry[1] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 20);

    // Process device stats
    const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
    const browserCounts = {};
    for (const log of deviceLogs) {
      const ua = log.userAgent.toLowerCase();
      if (/mobile|android.*mobile|iphone|ipod/.test(ua)) {
        deviceCounts.mobile++;
      } else if (/tablet|ipad|android(?!.*mobile)/.test(ua)) {
        deviceCounts.tablet++;
      } else {
        deviceCounts.desktop++;
      }
      let browser = 'Other';
      if (/edg/i.test(ua)) browser = 'Edge';
      else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
      else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
      else if (/firefox/i.test(ua)) browser = 'Firefox';
      else if (/opera|opr/i.test(ua)) browser = 'Opera';
      if (!browserCounts[browser]) browserCounts[browser] = 0;
      browserCounts[browser]++;
    }
    const browsers = Object.entries(browserCounts)
      .map(function (entry) { return { browser: entry[0], count: entry[1] }; })
      .sort(function (a, b) { return b.count - a.count; });

    // Process screen size stats
    const screenCounts = {};
    for (const log of deviceLogs) {
      if (log.screenSize) {
        if (!screenCounts[log.screenSize]) screenCounts[log.screenSize] = 0;
        screenCounts[log.screenSize]++;
      }
    }
    const screens = Object.entries(screenCounts)
      .map(function (entry) { return { size: entry[0], count: entry[1] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 10);

    res.json({
      totalVisits,
      prevTotalVisits,
      uniqueVisitors,
      prevUniqueVisitors,
      todayVisits,
      yesterdayVisits,
      avgVisitsPerDay,
      byPage: byPage.map(function (p) { return { page: p.page, count: p._count.id }; }),
      daily,
      hourly,
      referrers,
      devices: deviceCounts,
      browsers,
      screens,
      languages,
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
