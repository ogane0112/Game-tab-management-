// platform/storage/saveTasks.js
export async function saveTasks(tasks) {
  return browser.storage.local.set({ tasks });
}
