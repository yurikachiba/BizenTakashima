import { prisma, ensureConnection } from './prisma';

export interface ContentData {
  [key: string]: string;
}

export interface ImageKeysData {
  keys: string[];
}

/**
 * Server Component用: ページのコンテンツを取得
 * キャッシュ付きでデータベースから直接取得
 */
export async function getPageContent(pageName: string): Promise<ContentData> {
  try {
    await ensureConnection();
    const contents = await prisma.content.findMany({
      where: { page: pageName },
    });

    const result: ContentData = {};
    for (const item of contents) {
      result[item.key] = item.value;
    }
    return result;
  } catch (err) {
    console.error(`Failed to fetch content for page "${pageName}":`, err);
    return {};
  }
}

/**
 * Server Component用: ページのカスタム画像キーリストを取得
 */
export async function getPageImageKeys(pageName: string): Promise<string[]> {
  try {
    await ensureConnection();
    const images = await prisma.image.findMany({
      where: { page: pageName },
      select: { key: true },
    });
    return images.map((img: { key: string }) => img.key);
  } catch (err) {
    console.error(`Failed to fetch image keys for page "${pageName}":`, err);
    return [];
  }
}

/**
 * 複数ページのコンテンツを一括取得（将来の拡張用）
 */
export async function getMultiPageContent(pageNames: string[]): Promise<Record<string, ContentData>> {
  try {
    await ensureConnection();
    const contents = await prisma.content.findMany({
      where: { page: { in: pageNames } },
    });

    const result: Record<string, ContentData> = {};
    for (const pageName of pageNames) {
      result[pageName] = {};
    }
    for (const item of contents) {
      if (!result[item.page]) {
        result[item.page] = {};
      }
      result[item.page][item.key] = item.value;
    }
    return result;
  } catch (err) {
    console.error('Failed to fetch multi-page content:', err);
    return {};
  }
}
