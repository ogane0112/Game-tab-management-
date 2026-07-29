// platform/tabs/closeTab.js
export async function closeTab(tabId) {
  return browser.tabs.remove(tabId);
}
