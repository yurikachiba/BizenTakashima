'use strict';

/* コンテンツローダー - 公開ページ用
   バックエンドAPIからコンテンツを取得し、data-content-key 属性の要素のテキストを差し替える。
   APIが利用不可の場合は静的HTMLのまま表示される。 */

(function () {
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

    function applyContent(pageId, pageData) {
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
        if (typeof SOHEI_API === 'undefined') return;

        fetch(SOHEI_API.getUrl('/api/analytics/log'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: pageId })
        }).catch(function () {
            // API不可の場合は無視
        });
    }

    function load() {
        var pageId = getPageId();
        if (!pageId) return;

        logVisit(pageId);

        if (typeof SOHEI_API === 'undefined') return;

        // バックエンドAPIからコンテンツを取得
        fetch(SOHEI_API.getUrl('/api/content/' + pageId))
            .then(function (res) {
                if (!res.ok) throw new Error('API error');
                return res.json();
            })
            .then(function (data) {
                applyContent(pageId, data);
            })
            .catch(function () {
                // APIが利用不可の場合は静的HTMLのまま - 何もしない
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
