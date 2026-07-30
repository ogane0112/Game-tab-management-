// popup/components/taskList.js
// タスク一覧全体の描画を担当する。

import { renderTaskItem } from './taskItem.js';

/**
 * @param {HTMLElement} container - <ul id="task-list">
 * @param {import('../../core/task/taskReducer.js').Task[]} tasks
 * @param {object} handlers - taskItem.js の handlers と同じ
 */
export function renderTaskList(container, tasks, handlers) {
  container.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'タスクがありません。上のフォームから追加してください。';
    container.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  tasks.forEach((task) => {
    fragment.appendChild(renderTaskItem(task, handlers));
  });
  container.appendChild(fragment);
}
