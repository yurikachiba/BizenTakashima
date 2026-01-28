'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import '@/styles/admin/admin.css';

const API_BASE = '';

interface AnalyticsStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  byPage: { page: string; count: number }[];
  daily: Record<string, Record<string, number>>;
  referrers: { referrer: string; count: number }[];
  devices: { mobile: number; tablet: number; desktop: number };
  browsers: { browser: string; count: number }[];
  screens: { size: string; count: number }[];
  contentStats: { totalEntries: number; lastUpdated: string | null };
}

type PageTab = 'dashboard' | 'index' | 'work' | 'production' | 'interview' | 'artist' | 'settings';

const PAGE_NAMES: Record<string, string> = {
  index: 'トップページ',
  work: '作品紹介',
  production: '制作の様子',
  interview: 'インタビュー',
  artist: '作家紹介',
};

const PAGE_CONTENT_KEYS: Record<string, string[]> = {
  index: [
    'index.heading_philosophy',
    'index.philosophy',
    'index.heading_work',
    'index.work_intro',
    'index.heading_production',
    'index.production_intro',
    'index.heading_interview',
    'index.interview_intro',
    'index.heading_artist',
    'index.artist_intro',
    'index.heading_stores',
    'index.store_0_name',
    'index.store_1_name',
    'index.store_2_name',
    'index.heading_exhibitions',
    'index.exhibition_0_name',
    'index.exhibition_1_name',
    'index.exhibition_2_name',
    'index.exhibition_3_name',
    'index.heading_contact',
    'index.contact_text',
    'index.copyright',
  ],
  work: [
    'work.heading_h1',
    'work.heading_list',
    'work.caption_0',
    'work.caption_1',
    'work.caption_2',
    'work.caption_3',
    'work.caption_4',
    'work.caption_5',
    'work.caption_6',
    'work.caption_7',
    'work.caption_8',
    'work.heading_features',
    'work.features',
    'work.heading_new_attempts',
    'work.new_attempts',
    'work.heading_faq',
    'work.faq_q_0',
    'work.faq_0',
    'work.faq_q_1',
    'work.faq_1',
    'work.faq_q_2',
    'work.faq_2',
    'work.faq_q_3',
    'work.faq_3',
    'work.faq_q_4',
    'work.faq_4',
    'work.faq_q_5',
    'work.faq_5',
  ],
  production: [
    'production.heading_h1',
    'production.heading_h2',
    'production.byline',
    'production.intro',
    'production.step_0',
    'production.step_1',
    'production.step_2',
    'production.step_3',
    'production.step_4',
    'production.step_5',
    'production.step_6',
    'production.step_7',
    'production.step_8',
    'production.step_9',
    'production.step_10',
    'production.step_11',
    'production.step_12',
    'production.step_13',
    'production.step_14',
    'production.step_15',
    'production.step_16',
  ],
  interview: [
    'interview.heading_h1',
    'interview.q_0',
    'interview.a_0',
    'interview.q_1',
    'interview.a_1',
    'interview.q_2',
    'interview.a_2',
    'interview.q_3',
    'interview.a_3',
    'interview.q_4',
    'interview.a_4',
    'interview.q_5',
    'interview.a_5',
  ],
  artist: [
    'artist.heading_h1',
    'artist.heading_profile',
    'artist.profile',
    'artist.quote',
    'artist.heading_timeline',
    'artist.timeline_0',
    'artist.timeline_1',
    'artist.timeline_2',
    'artist.timeline_3',
    'artist.timeline_4',
    'artist.timeline_5',
    'artist.timeline_6',
  ],
};

const PAGE_IMAGE_KEYS: Record<string, string[]> = {
  index: [
    'index.philosophy_image',
    'index.work_image',
    'index.production_image',
    'index.interview_image',
    'index.artist_image',
  ],
  work: [
    'work.top_image',
    'work.image_0',
    'work.image_1',
    'work.image_2',
    'work.image_3',
    'work.image_4',
    'work.image_5',
    'work.image_6',
    'work.image_7',
    'work.image_8',
  ],
  production: Array.from({ length: 18 }, (_, i) => `production.image_${i}`),
  interview: ['interview.top_image'],
  artist: ['artist.top_image'],
};

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export default function AdminPageClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [editedContent, setEditedContent] = useState<Record<string, Record<string, string>>>({});
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(7);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tokenRef = useRef<string>('');

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokenRef.current}`,
      },
    });
  }, []);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/content`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        setEditedContent(JSON.parse(JSON.stringify(data)));
      }
    } catch {
      /* silent */
    }
  }, []);

  const loadAnalytics = useCallback(
    async (days: number) => {
      try {
        const res = await fetchWithAuth(`/api/analytics/stats?days=${days}`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsStats(data);
        }
      } catch {
        /* silent */
      }
    },
    [fetchWithAuth],
  );

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) {
      tokenRef.current = saved;
      fetch(`${API_BASE}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((res) => {
          if (res.ok) {
            setAuthenticated(true);
            loadContent();
          } else {
            sessionStorage.removeItem('admin_token');
          }
        })
        .catch(() => sessionStorage.removeItem('admin_token'));
    }
  }, [loadContent]);

  useEffect(() => {
    if (authenticated) loadAnalytics(analyticsPeriod);
  }, [authenticated, analyticsPeriod, loadAnalytics]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        tokenRef.current = data.token;
        sessionStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
        loadContent();
      } else {
        showToast(data.error || 'ログイン失敗', 'error');
      }
    } catch {
      showToast('サーバーに接続できません', 'error');
    }
  };

  const handleLogout = () => {
    tokenRef.current = '';
    sessionStorage.removeItem('admin_token');
    setAuthenticated(false);
  };

  const handleContentChange = (page: string, key: string, value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [page]: { ...prev[page], [key]: value },
    }));
  };

  const handleSave = async (page: string) => {
    try {
      const res = await fetchWithAuth(`/api/content/${page}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContent[page] || {}),
      });
      if (res.ok) {
        showToast(`${PAGE_NAMES[page]}を保存しました`);
        loadContent();
      } else {
        showToast('保存に失敗しました', 'error');
      }
    } catch {
      showToast('サーバーエラー', 'error');
    }
  };

  const handleReset = (page: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [page]: { ...(content[page] || {}) },
    }));
    showToast('変更をリセットしました');
  };

  const handleImageUpload = async (page: string, key: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetchWithAuth(`/api/images/${page}/${key}`, {
        method: 'PUT',
        body: formData,
      });
      if (res.ok) {
        showToast('画像を保存しました');
      } else {
        showToast('画像の保存に失敗しました', 'error');
      }
    } catch {
      showToast('サーバーエラー', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    try {
      const res = await fetchWithAuth('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('パスワードを変更しました');
        form.reset();
      } else {
        showToast(data.error || '変更に失敗しました', 'error');
      }
    } catch {
      showToast('サーバーエラー', 'error');
    }
  };

  if (!authenticated) {
    return (
      <div id="auth-overlay">
        <div className="auth-box">
          <div className="auth-title">管理パネル</div>
          <div className="auth-subtitle">sohei-portfolio.com</div>
          <form id="auth-form" onSubmit={handleLogin}>
            <input type="password" name="password" className="auth-input" placeholder="パスワードを入力" required />
            <button type="submit" className="auth-btn">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    const stats = analyticsStats;
    return (
      <div className="tab-content">
        <div className="page-title">ダッシュボード</div>
        <div className="dashboard-section">
          <div className="section-title">概要</div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">最終更新</div>
              <div className="stat-value">
                {stats?.contentStats?.lastUpdated
                  ? new Date(stats.contentStats.lastUpdated).toLocaleDateString('ja-JP')
                  : '-'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">コンテンツ数</div>
              <div className="stat-value">{stats?.contentStats?.totalEntries || 0}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-title">アクセス解析</div>
          <div className="analytics-period-selector">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                className={`admin-btn btn-secondary analytics-period-btn ${analyticsPeriod === d ? 'active' : ''}`}
                onClick={() => setAnalyticsPeriod(d)}
              >
                {d}日間
              </button>
            ))}
          </div>
          {stats && (
            <>
              <div className="analytics-summary-grid">
                <div className="analytics-summary-card">
                  <div className="analytics-summary-label">合計アクセス</div>
                  <div className="analytics-summary-value">{stats.totalVisits}</div>
                </div>
                <div className="analytics-summary-card">
                  <div className="analytics-summary-label">ユニーク訪問者</div>
                  <div className="analytics-summary-value">{stats.uniqueVisitors}</div>
                </div>
                <div className="analytics-summary-card">
                  <div className="analytics-summary-label">本日</div>
                  <div className="analytics-summary-value">{stats.todayVisits}</div>
                </div>
              </div>

              <div className="analytics-chart-container" style={{ marginTop: '16px', marginBottom: '16px' }}>
                <div className="analytics-sub-title">日別アクセス</div>
                <div className="daily-chart">
                  {Object.entries(stats.daily)
                    .sort()
                    .slice(-analyticsPeriod)
                    .map(([date, data]) => {
                      const maxVal = Math.max(...Object.values(stats.daily).map((d) => d.total || 0), 1);
                      return (
                        <div key={date} className="chart-bar-row">
                          <span className="chart-date">{date.slice(5)}</span>
                          <div className="chart-bar-track">
                            <div className="chart-bar-fill" style={{ width: `${(data.total / maxVal) * 100}%` }}></div>
                          </div>
                          <span className="chart-count">{data.total}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="visitor-stats" style={{ marginBottom: '16px' }}>
                <div className="analytics-sub-title">ページ別</div>
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>ページ</th>
                      <th>アクセス数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byPage.map((p) => (
                      <tr key={p.page}>
                        <td>{p.page}</td>
                        <td className="num">{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="visitor-stats" style={{ marginBottom: '16px' }}>
                <div className="analytics-sub-title">デバイス</div>
                <div className="device-bars">
                  {Object.entries(stats.devices).map(([device, count]) => {
                    const total = stats.devices.mobile + stats.devices.tablet + stats.devices.desktop;
                    return (
                      <div key={device} className="device-bar-row">
                        <span className="device-label">
                          {device === 'mobile' ? 'モバイル' : device === 'tablet' ? 'タブレット' : 'デスクトップ'}
                        </span>
                        <div className="device-bar-track">
                          <div
                            className="device-bar-fill"
                            style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="device-count">
                          {count} ({total ? Math.round((count / total) * 100) : 0}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="visitor-stats">
                <div className="analytics-sub-title">ブラウザ</div>
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>ブラウザ</th>
                      <th>アクセス数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.browsers.map((b) => (
                      <tr key={b.browser}>
                        <td>{b.browser}</td>
                        <td className="num">{b.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderEditor = (page: string) => {
    const keys = PAGE_CONTENT_KEYS[page] || [];
    const imageKeys = PAGE_IMAGE_KEYS[page] || [];
    const pageContent = editedContent[page] || {};

    return (
      <div className="tab-content">
        <div className="page-title">{PAGE_NAMES[page]} 編集</div>
        <div className="editor-actions">
          <button className="admin-btn btn-primary" onClick={() => handleSave(page)}>
            保存
          </button>
          <button className="admin-btn btn-secondary" onClick={() => handleReset(page)}>
            リセット
          </button>
        </div>

        {imageKeys.length > 0 && (
          <div className="editor-section image-section">
            <div className="editor-label">画像</div>
            <div className="image-editors-grid">
              {imageKeys.map((key) => (
                <div key={key} className="image-editor-item">
                  <div className="image-editor-label">{key}</div>
                  <div className="image-preview-wrapper">
                    <span className="image-placeholder">画像</span>
                  </div>
                  <div className="image-editor-actions">
                    <label className="admin-btn btn-secondary image-upload-label">
                      アップロード
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(key.split('.')[0], key, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="editor-sections">
          {keys.map((key) => {
            const value = pageContent[key] || '';
            const isLong =
              key.includes('philosophy') ||
              key.includes('features') ||
              key.includes('new_attempts') ||
              key.includes('step_') ||
              key.includes('intro') ||
              key.includes('.a_') ||
              (key.includes('faq_') && !key.includes('faq_q_')) ||
              key.includes('quote') ||
              key.includes('profile');
            return (
              <div key={key} className="editor-section">
                <div className="editor-label">{key}</div>
                {isLong ? (
                  <textarea
                    className={`editor-textarea ${value !== (content[page]?.[key] || '') ? 'modified' : ''}`}
                    rows={4}
                    value={value}
                    onChange={(e) => handleContentChange(page, key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className={`editor-input ${value !== (content[page]?.[key] || '') ? 'modified' : ''}`}
                    value={value}
                    onChange={(e) => handleContentChange(page, key, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="tab-content">
      <div className="page-title">設定</div>
      <div className="editor-section">
        <div className="editor-label">パスワード変更</div>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            name="currentPassword"
            className="settings-input"
            placeholder="現在のパスワード"
            required
          />
          <input
            type="password"
            name="newPassword"
            className="settings-input"
            placeholder="新しいパスワード"
            required
          />
          <div className="settings-actions">
            <button type="submit" className="admin-btn btn-primary">
              変更する
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const navItems: { tab: PageTab; label: string; icon: string }[] = [
    { tab: 'dashboard', label: 'ダッシュボード', icon: '■' },
    { tab: 'index', label: 'トップページ', icon: '◆' },
    { tab: 'work', label: '作品紹介', icon: '◆' },
    { tab: 'production', label: '制作の様子', icon: '◆' },
    { tab: 'interview', label: 'インタビュー', icon: '◆' },
    { tab: 'artist', label: '作家紹介', icon: '◆' },
    { tab: 'settings', label: '設定', icon: '⚙' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <span className="mobile-title">管理パネル</span>
      </div>
      <div className="admin-app">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">管理パネル</div>
            <div className="sidebar-site">sohei-portfolio.com</div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">メニュー</div>
            {navItems.slice(0, 1).map((item) => (
              <button
                key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="nav-divider"></div>
            <div className="nav-label">ページ編集</div>
            {navItems.slice(1, 6).map((item) => (
              <button
                key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="nav-divider"></div>
            {navItems.slice(6).map((item) => (
              <button
                key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </aside>
        <div className="main-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab !== 'dashboard' && activeTab !== 'settings' && renderEditor(activeTab)}
        </div>
      </div>
    </>
  );
}
