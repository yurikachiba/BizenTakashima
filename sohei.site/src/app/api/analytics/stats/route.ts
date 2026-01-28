import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const days = parseInt(request.nextUrl.searchParams.get('days') || '7');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalVisits = await prisma.visitorLog.count({
      where: { createdAt: { gte: since } },
    });

    const uniqueIPs = await prisma.visitorLog.findMany({
      where: { createdAt: { gte: since }, ipAddress: { not: null } },
      distinct: ['ipAddress'],
      select: { ipAddress: true },
    });
    const uniqueVisitors = uniqueIPs.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayVisits = await prisma.visitorLog.count({
      where: { createdAt: { gte: todayStart } },
    });

    const byPage = await prisma.visitorLog.groupBy({
      by: ['page'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { id: 'desc' } },
    });

    const logs = await prisma.visitorLog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, page: true },
    });

    const daily: Record<string, Record<string, number>> = {};
    for (const log of logs) {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      if (!daily[dateKey]) daily[dateKey] = { total: 0 };
      if (!daily[dateKey][log.page]) daily[dateKey][log.page] = 0;
      daily[dateKey][log.page]++;
      daily[dateKey].total++;
    }

    const referrerLogs = await prisma.visitorLog.findMany({
      where: { createdAt: { gte: since }, referrer: { not: null } },
      select: { referrer: true },
    });
    const referrerCounts: Record<string, number> = {};
    for (const log of referrerLogs) {
      const ref = log.referrer || '(direct)';
      if (!referrerCounts[ref]) referrerCounts[ref] = 0;
      referrerCounts[ref]++;
    }
    const directCount = await prisma.visitorLog.count({
      where: {
        createdAt: { gte: since },
        OR: [{ referrer: null }, { referrer: '' }],
      },
    });
    if (directCount > 0) {
      referrerCounts['(direct)'] = directCount;
    }
    const referrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const deviceLogs = await prisma.visitorLog.findMany({
      where: { createdAt: { gte: since }, userAgent: { not: null } },
      select: { userAgent: true, screenSize: true },
    });
    const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
    const browserCounts: Record<string, number> = {};
    for (const log of deviceLogs) {
      const ua = (log.userAgent || '').toLowerCase();
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
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    const screenCounts: Record<string, number> = {};
    for (const log of deviceLogs) {
      if (log.screenSize) {
        if (!screenCounts[log.screenSize]) screenCounts[log.screenSize] = 0;
        screenCounts[log.screenSize]++;
      }
    }
    const screens = Object.entries(screenCounts)
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const contentCount = await prisma.content.count();
    const lastUpdated = await prisma.content.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      todayVisits,
      byPage: byPage.map((p: { page: string; _count: { id: number } }) => ({ page: p.page, count: p._count.id })),
      daily,
      referrers,
      devices: deviceCounts,
      browsers,
      screens,
      contentStats: {
        totalEntries: contentCount,
        lastUpdated: lastUpdated?.updatedAt || null,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
