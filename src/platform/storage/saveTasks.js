// platform/storage/saveTasks.js
import { STORAGE_KEYS } from '../../shared/constants.js';

export async function saveTasks(tasks) {
  return browser.storage.local.set({ [STORAGE_KEYS.TASKS]: tasks });
}
