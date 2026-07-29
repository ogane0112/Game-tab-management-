// core/task/taskSelectors.js
// タスク一覧に対するフィルタ・ソート・集計ロジック（純粋関数）

import { PRIORITY_ORDER, TASK_STATUS } from '../../shared/constants.js';

/** カテゴリでフィルタする */
export function filterByCategory(tasks, category) {
  if (!category || category === 'all') return tasks;
  return tasks.filter((task) => task.category === category);
}

/** ステータスでフィルタする */
export function filterByStatus(tasks, status) {
  if (!status || status === 'all') return tasks;
  return tasks.filter((task) => task.status === status);
}

/** 優先度の高い順にソートする */
export function sortByPriority(tasks) {
  return [...tasks].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
  );
}

/** 締切日が近い順にソートする（未設定は末尾） */
export function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

/** 完了/全体の進捗率を計算する（0-100） */
export function computeProgress(tasks) {
  if (tasks.length === 0) return 0;
  const doneCount = tasks.filter((t) => t.status === TASK_STATUS.DONE).length;
  return Math.round((doneCount / tasks.length) * 100);
}

/** カテゴリの一覧をタスクから抽出する */
export function extractCategories(tasks) {
  return [...new Set(tasks.map((t) => t.category))];
}
