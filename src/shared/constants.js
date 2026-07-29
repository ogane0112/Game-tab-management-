// shared/constants.js
// アプリ全体で使う定数定義

export const STORAGE_KEYS = Object.freeze({
  TASKS: 'tasks',
  WORKSPACES: 'workspaces',
  SETTINGS: 'settings',
});

export const PRIORITY = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
});

export const PRIORITY_ORDER = Object.freeze({
  [PRIORITY.HIGH]: 0,
  [PRIORITY.MEDIUM]: 1,
  [PRIORITY.LOW]: 2,
});

export const DEFAULT_CATEGORIES = Object.freeze([
  '本業',
  '副業',
  '投資',
  '学習',
]);

export const TASK_STATUS = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
});
