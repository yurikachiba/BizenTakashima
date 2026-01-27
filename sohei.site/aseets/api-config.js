'use strict';

/* API設定 - Render.comバックエンドのURLを設定
   本番環境ではRender.comのURLに変更してください */

var SOHEI_API = {
    // Render.comにデプロイ後、ここを実際のURLに変更
    BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://bizen-takashima-api.onrender.com',

    getUrl: function (path) {
        return this.BASE_URL + path;
    }
};
