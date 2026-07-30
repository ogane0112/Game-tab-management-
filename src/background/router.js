// background/router.js
// すべてのUI間通信を受け取る中央ルーター。
// アクションを taskStore / workspaceStore / aiClient に振り分け、
// 状態変更を Popup / Options へブロードキャストする。

import { createTaskStore } from '../core/task/taskStore.js';
import {
  attachActiveTabToTask,
  restoreTaskTabs,
} from '../core/tabWorkspace/workspaceStore.js';
import { classifyTask } from '../core/ai/aiClient.js';
import { sendToPopup } from '../platform/messaging/sendToPopup.js';
import { extractCategories } from '../core/task/taskSelectors.js';
import {
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  TOGGLE_TASK_STATUS,
  ATTACH_TAB_TO_TASK,
  RESTORE_TASK_TABS,
  REQUEST_AI_CLASSIFY,
  STATE_CHANGED,
  GET_STATE,
} from '../shared/messages.js';

const taskStore = createTaskStore();
let hydrated = false;

async function ensureHydrated() {
  if (!hydrated) {
    await taskStore.hydrate();
    hydrated = true;
  }
}

/** 状態変更をPopup/Optionsへ通知する */
function broadcastState() {
  sendToPopup(STATE_CHANGED, { tasks: taskStore.getState() });
}

// taskStore の変更を常にUIへブロードキャストする
taskStore.subscribe(() => broadcastState());

/**
 * 受信したメッセージをアクションに応じて処理する。
 * @param {{type: string, payload: any}} message
 * @returns {Promise<any>}
 */
export async function handleMessage(message) {
  await ensureHydrated();
  const { type, payload } = message || {};

  switch (type) {
    case GET_STATE: {
      return { tasks: taskStore.getState() };
    }

    case ADD_TASK:
    case UPDATE_TASK:
    case DELETE_TASK:
    case TOGGLE_TASK_STATUS: {
      const nextState = await taskStore.dispatch({ type, payload });
      return { tasks: nextState };
    }

    case ATTACH_TAB_TO_TASK: {
      const { taskId } = payload;
      const tabInfo = await attachActiveTabToTask(taskStore, taskId);
      return { tabInfo, tasks: taskStore.getState() };
    }

    case RESTORE_TASK_TABS: {
      const { taskId } = payload;
      const results = await restoreTaskTabs(taskStore, taskId);
      return { results };
    }

    case REQUEST_AI_CLASSIFY: {
      const { title } = payload;
      const categories = extractCategories(taskStore.getState());
      const result = await classifyTask(title, categories);
      return result;
    }

    default:
      return { error: `Unknown action type: ${type}` };
  }
}
