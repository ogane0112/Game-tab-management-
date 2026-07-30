// background/index.js
// Service Worker のエントリーポイント。
// メッセージリスナーを登録するだけで、実処理はrouter.jsに委譲する。

import { onMessage } from '../platform/messaging/onMessage.js';
import { handleMessage } from './router.js';

// Service Workerがスリープから復帰した際に取りこぼさないよう、
// イベントハンドラの登録はトップレベルで同期的に行う。
onMessage((message, sender) => handleMessage(message, sender));

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
