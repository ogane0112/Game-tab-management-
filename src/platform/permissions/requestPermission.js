// platform/permissions/requestPermission.js

/**
 * 追加の権限をユーザーへリクエストする。
 * @param {{permissions?: string[], origins?: string[]}} permissions
 * @returns {Promise<boolean>} 許可されたか
 */
export async function requestPermission(permissions) {
  return browser.permissions.request(permissions);
}
