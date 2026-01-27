import '../../styles/admin/admin.css';
import { SOHEI_API } from '../api-config.js';

/* ============================================
   管理者パネル メインスクリプト
   バックエンドAPI対応版 (Prisma + Render.com)
   ============================================ */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
let authToken = null;

// ============================================
// API通信
// ============================================

function apiUrl(path) {
    return SOHEI_API.getUrl(path);
}

async function apiFetch(path, options) {
    const opts = options || {};
    if (!opts.headers) opts.headers = {};
    opts.headers['Content-Type'] = 'application/json';
    if (authToken) {
        opts.headers['Authorization'] = 'Bearer ' + authToken;
    }
    const res = await fetch(apiUrl(path), opts);
    if (res.status === 401 || res.status === 403) {
        logout();
        showToast('セッションが無効です。再ログインしてください', 'error');
        throw new Error('Unauthorized');
    }
    return res;
}

// ============================================
// ユーティリティ
// ============================================

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || '');
    toast.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
        toast.hidden = true;
    }, 3000);
}

function formatDate(date) {
    const d = new Date(date);
    return d.getFullYear() + '/' +
        String(d.getMonth() + 1).padStart(2, '0') + '/' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// 認証 (JWT + バックエンドAPI)
// ============================================

async function authenticate(password) {
    try {
        const res = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (!res.ok) {
            try {
                const errData = await res.json();
                return { success: false, error: errData.error || 'ログインに失敗しました' };
            } catch {
                return { success: false, error: 'ログインに失敗しました（ステータス: ' + res.status + '）' };
            }
        }

        const data = await res.json();
        authToken = data.token;
        sessionStorage.setItem('sohei-admin-token', authToken);
        sessionStorage.setItem('sohei-admin-activity', Date.now().toString());
        return { success: true };
    } catch (e) {
        console.error('Auth error:', e);
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
            return { success: false, error: 'サーバーに接続できません。APIサーバー（ポート3001）が起動しているか確認してください。\nCORSエラーの可能性もあります。ブラウザのコンソールを確認してください。' };
        }
        return { success: false, error: 'サーバーとの通信中にエラーが発生しました: ' + e.message };
    }
}

function isAuthenticated() {
    if (!authToken) {
        authToken = sessionStorage.getItem('sohei-admin-token');
    }
    if (!authToken) return false;

    const lastActivity = parseInt(sessionStorage.getItem('sohei-admin-activity') || '0');
    if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout();
        return false;
    }
    return true;
}

function refreshActivity() {
    sessionStorage.setItem('sohei-admin-activity', Date.now().toString());
}

function logout() {
    authToken = null;
    sessionStorage.removeItem('sohei-admin-token');
    sessionStorage.removeItem('sohei-admin-activity');
    document.getElementById('auth-overlay').hidden = false;
    document.getElementById('admin-app').hidden = true;
}

// ============================================
// コンテンツ管理 (バックエンドAPI)
// ============================================

async function loadAllContent() {
    try {
        const res = await apiFetch('/api/content');
        if (!res.ok) return {};
        return await res.json();
    } catch {
        return {};
    }
}

async function savePageContent(pageId) {
    const textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
    const pageData = {};
    textareas.forEach(function (ta) {
        const key = ta.getAttribute('data-key');
        if (key) {
            pageData[key] = ta.value;
        }
    });

    try {
        const res = await apiFetch('/api/content/' + pageId, {
            method: 'PUT',
            body: JSON.stringify(pageData)
        });

        if (res.ok) {
            updateDashboardStats();
            showToast(getPageLabel(pageId) + ' を保存しました', 'success');

            // 変更マーカーをリセット
            textareas.forEach(function (ta) {
                ta.classList.remove('modified');
                ta.setAttribute('data-original', ta.value);
            });
        } else {
            showToast('保存に失敗しました', 'error');
        }
    } catch {
        showToast('サーバーとの通信に失敗しました', 'error');
    }
}

async function loadPageContent(pageId) {
    try {
        const res = await apiFetch('/api/content/' + pageId);
        if (!res.ok) return;
        const pageData = await res.json();

        const textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
        textareas.forEach(function (ta) {
            const key = ta.getAttribute('data-key');
            if (key && pageData[key] !== undefined) {
                ta.value = pageData[key];
            }
            ta.setAttribute('data-original', ta.value);
        });
    } catch {
        // API不可の場合はローカルの初期値のまま
    }
}

function resetPageContent(pageId) {
    const textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
    textareas.forEach(function (ta) {
        const original = ta.getAttribute('data-original');
        if (original !== null) {
            ta.value = original;
            ta.classList.remove('modified');
        }
    });
    showToast('変更を元に戻しました', '');
}

function getPageLabel(pageId) {
    const labels = {
        index: 'トップページ',
        workIntroduction: '作品紹介',
        productionProcess: '制作の様子',
        interview: 'インタビュー',
        artistIntroduction: '作家紹介'
    };
    return labels[pageId] || pageId;
}

// ============================================
// エクスポート / インポート
// ============================================

async function exportJSON() {
    try {
        const data = await loadAllContent();
        if (Object.keys(data).length === 0) {
            showToast('保存済みのコンテンツがありません', 'error');
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('content.json をダウンロードしました', 'success');
    } catch {
        showToast('エクスポートに失敗しました', 'error');
    }
}

async function importJSON(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = JSON.parse(e.target.result);

            const res = await apiFetch('/api/content/import', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                // 現在表示中のタブを再読み込み
                const activeTab = document.querySelector('.nav-item.active');
                if (activeTab) {
                    const tabId = activeTab.getAttribute('data-tab');
                    await loadPageContent(tabId);
                }
                updateDashboardStats();
                showToast('コンテンツをインポートしました', 'success');
            } else {
                showToast('インポートに失敗しました', 'error');
            }
        } catch {
            showToast('JSONファイルの読み込みに失敗しました', 'error');
        }
    };
    reader.readAsText(file);
}

async function clearAllContent() {
    if (!confirm('全てのコンテンツ編集データを削除しますか？\nこの操作は取り消せません。')) return;

    try {
        const res = await apiFetch('/api/content', { method: 'DELETE' });
        if (res.ok) {
            updateDashboardStats();
            showToast('全コンテンツを削除しました', '');
            location.reload();
        } else {
            showToast('削除に失敗しました', 'error');
        }
    } catch {
        showToast('サーバーとの通信に失敗しました', 'error');
    }
}

// ============================================
// パスワード変更
// ============================================

async function changePassword() {
    const currentPassEl = document.getElementById('current-password');
    const currentPass = currentPassEl ? currentPassEl.value : '';
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('new-password-confirm').value;

    if (!newPass || newPass.length < 4) {
        showToast('パスワードは4文字以上にしてください', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        showToast('パスワードが一致しません', 'error');
        return;
    }

    try {
        const res = await apiFetch('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: currentPass,
                newPassword: newPass
            })
        });

        if (res.ok) {
            if (currentPassEl) currentPassEl.value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('new-password-confirm').value = '';
            showToast('パスワードを変更しました', 'success');
        } else {
            const data = await res.json();
            showToast(data.error || 'パスワード変更に失敗しました', 'error');
        }
    } catch {
        showToast('サーバーとの通信に失敗しました', 'error');
    }
}

// ============================================
// ダッシュボード統計 (バックエンドAPI)
// ============================================

async function updateDashboardStats() {
    try {
        const res = await apiFetch('/api/analytics/stats?days=7');
        if (!res.ok) return;
        const stats = await res.json();

        // コンテンツ統計
        document.getElementById('edited-pages').textContent =
            stats.contentStats.totalEntries + ' エントリ';

        if (stats.contentStats.lastUpdated) {
            document.getElementById('last-updated').textContent =
                formatDate(stats.contentStats.lastUpdated);
        }

        const modeEl = document.getElementById('storage-mode');
        modeEl.textContent = 'PostgreSQL + Prisma';
        modeEl.style.color = '#4caf50';

        // 訪問者ログ
        loadVisitorStats(stats);
    } catch {
        // API不可の場合は既定値のまま
    }
}

function loadVisitorStats(stats) {
    const container = document.getElementById('visitor-stats');
    if (!stats || !stats.byPage || stats.byPage.length === 0) return;

    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="border-bottom:1px solid var(--border);">';
    html += '<th style="text-align:left;padding:8px;font-size:13px;color:var(--text-muted);">ページ</th>';
    html += '<th style="text-align:right;padding:8px;font-size:13px;color:var(--text-muted);">過去7日間PV</th>';
    html += '</tr>';

    stats.byPage.forEach(function (entry) {
        html += '<tr style="border-bottom:1px solid rgba(42,63,85,0.5);">';
        html += '<td style="padding:8px;font-size:14px;">' + escapeHtml(entry.page) + '</td>';
        html += '<td style="text-align:right;padding:8px;font-size:14px;font-weight:700;">' + entry.count + '</td>';
        html += '</tr>';
    });

    html += '<tr>';
    html += '<td style="padding:8px;font-size:14px;font-weight:700;">合計</td>';
    html += '<td style="text-align:right;padding:8px;font-size:14px;font-weight:700;">' + stats.totalVisits + '</td>';
    html += '</tr>';
    html += '</table>';

    container.innerHTML = html;
}

// ============================================
// タブナビゲーション
// ============================================

function switchTab(tabId) {
    // ナビ項目を更新
    document.querySelectorAll('.nav-item').forEach(function (item) {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    // タブコンテンツを更新
    document.querySelectorAll('.tab-content').forEach(function (tab) {
        tab.hidden = tab.id !== 'tab-' + tabId;
        if (tab.id === 'tab-' + tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // コンテンツを読み込み
    if (tabId !== 'dashboard' && tabId !== 'settings') {
        loadPageContent(tabId);
    }

    if (tabId === 'dashboard') {
        updateDashboardStats();
    }

    // モバイルでサイドバーを閉じる
    closeMobileSidebar();

    refreshActivity();
}

// ============================================
// モバイルメニュー
// ============================================

function openMobileSidebar() {
    document.querySelector('.sidebar').classList.add('open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay active';
        overlay.addEventListener('click', closeMobileSidebar);
        document.body.appendChild(overlay);
    } else {
        overlay.classList.add('active');
    }
}

function closeMobileSidebar() {
    document.querySelector('.sidebar').classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

// ============================================
// 変更検知
// ============================================

function setupChangeDetection() {
    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('editor-textarea')) {
            const original = e.target.getAttribute('data-original') || '';
            if (e.target.value !== original) {
                e.target.classList.add('modified');
            } else {
                e.target.classList.remove('modified');
            }
            refreshActivity();
        }
    });
}

// ============================================
// 非アクティブ検出
// ============================================

function startInactivityCheck() {
    setInterval(function () {
        if (isAuthenticated()) {
            // 引き続き有効
        } else if (authToken) {
            // タイムアウト
            logout();
            showToast('セッションがタイムアウトしました', 'error');
        }
    }, 60 * 1000); // 1分ごとにチェック
}

// ============================================
// イベントバインド
// ============================================

function bindEvents() {
    // 認証フォーム
    document.getElementById('auth-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const password = document.getElementById('auth-password').value;
        authenticate(password).then(function (result) {
            if (result.success) {
                document.getElementById('auth-overlay').hidden = true;
                document.getElementById('admin-app').hidden = false;
                document.getElementById('auth-error').hidden = true;
                document.getElementById('auth-password').value = '';
                updateDashboardStats();
            } else {
                const errorEl = document.getElementById('auth-error');
                errorEl.textContent = result.error;
                errorEl.hidden = false;
            }
        });
    });

    // ログアウト
    document.getElementById('logout-btn').addEventListener('click', logout);

    // タブナビゲーション
    document.querySelectorAll('.nav-item').forEach(function (item) {
        item.addEventListener('click', function () {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    // 保存ボタン
    document.querySelectorAll('.save-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            savePageContent(this.getAttribute('data-page'));
        });
    });

    // リセットボタン
    document.querySelectorAll('.reset-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            resetPageContent(this.getAttribute('data-page'));
        });
    });

    // モバイルメニュー
    document.getElementById('mobile-menu-btn').addEventListener('click', openMobileSidebar);

    // エクスポート
    document.getElementById('export-json-btn').addEventListener('click', exportJSON);

    // インポート
    document.getElementById('import-json-input').addEventListener('change', function (e) {
        if (e.target.files[0]) {
            importJSON(e.target.files[0]);
            e.target.value = '';
        }
    });

    // 全削除
    document.getElementById('clear-content-btn').addEventListener('click', clearAllContent);

    // パスワード変更
    document.getElementById('change-password-btn').addEventListener('click', changePassword);

    // アクティビティ追跡
    document.addEventListener('click', refreshActivity);
    document.addEventListener('keydown', refreshActivity);
}

// ============================================
// 初期化
// ============================================

async function init() {
    bindEvents();
    setupChangeDetection();
    startInactivityCheck();

    // 認証状態チェック（トークンの有効性をサーバーに確認）
    if (isAuthenticated()) {
        try {
            const res = await apiFetch('/api/auth/verify');
            if (res.ok) {
                document.getElementById('auth-overlay').hidden = true;
                document.getElementById('admin-app').hidden = false;
                updateDashboardStats();
            } else {
                logout();
            }
        } catch {
            logout();
        }
    }

    // 全テキストエリアの初期値を保存
    document.querySelectorAll('.editor-textarea').forEach(function (ta) {
        ta.setAttribute('data-original', ta.value);
    });
}

// DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
