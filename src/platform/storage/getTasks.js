// platform/storage/getTasks.js
import { STORAGE_KEYS } from '../../shared/constants.js';

export async function getTasks() {
  const result = await browser.storage.local.get(STORAGE_KEYS.TASKS);
  return result[STORAGE_KEYS.TASKS] || [];
}
