'use strict';

/* ============================================
   管理者パネル メインスクリプト
   バックエンドAPI対応版 (Prisma + Render.com)
   ============================================ */

(function () {

    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
    let authToken = null;

    // ============================================
    // API通信
    // ============================================

    function apiUrl(path) {
        if (typeof SOHEI_API !== 'undefined') {
            return SOHEI_API.getUrl(path);
        }
        return 'http://localhost:3001' + path;
    }

    async function apiFetch(path, options) {
        var opts = options || {};
        if (!opts.headers) opts.headers = {};
        opts.headers['Content-Type'] = 'application/json';
        if (authToken) {
            opts.headers['Authorization'] = 'Bearer ' + authToken;
        }
        var res = await fetch(apiUrl(path), opts);
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
        var toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast ' + (type || '');
        toast.hidden = false;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () {
            toast.hidden = true;
        }, 3000);
    }

    function formatDate(date) {
        var d = new Date(date);
        return d.getFullYear() + '/' +
            String(d.getMonth() + 1).padStart(2, '0') + '/' +
            String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================
    // 認証 (JWT + バックエンドAPI)
    // ============================================

    async function authenticate(password) {
        try {
            var res = await fetch(apiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });

            if (!res.ok) return false;

            var data = await res.json();
            authToken = data.token;
            sessionStorage.setItem('sohei-admin-token', authToken);
            sessionStorage.setItem('sohei-admin-activity', Date.now().toString());
            return true;
        } catch (e) {
            console.error('Auth error:', e);
            return false;
        }
    }

    function isAuthenticated() {
        if (!authToken) {
            authToken = sessionStorage.getItem('sohei-admin-token');
        }
        if (!authToken) return false;

        var lastActivity = parseInt(sessionStorage.getItem('sohei-admin-activity') || '0');
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
            var res = await apiFetch('/api/content');
            if (!res.ok) return {};
            return await res.json();
        } catch (e) {
            return {};
        }
    }

    async function savePageContent(pageId) {
        var textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
        var pageData = {};
        textareas.forEach(function (ta) {
            var key = ta.getAttribute('data-key');
            if (key) {
                pageData[key] = ta.value;
            }
        });

        try {
            var res = await apiFetch('/api/content/' + pageId, {
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
        } catch (e) {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
    }

    async function loadPageContent(pageId) {
        try {
            var res = await apiFetch('/api/content/' + pageId);
            if (!res.ok) return;
            var pageData = await res.json();

            var textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
            textareas.forEach(function (ta) {
                var key = ta.getAttribute('data-key');
                if (key && pageData[key] !== undefined) {
                    ta.value = pageData[key];
                }
                ta.setAttribute('data-original', ta.value);
            });
        } catch (e) {
            // API不可の場合はローカルの初期値のまま
        }
    }

    function resetPageContent(pageId) {
        var textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
        textareas.forEach(function (ta) {
            var original = ta.getAttribute('data-original');
            if (original !== null) {
                ta.value = original;
                ta.classList.remove('modified');
            }
        });
        showToast('変更を元に戻しました', '');
    }

    function getPageLabel(pageId) {
        var labels = {
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
            var data = await loadAllContent();
            if (Object.keys(data).length === 0) {
                showToast('保存済みのコンテンツがありません', 'error');
                return;
            }
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'content.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('content.json をダウンロードしました', 'success');
        } catch (e) {
            showToast('エクスポートに失敗しました', 'error');
        }
    }

    async function importJSON(file) {
        var reader = new FileReader();
        reader.onload = async function (e) {
            try {
                var data = JSON.parse(e.target.result);

                var res = await apiFetch('/api/content/import', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    // 現在表示中のタブを再読み込み
                    var activeTab = document.querySelector('.nav-item.active');
                    if (activeTab) {
                        var tabId = activeTab.getAttribute('data-tab');
                        await loadPageContent(tabId);
                    }
                    updateDashboardStats();
                    showToast('コンテンツをインポートしました', 'success');
                } else {
                    showToast('インポートに失敗しました', 'error');
                }
            } catch (err) {
                showToast('JSONファイルの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }

    async function clearAllContent() {
        if (!confirm('全てのコンテンツ編集データを削除しますか？\nこの操作は取り消せません。')) return;

        try {
            var res = await apiFetch('/api/content', { method: 'DELETE' });
            if (res.ok) {
                updateDashboardStats();
                showToast('全コンテンツを削除しました', '');
                location.reload();
            } else {
                showToast('削除に失敗しました', 'error');
            }
        } catch (e) {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
    }

    // ============================================
    // パスワード変更
    // ============================================

    async function changePassword() {
        var currentPassEl = document.getElementById('current-password');
        var currentPass = currentPassEl ? currentPassEl.value : '';
        var newPass = document.getElementById('new-password').value;
        var confirmPass = document.getElementById('new-password-confirm').value;

        if (!newPass || newPass.length < 4) {
            showToast('パスワードは4文字以上にしてください', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showToast('パスワードが一致しません', 'error');
            return;
        }

        try {
            var res = await apiFetch('/api/auth/change-password', {
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
                var data = await res.json();
                showToast(data.error || 'パスワード変更に失敗しました', 'error');
            }
        } catch (e) {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
    }

    // ============================================
    // ダッシュボード統計 (バックエンドAPI)
    // ============================================

    async function updateDashboardStats() {
        try {
            var res = await apiFetch('/api/analytics/stats?days=7');
            if (!res.ok) return;
            var stats = await res.json();

            // コンテンツ統計
            document.getElementById('edited-pages').textContent =
                stats.contentStats.totalEntries + ' エントリ';

            if (stats.contentStats.lastUpdated) {
                document.getElementById('last-updated').textContent =
                    formatDate(stats.contentStats.lastUpdated);
            }

            var modeEl = document.getElementById('storage-mode');
            modeEl.textContent = 'PostgreSQL + Prisma';
            modeEl.style.color = '#4caf50';

            // 訪問者ログ
            loadVisitorStats(stats);
        } catch (e) {
            // API不可の場合は既定値のまま
        }
    }

    function loadVisitorStats(stats) {
        var container = document.getElementById('visitor-stats');
        if (!stats || !stats.byPage || stats.byPage.length === 0) return;

        var html = '<table style="width:100%;border-collapse:collapse;">';
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
        var overlay = document.querySelector('.sidebar-overlay');
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
        var overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    // ============================================
    // 変更検知
    // ============================================

    function setupChangeDetection() {
        document.addEventListener('input', function (e) {
            if (e.target.classList.contains('editor-textarea')) {
                var original = e.target.getAttribute('data-original') || '';
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
            var password = document.getElementById('auth-password').value;
            authenticate(password).then(function (success) {
                if (success) {
                    document.getElementById('auth-overlay').hidden = true;
                    document.getElementById('admin-app').hidden = false;
                    document.getElementById('auth-error').hidden = true;
                    document.getElementById('auth-password').value = '';
                    updateDashboardStats();
                } else {
                    document.getElementById('auth-error').hidden = false;
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
                var res = await apiFetch('/api/auth/verify');
                if (res.ok) {
                    document.getElementById('auth-overlay').hidden = true;
                    document.getElementById('admin-app').hidden = false;
                    updateDashboardStats();
                } else {
                    logout();
                }
            } catch (e) {
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

})();
