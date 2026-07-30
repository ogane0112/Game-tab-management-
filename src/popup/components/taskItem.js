// popup/components/taskItem.js
// 1タスク分の<li>要素を生成する純粋な描画関数。

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };

function formatDueDate(dueDate) {
  if (!dueDate) return '';
  const d = new Date(dueDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * @param {import('../../core/task/taskReducer.js').Task} task
 * @param {{
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 *   onAttachTab: (id: string) => void,
 *   onRestoreTabs: (id: string) => void,
 * }} handlers
 * @returns {HTMLLIElement}
 */
export function renderTaskItem(task, handlers) {
  const li = document.createElement('li');
  li.className = `task-item${task.status === 'done' ? ' done' : ''}`;
  li.dataset.taskId = task.id;

  const dot = document.createElement('span');
  dot.className = `task-priority-dot ${task.priority}`;

  const body = document.createElement('div');
  body.className = 'task-body';

  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.innerHTML = '';
  const categorySpan = document.createElement('span');
  categorySpan.textContent = `#${task.category}`;
  meta.appendChild(categorySpan);

  const prioritySpan = document.createElement('span');
  prioritySpan.textContent = `優先度:${PRIORITY_LABEL[task.priority] || task.priority}`;
  meta.appendChild(prioritySpan);

  if (task.dueDate) {
    const dueSpan = document.createElement('span');
    dueSpan.textContent = `期限:${formatDueDate(task.dueDate)}`;
    meta.appendChild(dueSpan);
  }

  if (task.tabIds && task.tabIds.length > 0) {
    const tabSpan = document.createElement('span');
    tabSpan.textContent = `🔗${task.tabIds.length}`;
    meta.appendChild(tabSpan);
  }

  body.appendChild(title);
  body.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = task.status === 'done' ? '↩️' : '✅';
  toggleBtn.title = task.status === 'done' ? '未完了に戻す' : '完了にする';
  toggleBtn.addEventListener('click', () => handlers.onToggle(task.id));

  const attachBtn = document.createElement('button');
  attachBtn.textContent = '📎';
  attachBtn.title = '現在のタブを添付';
  attachBtn.addEventListener('click', () => handlers.onAttachTab(task.id));

  const restoreBtn = document.createElement('button');
  restoreBtn.textContent = '🗂️';
  restoreBtn.title = '添付タブを復元';
  restoreBtn.disabled = !task.tabIds || task.tabIds.length === 0;
  restoreBtn.addEventListener('click', () => handlers.onRestoreTabs(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = '削除';
  deleteBtn.addEventListener('click', () => handlers.onDelete(task.id));

  actions.appendChild(toggleBtn);
  actions.appendChild(attachBtn);
  actions.appendChild(restoreBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(dot);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}
