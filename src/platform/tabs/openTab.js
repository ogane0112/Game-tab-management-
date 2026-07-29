// platform/tabs/openTab.js
export async function openTab(url, options = {}) {
  return browser.tabs.create({ url, active: false, ...options });
}
