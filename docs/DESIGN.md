# 仕事管理ブラウザ拡張機能 設計書 兼 機能定義書

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| プロダクト名 | Task Hub (仮) |
| 目的 | タスク管理・タブ管理・AI連携を統合した個人向け仕事管理ツール |
| 開発優先ブラウザ | Safari (iPad / iPhone / Mac) |
| 移行先ブラウザ | Chrome (Manifest V3) |
| 開発言語 | Vanilla JavaScript, HTML, CSS |
| 配布方法 | Safari Web Extension Packager経由でApp Store Connectへアップロード（Xcode不要） |
| Manifestバージョン | Manifest V3 |

## 2. 開発方針

- Safariを開発の起点とし、Chromeへの移行を前提としたアーキテクチャで設計する。
- ブラウザAPI呼び出しは `browser.*` 名前空間に統一する。Chrome 148以降は `browser.*` と `chrome.*` が同一APIを指すため、Safari優先でもChrome移行の障壁がない。
- ロジック層(core)とブラウザAPI層(platform)を完全分離し、coreはブラウザ差分を一切意識しない。
- platform層は「メソッド単位ファイル分割」を採用し、1メソッド1ファイルで管理する。

## 3. アーキテクチャ全体構成

```
src/
├── core/                  # ブラウザ非依存のドメインロジック
│   ├── task/
│   │   ├── taskStore.js       # タスクの状態管理（自作Reactive Store）
│   │   ├── taskReducer.js     # dispatch(action) 処理
│   │   └── taskSelectors.js   # フィルタ・ソート・進捗計算
│   ├── tabWorkspace/
│   │   └── workspaceStore.js  # タスク⇔タブ紐付けロジック
│   └── ai/
│       └── aiClient.js        # LLM API呼び出しの抽象化
│
├── platform/               # ブラウザAPIラッパー（メソッド単位）
│   ├── tabs/
│   │   ├── getAllTabs.js
│   │   ├── getActiveTab.js
│   │   ├── openTab.js
│   │   ├── closeTab.js
│   │   └── focusTab.js
│   ├── storage/
│   │   ├── getTasks.js
│   │   ├── saveTasks.js
│   │   ├── clearTasks.js
│   │   └── subscribeToChanges.js
│   ├── messaging/
│   │   ├── sendToBackground.js
│   │   ├── sendToPopup.js
│   │   └── onMessage.js
│   └── permissions/
│       ├── requestPermission.js
│       └── hasPermission.js
│
├── background/             # Service Worker（中央ルーター）
│   ├── router.js
│   └── index.js
│
├── popup/                  # メインUI
│   ├── index.html
│   ├── popup.js
│   └── components/
│
├── options/                 # 設定画面（AI APIキー、カテゴリ管理）
│   ├── index.html
│   └── options.js
│
└── shared/
    ├── messages.js          # アクション名の定義（ADD_TASK等）
    └── constants.js
```

## 4. メッセージング設計

すべてのUI間通信はService Worker(background)を中央ハブとして経由させる。

```
Popup / Options
      │  action + payload
      ▼
Background (router.js)
      │  reducer実行
      ▼
Storage (chrome.storage.local)
      │  変更をブロードキャスト
      ▼
Popup / Options (再描画)
```

### アクション例

| アクション名 | 用途 |
|---|---|
| ADD_TASK | タスク追加 |
| UPDATE_TASK | タスク編集 |
| DELETE_TASK | タスク削除 |
| TOGGLE_TASK_STATUS | 完了/未完了切り替え |
| ATTACH_TAB_TO_TASK | 現在タブをタスクに添付 |
| RESTORE_TASK_TABS | タスクに紐づくタブ群を復元 |
| REQUEST_AI_CLASSIFY | AIによるタスク自動分類 |

## 5. 状態管理設計（Vanilla JS）

- **ReactiveState**: `subscribe` / `setState` を持つObservableパターン。
- **ActionState**: `dispatch(action)` でReducerを呼ぶRedux風設計。ロギング・永続化ミドルウェアを挿入可能。
- **DeepState**: `store.set('ui.modals.taskEditor.open', true)` のようなパス指定更新。

Popup側はこの自作Storeでリアクティブ管理し、永続化データのみ `platform/storage` 経由でbackgroundとやり取りする。

## 6. platform層 命名規則

| カテゴリ | メソッド例 | 対応API |
|---|---|---|
| タブ | getAllTabs, getActiveTab, openTab, closeTab, focusTab | browser.tabs.* |
| 永続化 | getTasks, saveTasks, clearTasks, subscribeToChanges | browser.storage.* |
| 通信 | sendToBackground, sendToPopup, onMessage | browser.runtime.* |
| 権限 | requestPermission, hasPermission | browser.permissions.* |

各ファイルの実装例：

```javascript
// platform/tabs/getAllTabs.js
export async function getAllTabs() {
  return browser.tabs.query({});
}
```

```javascript
// platform/storage/saveTasks.js
export async function saveTasks(tasks) {
  return browser.storage.local.set({ tasks });
}
```

## 7. manifest.json（Manifest V3 / Safari & Chrome共通ベース）

```json
{
  "manifest_version": 3,
  "name": "Task Hub",
  "version": "1.0",
  "description": "タスク管理・タブ管理・AI連携を統合した仕事管理拡張機能",
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "48": "images/icon-48.png",
      "96": "images/icon-96.png",
      "128": "images/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  "options_page": "options/index.html",
  "permissions": [
    "storage",
    "tabs",
    "activeTab"
  ]
}
```

## 8. 機能定義（v1 / MVP）

| # | 機能 | 詳細 | 優先度 |
|---|---|---|---|
| 1 | タスクCRUD | 追加・編集・削除・完了チェック | 必須 |
| 2 | カテゴリ分け | 本業/副業/投資/学習等のタグ付け・フィルタ | 必須 |
| 3 | 優先度設定 | 高/中/低の3段階 | 必須 |
| 4 | 期限管理 | 締切日の設定・ソート | 必須 |
| 5 | タブ添付 | 現在開いているタブをタスクに紐付け | 必須 |
| 6 | タブ復元 | タスクから関連タブ群を再オープン | 必須 |
| 7 | AI自動分類 | タスク文からカテゴリ・優先度を自動推定 | 必須 |

## 9. 機能定義（v2 / リッチ化フェーズ）

| # | 機能 | 詳細 |
|---|---|---|
| 8 | ポモドーロタイマー | タスク単位で作業時間を計測 |
| 9 | 工数記録 | 見積もり時間 vs 実績時間の記録・比較 |
| 10 | カンバンボード | 未着手/進行中/完了のドラッグ&ドロップ表示 |
| 11 | 新規タブダッシュボード | 新規タブ画面に今日のタスク・工数サマリー表示 |
| 12 | 習慣トラッキング | 繰り返しタスクのストリーク表示 |
| 13 | AI日次振り返り生成 | 完了タスクログから要約レポート自動生成 |

## 10. 機能定義（v3 / 発展フェーズ）

| # | 機能 | 詳細 |
|---|---|---|
| 14 | GitHub連携 | 完了タスクをIssue/リポジトリへ自動記録 |
| 15 | データ可視化 | 週次/月次の工数配分グラフ |
| 16 | CSVエクスポート | 工数データのエクスポート |
| 17 | タブ数警告 | タブが一定数を超えたら通知 |

## 11. Safari / Chrome 差分管理方針

| 項目 | Safari | Chrome | 対応方針 |
|---|---|---|---|
| 開発環境 | 任意ブラウザ + Safari Web Extension Packager | 任意OS、chrome://extensions | platform層のみ差分吸収 |
| ビルド・配布 | ZIPをApp Store Connectへアップロード | フォルダをそのまま読み込み | 配布フローのみ分離 |
| API呼び出し | browser.* | browser.* (Chrome 148+で対応) | 共通コードで対応可能 |
| 権限モデル | サイト単位許可・プライバシー重視 | permissions配列で一括許可 | 最小権限で設計 |

## 12. 開発フロー

1. Safari向けにcore/platform/UIを実装する。
2. ローカルでUIとロジックを検証する。
3. 節目ごとにフォルダをZIP化し、Safari Web Extension Packagerでパッケージ化する。
4. iPad / iPhone / MacのSafariでTestFlight検証する。
5. platform層はそのまま維持し、Chromeで動作確認する（chrome://extensionsで読み込み）。
6. Chrome固有の挙動が必要な場合のみ、platform層に差分ファイルを追加する。

## 13. 避けるべき設計（アンチパターン）

- coreやUIから `browser.*` / `chrome.*` を直接呼び出す。
- webRequest等、Safari Manifest V3で互換性の議論があるAPIへの依存。
- 権限の過剰要求（サイト単位許可のUX負荷が増す）。
- Service Worker内でのイベントハンドラの遅延登録（スリープ後の取り逃しリスク）。
