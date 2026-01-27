'use strict';

/* ============================================
   管理者パネル メインスクリプト
   ============================================ */

(function () {

    // デフォルトパスワードハッシュ (SHA-256 of "bizen2024")
    const DEFAULT_HASH = 'a366309df45c65a4bd64c27ac666294b13ec69180c013dfbc8d67956b59bdf2d';
    const STORAGE_KEYS = {
        content: 'sohei-admin-content',
        hash: 'sohei-admin-hash',
        session: 'sohei-admin-session',
        lastActivity: 'sohei-admin-activity',
        firebase: 'sohei-admin-firebase',
        visitors: 'sohei-visitor-log'
    };
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

    // ============================================
    // ユーティリティ
    // ============================================

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

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

    // ============================================
    // 認証
    // ============================================

    function getPasswordHash() {
        return localStorage.getItem(STORAGE_KEYS.hash) || DEFAULT_HASH;
    }

    async function authenticate(password) {
        var hash = await sha256(password);
        if (hash === getPasswordHash()) {
            sessionStorage.setItem(STORAGE_KEYS.session, 'true');
            sessionStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());
            return true;
        }
        return false;
    }

    function isAuthenticated() {
        if (sessionStorage.getItem(STORAGE_KEYS.session) !== 'true') return false;
        var lastActivity = parseInt(sessionStorage.getItem(STORAGE_KEYS.lastActivity) || '0');
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
            logout();
            return false;
        }
        return true;
    }

    function refreshActivity() {
        sessionStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_KEYS.session);
        sessionStorage.removeItem(STORAGE_KEYS.lastActivity);
        document.getElementById('auth-overlay').hidden = false;
        document.getElementById('admin-app').hidden = true;
    }

    // ============================================
    // コンテンツ管理
    // ============================================

    function loadAllContent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEYS.content);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveAllContent(data) {
        data._lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(data));
    }

    function savePageContent(pageId) {
        var data = loadAllContent();
        var textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
        var pageData = {};
        textareas.forEach(function (ta) {
            var key = ta.getAttribute('data-key');
            if (key) {
                pageData[key] = ta.value;
            }
        });
        data[pageId] = pageData;
        saveAllContent(data);
        updateDashboardStats();
        showToast(getPageLabel(pageId) + ' を保存しました', 'success');

        // 変更マーカーをリセット
        textareas.forEach(function (ta) {
            ta.classList.remove('modified');
            ta.setAttribute('data-original', ta.value);
        });
    }

    function loadPageContent(pageId) {
        var data = loadAllContent();
        var pageData = data[pageId];
        if (!pageData) return;

        var textareas = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea');
        textareas.forEach(function (ta) {
            var key = ta.getAttribute('data-key');
            if (key && pageData[key] !== undefined) {
                ta.value = pageData[key];
            }
            ta.setAttribute('data-original', ta.value);
        });
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

    function exportJSON() {
        var data = loadAllContent();
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
    }

    function importJSON(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);
                saveAllContent(data);

                // 現在表示中のタブを再読み込み
                var activeTab = document.querySelector('.nav-item.active');
                if (activeTab) {
                    var tabId = activeTab.getAttribute('data-tab');
                    loadPageContent(tabId);
                }
                updateDashboardStats();
                showToast('コンテンツをインポートしました', 'success');
            } catch (err) {
                showToast('JSONファイルの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }

    function clearAllContent() {
        if (!confirm('全てのコンテンツ編集データを削除しますか？\nこの操作は取り消せません。')) return;
        localStorage.removeItem(STORAGE_KEYS.content);
        updateDashboardStats();
        showToast('全コンテンツを削除しました', '');
        // 全タブの textarea をデフォルトに戻すためリロード
        location.reload();
    }

    // ============================================
    // パスワード変更
    // ============================================

    async function changePassword() {
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

        var hash = await sha256(newPass);
        localStorage.setItem(STORAGE_KEYS.hash, hash);
        document.getElementById('new-password').value = '';
        document.getElementById('new-password-confirm').value = '';
        showToast('パスワードを変更しました', 'success');
    }

    // ============================================
    // Firebase 設定
    // ============================================

    function loadFirebaseConfig() {
        try {
            var raw = localStorage.getItem(STORAGE_KEYS.firebase);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveFirebaseConfig() {
        var config = {
            apiKey: document.getElementById('firebase-apiKey').value.trim(),
            projectId: document.getElementById('firebase-projectId').value.trim(),
            appId: document.getElementById('firebase-appId').value.trim()
        };
        localStorage.setItem(STORAGE_KEYS.firebase, JSON.stringify(config));
        updateDashboardStats();
        showToast('Firebase設定を保存しました', 'success');
    }

    function restoreFirebaseConfig() {
        var config = loadFirebaseConfig();
        if (config.apiKey) document.getElementById('firebase-apiKey').value = config.apiKey;
        if (config.projectId) document.getElementById('firebase-projectId').value = config.projectId;
        if (config.appId) document.getElementById('firebase-appId').value = config.appId;
    }

    // ============================================
    // ダッシュボード統計
    // ============================================

    function updateDashboardStats() {
        var data = loadAllContent();
        var pageIds = ['index', 'workIntroduction', 'productionProcess', 'interview', 'artistIntroduction'];
        var editedCount = 0;
        pageIds.forEach(function (id) {
            if (data[id]) editedCount++;
        });

        document.getElementById('edited-pages').textContent = editedCount + ' / 5';

        if (data._lastUpdated) {
            document.getElementById('last-updated').textContent = formatDate(data._lastUpdated);
        }

        var fbConfig = loadFirebaseConfig();
        var modeEl = document.getElementById('storage-mode');
        if (fbConfig.apiKey && fbConfig.projectId) {
            modeEl.textContent = 'Firebase';
            modeEl.style.color = '#4caf50';
        } else {
            modeEl.textContent = 'ローカル + JSON';
        }

        // 訪問者ログ
        loadVisitorStats();
    }

    function loadVisitorStats() {
        var container = document.getElementById('visitor-stats');
        try {
            var raw = localStorage.getItem(STORAGE_KEYS.visitors);
            if (!raw) return;
            var logs = JSON.parse(raw);
            if (!logs || !logs.length) return;

            // 過去7日間のPV集計
            var now = Date.now();
            var sevenDays = 7 * 24 * 60 * 60 * 1000;
            var recent = logs.filter(function (l) { return now - l.time < sevenDays; });

            if (!recent.length) return;

            // ページ別集計
            var pageCounts = {};
            recent.forEach(function (l) {
                var page = l.page || 'unknown';
                pageCounts[page] = (pageCounts[page] || 0) + 1;
            });

            var html = '<table style="width:100%;border-collapse:collapse;">';
            html += '<tr style="border-bottom:1px solid var(--border);">';
            html += '<th style="text-align:left;padding:8px;font-size:13px;color:var(--text-muted);">ページ</th>';
            html += '<th style="text-align:right;padding:8px;font-size:13px;color:var(--text-muted);">過去7日間PV</th>';
            html += '</tr>';

            var sorted = Object.entries(pageCounts).sort(function (a, b) { return b[1] - a[1]; });
            sorted.forEach(function (entry) {
                html += '<tr style="border-bottom:1px solid rgba(42,63,85,0.5);">';
                html += '<td style="padding:8px;font-size:14px;">' + escapeHtml(entry[0]) + '</td>';
                html += '<td style="text-align:right;padding:8px;font-size:14px;font-weight:700;">' + entry[1] + '</td>';
                html += '</tr>';
            });

            html += '<tr>';
            html += '<td style="padding:8px;font-size:14px;font-weight:700;">合計</td>';
            html += '<td style="text-align:right;padding:8px;font-size:14px;font-weight:700;">' + recent.length + '</td>';
            html += '</tr>';
            html += '</table>';

            container.innerHTML = html;
        } catch (e) {
            // ignore
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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

        if (tabId === 'settings') {
            restoreFirebaseConfig();
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
            } else if (sessionStorage.getItem(STORAGE_KEYS.session) === 'true') {
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

        // Firebase設定保存
        document.getElementById('save-firebase-btn').addEventListener('click', saveFirebaseConfig);

        // アクティビティ追跡
        document.addEventListener('click', refreshActivity);
        document.addEventListener('keydown', refreshActivity);
    }

    // ============================================
    // 初期化
    // ============================================

    function init() {
        bindEvents();
        setupChangeDetection();
        startInactivityCheck();

        // 認証状態チェック
        if (isAuthenticated()) {
            document.getElementById('auth-overlay').hidden = true;
            document.getElementById('admin-app').hidden = false;
            updateDashboardStats();
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
