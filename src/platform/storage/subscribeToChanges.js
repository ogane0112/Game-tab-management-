// platform/storage/subscribeToChanges.js
import { STORAGE_KEYS } from '../../shared/constants.js';

/**
 * chrome.storage.onChanged を購読し、tasks の変更のみを通知する。
 * @param {(tasks: Array) => void} callback
 * @returns {() => void} unsubscribe関数
 */
export function subscribeToChanges(callback) {
  const listener = (changes, areaName) => {
    if (areaName !== 'local') return;
    const change = changes[STORAGE_KEYS.TASKS];
    if (change) {
      callback(change.newValue || []);
    }
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}
