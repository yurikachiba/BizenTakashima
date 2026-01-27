'use strict';

/* コンテンツローダー - 公開ページ用
   content.json が存在すれば、data-content-key 属性の要素のテキストを差し替える。
   content.json が無ければ静的HTMLのまま表示される。 */

(function () {
    var PAGE_MAP = {
        'top': 'index',
        'workIntroduction': 'workIntroduction',
        'interview': 'interview',
        'artistIntroduction': 'artistIntroduction',
        'productionProcess': 'productionProcess'
    };

    function getPageId() {
        var body = document.body;
        if (body.classList.contains('top')) return 'index';
        if (body.classList.contains('workIntroduction')) return 'workIntroduction';
        if (body.classList.contains('interview')) return 'interview';
        if (body.classList.contains('artistIntroduction')) return 'artistIntroduction';
        // productionProcess も workIntroduction class を使っているので pathname で判定
        if (location.pathname.indexOf('productionProcess') !== -1) return 'productionProcess';
        return null;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function applyContent(pageId, allData) {
        var pageData = allData[pageId];
        if (!pageData) return;

        document.querySelectorAll('[data-content-key]').forEach(function (el) {
            var key = el.getAttribute('data-content-key');
            if (pageData[key] !== undefined && pageData[key] !== '') {
                // テキストを改行対応で挿入
                el.innerHTML = escapeHtml(pageData[key]).replace(/\n/g, '<br>');
            }
        });
    }

    function logVisit(pageId) {
        try {
            var key = 'sohei-visitor-log';
            var raw = localStorage.getItem(key);
            var logs = raw ? JSON.parse(raw) : [];
            logs.push({ page: pageId, time: Date.now() });
            // 最新1000件のみ保持
            if (logs.length > 1000) logs = logs.slice(-1000);
            localStorage.setItem(key, JSON.stringify(logs));
        } catch (e) {
            // storage full or disabled - ignore
        }
    }

    function load() {
        var pageId = getPageId();
        if (!pageId) return;

        logVisit(pageId);

        // content.json を取得（同一ディレクトリ）
        fetch('content.json')
            .then(function (res) {
                if (!res.ok) throw new Error('not found');
                return res.json();
            })
            .then(function (data) {
                applyContent(pageId, data);
            })
            .catch(function () {
                // content.json が無い場合は静的HTMLのまま - 何もしない
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
