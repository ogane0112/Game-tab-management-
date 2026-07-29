// platform/messaging/sendToPopup.js

/**
 * Background から 開いている Popup/Options へ状態変更などを通知する。
 * 受信側が存在しない場合のエラーは無視する（Popupが閉じている場合など）。
 * @param {string} type
 * @param {any} payload
 */
export async function sendToPopup(type, payload) {
  try {
    await browser.runtime.sendMessage({ type, payload });
  } catch (err) {
    // 受信側の Popup/Options が開いていない場合は無視する
  }
}
