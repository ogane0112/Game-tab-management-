// platform/storage/clearTasks.js
import { STORAGE_KEYS } from '../../shared/constants.js';

export async function clearTasks() {
  return browser.storage.local.remove(STORAGE_KEYS.TASKS);
}
