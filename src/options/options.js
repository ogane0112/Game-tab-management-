// options/options.js
// 設定画面のロジック。AI APIキー等の設定と、タスクのカテゴリ一覧を
// browser.storage.local の "settings" キーへ保存する。

import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '../shared/constants.js';

const apiKeyEl = document.getElementById('ai-api-key');
const endpointEl = document.getElementById('ai-endpoint');
const modelEl = document.getElementById('ai-model');
const categoryListEl = document.getElementById('category-list');
const newCategoryEl = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const saveBtn = document.getElementById('save-btn');
const saveStatusEl = document.getElementById('save-status');

let categories = [...DEFAULT_CATEGORIES];

function renderCategories() {
  categoryListEl.innerHTML = '';
  categories.forEach((category, index) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = category;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '削除';
    removeBtn.addEventListener('click', () => {
      categories = categories.filter((_, i) => i !== index);
      renderCategories();
    });

    li.appendChild(span);
    li.appendChild(removeBtn);
    categoryListEl.appendChild(li);
  });
}

addCategoryBtn.addEventListener('click', () => {
  const value = newCategoryEl.value.trim();
  if (!value || categories.includes(value)) return;
  categories.push(value);
  newCategoryEl.value = '';
  renderCategories();
});

saveBtn.addEventListener('click', async () => {
  const settings = {
    aiApiKey: apiKeyEl.value.trim(),
    aiEndpoint: endpointEl.value.trim(),
    aiModel: modelEl.value.trim(),
    categories,
  };

  await browser.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });

  saveStatusEl.textContent = '保存しました';
  setTimeout(() => {
    saveStatusEl.textContent = '';
  }, 2000);
});

async function init() {
  const result = await browser.storage.local.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || {};

  apiKeyEl.value = settings.aiApiKey || '';
  endpointEl.value = settings.aiEndpoint || '';
  modelEl.value = settings.aiModel || '';
  categories = settings.categories && settings.categories.length > 0
    ? settings.categories
    : [...DEFAULT_CATEGORIES];

  renderCategories();
}

init();
