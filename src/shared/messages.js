// shared/messages.js
// UI <-> Background 間でやり取りするアクション名の定義

export const ADD_TASK = 'ADD_TASK';
export const UPDATE_TASK = 'UPDATE_TASK';
export const DELETE_TASK = 'DELETE_TASK';
export const TOGGLE_TASK_STATUS = 'TOGGLE_TASK_STATUS';
export const ATTACH_TAB_TO_TASK = 'ATTACH_TAB_TO_TASK';
export const RESTORE_TASK_TABS = 'RESTORE_TASK_TABS';
export const REQUEST_AI_CLASSIFY = 'REQUEST_AI_CLASSIFY';

// Background -> UI への通知用
export const STATE_CHANGED = 'STATE_CHANGED';
export const GET_STATE = 'GET_STATE';

export const ACTION_TYPES = Object.freeze({
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  TOGGLE_TASK_STATUS,
  ATTACH_TAB_TO_TASK,
  RESTORE_TASK_TABS,
  REQUEST_AI_CLASSIFY,
  STATE_CHANGED,
  GET_STATE,
});
