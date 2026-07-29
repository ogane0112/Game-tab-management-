// platform/messaging/sendToBackground.js

/**
 * Popup/Options から Background へメッセージを送信する。
 * @param {string} type - アクション名 (shared/messages.js の定数)
 * @param {any} payload
 * @returns {Promise<any>} background側のレスポンス
 */
export async function sendToBackground(type, payload) {
  return browser.runtime.sendMessage({ type, payload });
}
