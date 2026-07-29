// core/ai/aiClient.js
// LLM API呼び出しの抽象化。プロバイダ固有の実装は差し替え可能にする。
// APIキー等の設定値は options/ で保存され、browser.storage.local から読み込む。

const DEFAULT_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

/**
 * 設定(APIキー・エンドポイント)を storage から取得する。
 */
async function getAiSettings() {
  const result = await browser.storage.local.get('settings');
  const settings = result.settings || {};
  return {
    apiKey: settings.aiApiKey || '',
    endpoint: settings.aiEndpoint || DEFAULT_ENDPOINT,
    model: settings.aiModel || DEFAULT_MODEL,
  };
}

/**
 * タスク文からカテゴリ・優先度をAIに推定させる。
 * @param {string} taskTitle
 * @param {string[]} availableCategories
 * @returns {Promise<{category: string, priority: 'high'|'medium'|'low', reason: string}>}
 */
export async function classifyTask(taskTitle, availableCategories = []) {
  const { apiKey, endpoint, model } = await getAiSettings();

  if (!apiKey) {
    throw new Error('AI APIキーが設定されていません。設定画面で入力してください。');
  }

  const systemPrompt = [
    'あなたはタスク管理アシスタントです。',
    `与えられたタスク文から、以下のカテゴリ候補の中から最も適切な1つと、`,
    '優先度(high/medium/low)を推定してください。',
    `カテゴリ候補: ${availableCategories.join(', ') || '本業, 副業, 投資, 学習'}`,
    '出力は必ずJSONのみとし、前置きやコードブロック記法は含めないこと。',
    '形式: {"category": string, "priority": "high"|"medium"|"low", "reason": string}',
  ].join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: taskTitle }],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI分類リクエストに失敗しました (status: ${response.status})`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('AIからの応答を解析できませんでした。');
  }

  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * 完了タスクログから日次振り返りレポートを生成する（v2機能で使用）。
 * @param {import('../task/taskReducer.js').Task[]} doneTasks
 * @returns {Promise<string>} レポート本文
 */
export async function generateDailySummary(doneTasks) {
  const { apiKey, endpoint, model } = await getAiSettings();

  if (!apiKey) {
    throw new Error('AI APIキーが設定されていません。設定画面で入力してください。');
  }

  const taskList = doneTasks
    .map((t) => `- [${t.category}] ${t.title}`)
    .join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: '完了したタスク一覧から、簡潔な日次振り返りレポートを日本語で生成してください。',
      messages: [{ role: 'user', content: taskList || '完了タスクはありません。' }],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI要約リクエストに失敗しました (status: ${response.status})`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}
