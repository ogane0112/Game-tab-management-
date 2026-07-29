// platform/tabs/getAllTabs.js
export async function getAllTabs() {
  return browser.tabs.query({});
}
