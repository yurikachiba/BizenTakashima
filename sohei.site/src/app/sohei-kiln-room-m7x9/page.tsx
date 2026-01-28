import type { Metadata } from 'next';
import AdminPageClient from './AdminPageClient';

export const metadata: Metadata = {
  title: '管理パネル',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageClient />;
}
