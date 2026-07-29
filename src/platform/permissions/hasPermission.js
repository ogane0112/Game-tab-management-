// platform/permissions/hasPermission.js

/**
 * 指定の権限が既に付与されているかを確認する。
 * @param {{permissions?: string[], origins?: string[]}} permissions
 * @returns {Promise<boolean>}
 */
export async function hasPermission(permissions) {
  return browser.permissions.contains(permissions);
}
