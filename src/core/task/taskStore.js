// core/task/taskStore.js
// 自作Reactive Store。dispatch(action) でtaskReducerを実行し、
// 変更をsubscribeしているリスナー全員に通知する。
// 永続化(platform/storage)を意識するのはこのファイルのみで、
// 他のcoreモジュールやUIはstorageの存在を知らない。

import { taskReducer } from './taskReducer.js';
import { getTasks } from '../../platform/storage/getTasks.js';
import { saveTasks } from '../../platform/storage/saveTasks.js';

export function createTaskStore() {
  /** @type {import('./taskReducer.js').Task[]} */
  let state = [];
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(nextState) {
    state = nextState;
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /**
   * アクションを実行し、状態を更新・永続化する。
   * @param {{type: string, payload: any}} action
   */
  async function dispatch(action) {
    const nextState = taskReducer(state, action);
    setState(nextState);
    await saveTasks(nextState);
    return nextState;
  }

  /** storageから初期状態を読み込む */
  async function hydrate() {
    const tasks = await getTasks();
    setState(tasks);
    return tasks;
  }

  return { getState, setState, subscribe, dispatch, hydrate };
}
