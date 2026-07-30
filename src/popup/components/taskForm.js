// popup/components/taskForm.js
// タスク追加フォームの入出力ロジック。DOM生成は行わず、
// index.html に静的定義されたフォーム要素を操作する。

/**
 * @param {HTMLFormElement} formEl
 * @returns {{title: string, category: string, priority: string, dueDate: string|null}}
 */
export function readTaskForm(formEl) {
  const title = formEl.querySelector('#task-title').value.trim();
  const category = formEl.querySelector('#task-category').value;
  const priority = formEl.querySelector('#task-priority').value;
  const dueDate = formEl.querySelector('#task-due').value || null;
  return { title, category, priority, dueDate };
}

/** フォームをリセットする（タイトルと日付のみクリア、選択値は保持） */
export function resetTaskForm(formEl) {
  formEl.querySelector('#task-title').value = '';
  formEl.querySelector('#task-due').value = '';
}

/**
 * AI分類結果をフォームのカテゴリ・優先度に反映する。
 * @param {HTMLFormElement} formEl
 * @param {{category: string, priority: string}} result
 */
export function applyAiClassification(formEl, result) {
  const categorySelect = formEl.querySelector('#task-category');
  const prioritySelect = formEl.querySelector('#task-priority');

  // 候補にない新しいカテゴリの場合はoptionを追加する
  if (result.category && ![...categorySelect.options].some((o) => o.value === result.category)) {
    const opt = document.createElement('option');
    opt.value = result.category;
    opt.textContent = result.category;
    categorySelect.appendChild(opt);
  }

  if (result.category) categorySelect.value = result.category;
  if (result.priority) prioritySelect.value = result.priority;
}

/** カテゴリ一覧に応じて絞り込み用セレクトのoptionを再構築する */
export function populateCategoryFilter(selectEl, categories) {
  const currentValue = selectEl.value;
  selectEl.innerHTML = '<option value="all">すべてのカテゴリ</option>';
  categories.forEach((category) => {
    const opt = document.createElement('option');
    opt.value = category;
    opt.textContent = category;
    selectEl.appendChild(opt);
  });
  if (categories.includes(currentValue)) {
    selectEl.value = currentValue;
  }
}
