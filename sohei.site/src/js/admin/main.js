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

function isNetworkError(e) {
    if (!(e instanceof TypeError)) return false;
    const msg = e.message;
    // Chrome/Firefox: "Failed to fetch", Safari: "Load failed"
    return msg === 'Failed to fetch' || msg === 'Load failed';
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

// サーバー起動待ち（Render.com Free tierのコールドスタート対策）
async function waitForServer(onStatus) {
    var MAX_ATTEMPTS = 10;
    for (var i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            var res = await fetch(apiUrl('/api/health'));
            if (res.ok) return true;
        } catch {
            // サーバーがまだ起動中
        }
        if (onStatus) onStatus(i + 1, MAX_ATTEMPTS);
        await new Promise(function (r) { setTimeout(r, 5000); });
    }
    return false;
}

async function authenticate(password, onStatus) {
    // まずヘルスチェックでサーバーの起動を確認
    try {
        var healthRes = await fetch(apiUrl('/api/health'));
        if (!healthRes.ok) throw new Error('not ready');
    } catch {
        // サーバーが応答しない場合、起動を待つ
        if (onStatus) onStatus('waking');
        var ready = await waitForServer(onStatus);
        if (!ready) {
            return { success: false, error: 'サーバーが応答しません。Render.comのダッシュボードでサービスの状態を確認してください。' };
        }
    }

    // サーバー起動確認後にログイン
    try {
        var res = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (!res.ok) {
            try {
                var errData = await res.json();
                return { success: false, error: errData.error || 'ログインに失敗しました' };
            } catch {
                return { success: false, error: 'ログインに失敗しました（ステータス: ' + res.status + '）' };
            }
        }

        var data = await res.json();
        authToken = data.token;
        sessionStorage.setItem('sohei-admin-token', authToken);
        sessionStorage.setItem('sohei-admin-activity', Date.now().toString());
        return { success: true };
    } catch (e) {
        console.error('Auth error:', e);
        if (isNetworkError(e)) {
            return { success: false, error: 'サーバーに接続できません。ブラウザのコンソールでCORSエラーを確認してください。' };
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
// 画像管理
// ============================================

var SITE_IMG_BASE = 'https://www.sohei-portfolio.com/img/';

var PAGE_IMAGES = {
    index: [
        { key: 'index.philosophy_image', label: 'ものづくりへの想い 画像', defaultSrc: SITE_IMG_BASE + 'omoi.png' },
        { key: 'index.work_image', label: '作品紹介 画像', defaultSrc: SITE_IMG_BASE + 'WorkIntroduction.png' },
        { key: 'index.production_image', label: '制作の様子 画像', defaultSrc: SITE_IMG_BASE + 'kneadTheClay.png' },
        { key: 'index.interview_image', label: 'インタビュー 画像', defaultSrc: SITE_IMG_BASE + 'interview.png' },
        { key: 'index.artist_image', label: '作家紹介 画像', defaultSrc: SITE_IMG_BASE + 'separate.png' }
    ],
    workIntroduction: [
        { key: 'work.top_image', label: 'ページトップ画像', defaultSrc: SITE_IMG_BASE + 'WorkIntroduction.png' },
        { key: 'work.image_0', label: '備前 酒器 三点', defaultSrc: SITE_IMG_BASE + 'bizen_sakeVessels_threeItems.png' },
        { key: 'work.image_1', label: '灰釉 茶盌', defaultSrc: SITE_IMG_BASE + 'bizen_oldColor_teaBowl.png' },
        { key: 'work.image_2', label: '備前 茶注', defaultSrc: SITE_IMG_BASE + 'bizen_chachugi.png' },
        { key: 'work.image_3', label: '備前 鉢', defaultSrc: SITE_IMG_BASE + 'bizen_pot.png' },
        { key: 'work.image_4', label: '備前 壺', defaultSrc: SITE_IMG_BASE + 'bizen_jar.png' },
        { key: 'work.image_5', label: '備前 火襷 徳利', defaultSrc: SITE_IMG_BASE + 'bizen_hidasuki_tokkuri.png' },
        { key: 'work.image_6', label: '灰釉 茶盌 2', defaultSrc: SITE_IMG_BASE + 'ashGlaze_teaBowl.png' },
        { key: 'work.image_7', label: '備前 古色 瓢徳利', defaultSrc: SITE_IMG_BASE + 'bizen_oldColor_hyotokkuri.png' },
        { key: 'work.image_8', label: '備前 ピッチャー', defaultSrc: SITE_IMG_BASE + 'bizen_pitcher.png' }
    ],
    productionProcess: [
        { key: 'production.image_0', label: '完成品の写真', defaultSrc: SITE_IMG_BASE + 'complete.png' },
        { key: 'production.image_1', label: '原土の写真', defaultSrc: SITE_IMG_BASE + 'originalSoil.png' },
        { key: 'production.image_2', label: '粘土精製の写真', defaultSrc: SITE_IMG_BASE + 'clayProduction.png' },
        { key: 'production.image_3', label: '素焼き鉢の写真', defaultSrc: SITE_IMG_BASE + 'clayPot.png' },
        { key: 'production.image_4', label: '粘土の写真', defaultSrc: SITE_IMG_BASE + 'clay.png' },
        { key: 'production.image_5', label: '菊練りの写真', defaultSrc: SITE_IMG_BASE + 'spiralWedging.png' },
        { key: 'production.image_6', label: 'ろくろ成形の写真', defaultSrc: SITE_IMG_BASE + 'molding.png' },
        { key: 'production.image_7', label: '乾燥の写真', defaultSrc: SITE_IMG_BASE + 'teapotBox.png' },
        { key: 'production.image_8', label: '窯詰めの写真', defaultSrc: SITE_IMG_BASE + 'kilnFilling.png' },
        { key: 'production.image_9', label: '藁の写真', defaultSrc: SITE_IMG_BASE + 'straw.png' },
        { key: 'production.image_10', label: '割木の写真', defaultSrc: SITE_IMG_BASE + 'splitWood.png' },
        { key: 'production.image_11', label: '薪乾燥の写真', defaultSrc: SITE_IMG_BASE + 'splitWoodOutside.png' },
        { key: 'production.image_12', label: '窯焚きの写真', defaultSrc: SITE_IMG_BASE + 'kilnFiring.png' },
        { key: 'production.image_13', label: '上口の写真', defaultSrc: SITE_IMG_BASE + 'UpperMouth.png' },
        { key: 'production.image_14', label: '焚き口の写真', defaultSrc: SITE_IMG_BASE + 'firePit.png' },
        { key: 'production.image_15', label: '火を吹く焚き口の写真', defaultSrc: SITE_IMG_BASE + 'fire-breathingFirePit.png' },
        { key: 'production.image_16', label: '窯出しの写真', defaultSrc: SITE_IMG_BASE + 'OutOfTheKiln.png' },
        { key: 'production.image_17', label: '水漏れチェックの写真', defaultSrc: SITE_IMG_BASE + 'WaterLeakCheck.png' }
    ],
    interview: [
        { key: 'interview.top_image', label: 'ページトップ画像', defaultSrc: SITE_IMG_BASE + 'interview_top.png' }
    ],
    artistIntroduction: [
        { key: 'artist.top_image', label: 'ページトップ画像', defaultSrc: SITE_IMG_BASE + 'artistIntroduction_top.png' }
    ]
};

function createImageEditors(pageId) {
    var container = document.querySelector('#tab-' + pageId + ' .image-editors-container');
    if (!container) return;
    var images = PAGE_IMAGES[pageId];
    if (!images || images.length === 0) return;

    var html = '<div class="editor-section image-section">';
    html += '<h3 class="editor-label">画像編集</h3>';
    html += '<div class="image-editors-grid">';

    images.forEach(function (img) {
        html += '<div class="image-editor-item" data-image-key="' + img.key + '" data-page="' + pageId + '">';
        html += '<p class="image-editor-label">' + escapeHtml(img.label) + '</p>';
        html += '<div class="image-preview-wrapper">';
        if (img.defaultSrc) {
            html += '<img class="image-preview" src="' + escapeHtml(img.defaultSrc) + '" alt="' + escapeHtml(img.label) + '">';
            html += '<div class="image-placeholder" hidden>初期画像</div>';
        } else {
            html += '<img class="image-preview" src="" alt="' + escapeHtml(img.label) + '" hidden>';
            html += '<div class="image-placeholder">未設定</div>';
        }
        html += '</div>';
        html += '<div class="image-editor-actions">';
        html += '<label class="btn btn-secondary image-upload-label">';
        html += '画像を変更';
        html += '<input type="file" accept="image/*" class="image-upload-input" hidden>';
        html += '</label>';
        html += '<button class="btn btn-danger image-delete-btn" hidden>削除</button>';
        html += '</div>';
        html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;

    // Bind upload events
    container.querySelectorAll('.image-upload-input').forEach(function (input) {
        input.addEventListener('change', function (e) {
            if (!e.target.files[0]) return;
            var file = e.target.files[0];
            var item = e.target.closest('.image-editor-item');
            var key = item.getAttribute('data-image-key');
            var page = item.getAttribute('data-page');

            // Show local preview immediately
            var preview = item.querySelector('.image-preview');
            var placeholder = item.querySelector('.image-placeholder');
            var previewUrl = URL.createObjectURL(file);
            preview.src = previewUrl;
            preview.hidden = false;
            placeholder.hidden = true;
            preview.onload = function () {
                URL.revokeObjectURL(previewUrl);
            };

            uploadImage(page, key, file).then(function (ok) {
                if (ok) loadPageImages(page);
            });
            e.target.value = '';
        });
    });

    // Bind delete events
    container.querySelectorAll('.image-delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = this.closest('.image-editor-item');
            var key = item.getAttribute('data-image-key');
            var page = item.getAttribute('data-page');
            deleteImage(page, key).then(function (ok) {
                if (ok) loadPageImages(page);
            });
        });
    });
}

async function loadPageImages(pageId) {
    var images = PAGE_IMAGES[pageId];
    if (!images) return;

    try {
        var res = await apiFetch('/api/images/' + pageId);
        if (!res.ok) return;
        var data = await res.json();
        var keys = data.keys || [];

        images.forEach(function (img) {
            var item = document.querySelector('.image-editor-item[data-image-key="' + img.key + '"]');
            if (!item) return;

            var preview = item.querySelector('.image-preview');
            var placeholder = item.querySelector('.image-placeholder');
            var deleteBtn = item.querySelector('.image-delete-btn');

            if (keys.indexOf(img.key) !== -1) {
                preview.src = apiUrl('/api/images/' + pageId + '/' + img.key) + '?t=' + Date.now();
                preview.hidden = false;
                placeholder.hidden = true;
                deleteBtn.hidden = false;
            } else if (img.defaultSrc) {
                preview.src = img.defaultSrc;
                preview.hidden = false;
                placeholder.textContent = '初期画像';
                placeholder.hidden = true;
                deleteBtn.hidden = true;
            } else {
                preview.src = '';
                preview.hidden = true;
                placeholder.textContent = '未設定';
                placeholder.hidden = false;
                deleteBtn.hidden = true;
            }
        });
    } catch (e) {
        // API not available
    }
}

async function uploadImage(pageId, key, file) {
    var formData = new FormData();
    formData.append('image', file);

    try {
        var res = await fetch(apiUrl('/api/images/' + pageId + '/' + key), {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + authToken },
            body: formData
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            showToast('セッションが無効です。再ログインしてください', 'error');
            return false;
        }

        if (res.ok) {
            showToast('画像を保存しました', 'success');
            refreshActivity();
            return true;
        } else {
            showToast('画像の保存に失敗しました', 'error');
            return false;
        }
    } catch (e) {
        if (isNetworkError(e)) {
            showToast('サーバーに接続できません', 'error');
        } else {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
        return false;
    }
}

async function deleteImage(pageId, key) {
    if (!confirm('この画像を削除しますか？\n削除すると元の画像に戻ります。')) return false;

    try {
        var res = await fetch(apiUrl('/api/images/' + pageId + '/' + key), {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + authToken }
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            showToast('セッションが無効です。再ログインしてください', 'error');
            return false;
        }

        if (res.ok) {
            showToast('画像を削除しました', 'success');
            refreshActivity();
            return true;
        } else {
            showToast('画像の削除に失敗しました', 'error');
            return false;
        }
    } catch (e) {
        if (isNetworkError(e)) {
            showToast('サーバーに接続できません', 'error');
        } else {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
        return false;
    }
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
    const fields = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea, #tab-' + pageId + ' .editor-input');
    const pageData = {};
    fields.forEach(function (el) {
        const key = el.getAttribute('data-key');
        if (key) {
            pageData[key] = el.value;
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
            fields.forEach(function (el) {
                el.classList.remove('modified');
                el.setAttribute('data-original', el.value);
            });
        } else {
            showToast('保存に失敗しました', 'error');
        }
    } catch (e) {
        if (isNetworkError(e)) {
            showToast('サーバーに接続できません。APIサーバーが起動しているか確認してください。', 'error');
        } else {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
    }
}

async function loadPageContent(pageId) {
    try {
        const res = await apiFetch('/api/content/' + pageId);
        if (!res.ok) return;
        const pageData = await res.json();

        const fields = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea, #tab-' + pageId + ' .editor-input');
        fields.forEach(function (el) {
            const key = el.getAttribute('data-key');
            if (key && pageData[key] !== undefined) {
                el.value = pageData[key];
            }
            el.setAttribute('data-original', el.value);
        });
    } catch {
        // API不可の場合はローカルの初期値のまま
    }
}

function resetPageContent(pageId) {
    const fields = document.querySelectorAll('#tab-' + pageId + ' .editor-textarea, #tab-' + pageId + ' .editor-input');
    fields.forEach(function (el) {
        const original = el.getAttribute('data-original');
        if (original !== null) {
            el.value = original;
            el.classList.remove('modified');
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
    } catch (e) {
        if (isNetworkError(e)) {
            showToast('サーバーに接続できません。APIサーバーが起動しているか確認してください。', 'error');
        } else {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
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
    } catch (e) {
        if (isNetworkError(e)) {
            showToast('サーバーに接続できません。APIサーバーが起動しているか確認してください。', 'error');
        } else {
            showToast('サーバーとの通信に失敗しました', 'error');
        }
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
        // 画像エディタを初期化（未作成の場合のみ）
        var imgContainer = document.querySelector('#tab-' + tabId + ' .image-editors-container');
        if (imgContainer && !imgContainer.hasChildNodes()) {
            createImageEditors(tabId);
        }
        loadPageImages(tabId);
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
        if (e.target.classList.contains('editor-textarea') || e.target.classList.contains('editor-input')) {
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
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const errorEl = document.getElementById('auth-error');
        const originalText = submitBtn ? submitBtn.textContent : '';

        // ボタンを無効化して接続中であることを表示
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'サーバーに接続中...';
        }
        errorEl.hidden = true;

        function onStatus(status, max) {
            if (!submitBtn) return;
            if (status === 'waking') {
                submitBtn.textContent = 'サーバー起動待ち...';
            } else {
                submitBtn.textContent = 'サーバー起動待ち... (' + status + '/' + max + ')';
            }
        }

        authenticate(password, onStatus).then(function (result) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            if (result.success) {
                document.getElementById('auth-overlay').hidden = true;
                document.getElementById('admin-app').hidden = false;
                errorEl.hidden = true;
                document.getElementById('auth-password').value = '';
                updateDashboardStats();
            } else {
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

    // 全テキストエリア・入力欄の初期値を保存
    document.querySelectorAll('.editor-textarea, .editor-input').forEach(function (el) {
        el.setAttribute('data-original', el.value);
    });
}

// DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
