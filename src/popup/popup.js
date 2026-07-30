// popup/popup.js
// Popup UI のエントリーポイント。
// 状態は保持せず、backgroundから受け取ったtasksをそのまま描画に使う。

import { sendToBackground } from '../platform/messaging/sendToBackground.js';
import { onMessage } from '../platform/messaging/onMessage.js';
import {
  ADD_TASK,
  DELETE_TASK,
  TOGGLE_TASK_STATUS,
  ATTACH_TAB_TO_TASK,
  RESTORE_TASK_TABS,
  REQUEST_AI_CLASSIFY,
  STATE_CHANGED,
  GET_STATE,
} from '../shared/messages.js';
import {
  filterByCategory,
  filterByStatus,
  sortByPriority,
  computeProgress,
  extractCategories,
} from '../core/task/taskSelectors.js';
import { renderTaskList } from './components/taskList.js';
import {
  readTaskForm,
  resetTaskForm,
  applyAiClassification,
  populateCategoryFilter,
} from './components/taskForm.js';

const taskListEl = document.getElementById('task-list');
const taskFormEl = document.getElementById('task-form');
const categoryFilterEl = document.getElementById('filter-category');
const statusFilterEl = document.getElementById('filter-status');
const progressLabelEl = document.getElementById('progress-label');
const progressFillEl = document.getElementById('progress-fill');
const aiClassifyBtn = document.getElementById('ai-classify-btn');
const openOptionsBtn = document.getElementById('open-options');

let allTasks = [];

function render() {
  const categories = extractCategories(allTasks);
  populateCategoryFilter(categoryFilterEl, categories);

  let visibleTasks = filterByCategory(allTasks, categoryFilterEl.value);
  visibleTasks = filterByStatus(visibleTasks, statusFilterEl.value);
  visibleTasks = sortByPriority(visibleTasks);

  renderTaskList(taskListEl, visibleTasks, {
    onToggle: handleToggle,
    onDelete: handleDelete,
    onAttachTab: handleAttachTab,
    onRestoreTabs: handleRestoreTabs,
  });

  const progress = computeProgress(allTasks);
  progressLabelEl.textContent = `${progress}%`;
  progressFillEl.style.width = `${progress}%`;
}

async function handleToggle(taskId) {
  const response = await sendToBackground(TOGGLE_TASK_STATUS, { id: taskId });
  allTasks = response.tasks;
  render();
}

async function handleDelete(taskId) {
  const response = await sendToBackground(DELETE_TASK, { id: taskId });
  allTasks = response.tasks;
  render();
}

async function handleAttachTab(taskId) {
  const response = await sendToBackground(ATTACH_TAB_TO_TASK, { taskId });
  if (response.tasks) allTasks = response.tasks;
  render();
}

async function handleRestoreTabs(taskId) {
  await sendToBackground(RESTORE_TASK_TABS, { taskId });
}

taskFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { title, category, priority, dueDate } = readTaskForm(taskFormEl);
  if (!title) return;

  const response = await sendToBackground(ADD_TASK, {
    title,
    category,
    priority,
    dueDate,
  });
  allTasks = response.tasks;
  resetTaskForm(taskFormEl);
  render();
});

aiClassifyBtn.addEventListener('click', async () => {
  const { title } = readTaskForm(taskFormEl);
  if (!title) return;

  aiClassifyBtn.disabled = true;
  aiClassifyBtn.textContent = '…';
  try {
    const result = await sendToBackground(REQUEST_AI_CLASSIFY, { title });
    applyAiClassification(taskFormEl, result);
  } catch (err) {
    alert(err.message || 'AI分類に失敗しました。設定画面でAPIキーを確認してください。');
  } finally {
    aiClassifyBtn.disabled = false;
    aiClassifyBtn.textContent = '✨';
  }
});

categoryFilterEl.addEventListener('change', render);
statusFilterEl.addEventListener('change', render);

openOptionsBtn.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});

// backgroundからの状態変更通知を購読する
onMessage((message) => {
  if (message.type === STATE_CHANGED) {
    allTasks = message.payload.tasks;
    render();
  }
});

// 初期状態を取得する
(async function init() {
  const response = await sendToBackground(GET_STATE, {});
  allTasks = response.tasks || [];
  render();
})();
