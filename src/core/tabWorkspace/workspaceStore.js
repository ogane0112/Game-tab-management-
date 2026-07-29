// core/tabWorkspace/workspaceStore.js
// タスクとブラウザタブの紐付け（アタッチ・復元）ロジック。
// taskStore が持つ tasks[].tabIds を実データとし、
// このモジュールは「タブを開く/閉じる/取得する」操作を仲介する。

import { getActiveTab } from '../../platform/tabs/getActiveTab.js';
import { openTab } from '../../platform/tabs/openTab.js';
import { closeTab } from '../../platform/tabs/closeTab.js';
import { focusTab } from '../../platform/tabs/focusTab.js';
import { getAllTabs } from '../../platform/tabs/getAllTabs.js';

/**
 * 現在アクティブなタブをタスクへ添付する。
 * @param {import('../task/taskStore.js').createTaskStore} taskStore
 * @param {string} taskId
 */
export async function attachActiveTabToTask(taskStore, taskId) {
  const tab = await getActiveTab();
  if (!tab) return null;

  const tabInfo = { tabId: tab.id, url: tab.url, title: tab.title };
  const task = taskStore.getState().find((t) => t.id === taskId);
  if (!task) return null;

  const existingTabIds = task.tabIds || [];
  if (existingTabIds.includes(tab.id)) return tabInfo;

  await taskStore.dispatch({
    type: 'UPDATE_TASK',
    payload: {
      id: taskId,
      changes: { tabIds: [...existingTabIds, tab.id] },
    },
  });

  return tabInfo;
}

/**
 * タスクに紐づくタブ群を復元する。
 * 既に開いているタブはフォーカスし、閉じられているタブは
 * URL情報がある場合のみ再オープンする（今回はtabIdのみ保持のため、
 * 既存タブが見つからない場合は復元をスキップする）。
 * @param {import('../task/taskStore.js').createTaskStore} taskStore
 * @param {string} taskId
 */
export async function restoreTaskTabs(taskStore, taskId) {
  const task = taskStore.getState().find((t) => t.id === taskId);
  if (!task || !task.tabIds || task.tabIds.length === 0) return [];

  const allTabs = await getAllTabs();
  const openTabIds = new Set(allTabs.map((t) => t.id));

  const results = [];
  for (const tabId of task.tabIds) {
    if (openTabIds.has(tabId)) {
      const tab = allTabs.find((t) => t.id === tabId);
      await focusTab(tabId, tab.windowId);
      results.push({ tabId, restored: false, focused: true });
    } else {
      results.push({ tabId, restored: false, focused: false, missing: true });
    }
  }
  return results;
}

/**
 * タスクからタブの紐付けを解除する（タブ自体は閉じない）。
 */
export async function detachTabFromTask(taskStore, taskId, tabId) {
  const task = taskStore.getState().find((t) => t.id === taskId);
  if (!task) return;

  await taskStore.dispatch({
    type: 'UPDATE_TASK',
    payload: {
      id: taskId,
      changes: { tabIds: (task.tabIds || []).filter((id) => id !== tabId) },
    },
  });
}

/**
 * タスクに紐づく全てのタブを閉じる。
 */
export async function closeTaskTabs(taskStore, taskId) {
  const task = taskStore.getState().find((t) => t.id === taskId);
  if (!task || !task.tabIds) return;

  for (const tabId of task.tabIds) {
    try {
      await closeTab(tabId);
    } catch (err) {
      // 既に閉じられている場合は無視
    }
  }

  await taskStore.dispatch({
    type: 'UPDATE_TASK',
    payload: { id: taskId, changes: { tabIds: [] } },
  });
}
