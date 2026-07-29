// platform/tabs/focusTab.js
export async function focusTab(tabId, windowId) {
  await browser.tabs.update(tabId, { active: true });
  if (windowId != null) {
    await browser.windows.update(windowId, { focused: true });
  }
}
