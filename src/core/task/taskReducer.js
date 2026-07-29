// core/task/taskReducer.js
// タスクの状態を扱う純粋関数のReducer。ブラウザAPIには一切依存しない。

import {
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  TOGGLE_TASK_STATUS,
} from '../../shared/messages.js';
import { TASK_STATUS, PRIORITY } from '../../shared/constants.js';

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {'high'|'medium'|'low'} priority
 * @property {string|null} dueDate - ISO 8601
 * @property {'todo'|'in_progress'|'done'} status
 * @property {number[]} tabIds - 添付されたタブID一覧
 * @property {number} createdAt
 * @property {number} updatedAt
 */

function createTask(payload) {
  const now = Date.now();
  return {
    id: payload.id || `task_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title,
    category: payload.category || '未分類',
    priority: payload.priority || PRIORITY.MEDIUM,
    dueDate: payload.dueDate || null,
    status: payload.status || TASK_STATUS.TODO,
    tabIds: payload.tabIds || [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * @param {Task[]} state - 現在のタスク一覧
 * @param {{type: string, payload: any}} action
 * @returns {Task[]} 新しいタスク一覧
 */
export function taskReducer(state = [], action) {
  switch (action.type) {
    case ADD_TASK: {
      return [...state, createTask(action.payload)];
    }

    case UPDATE_TASK: {
      const { id, changes } = action.payload;
      return state.map((task) =>
        task.id === id
          ? { ...task, ...changes, updatedAt: Date.now() }
          : task
      );
    }

    case DELETE_TASK: {
      const { id } = action.payload;
      return state.filter((task) => task.id !== id);
    }

    case TOGGLE_TASK_STATUS: {
      const { id } = action.payload;
      return state.map((task) => {
        if (task.id !== id) return task;
        const nextStatus =
          task.status === TASK_STATUS.DONE
            ? TASK_STATUS.TODO
            : TASK_STATUS.DONE;
        return { ...task, status: nextStatus, updatedAt: Date.now() };
      });
    }

    default:
      return state;
  }
}
