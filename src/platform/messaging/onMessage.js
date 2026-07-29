// platform/messaging/onMessage.js

/**
 * メッセージ受信を購読する。
 * ハンドラが Promise を返す場合は sendResponse に自動で解決する。
 * @param {(message: {type: string, payload: any}, sender: any) => any} handler
 * @returns {() => void} unsubscribe関数
 */
export function onMessage(handler) {
  const listener = (message, sender, sendResponse) => {
    const result = handler(message, sender);
    if (result instanceof Promise) {
      result.then(sendResponse);
      return true; // 非同期レスポンスを示す
    }
    if (result !== undefined) {
      sendResponse(result);
    }
    return undefined;
  };

  browser.runtime.onMessage.addListener(listener);

  return () => browser.runtime.onMessage.removeListener(listener);
}
