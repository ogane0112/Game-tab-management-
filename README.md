# Task Hub (仮)

タスク管理・タブ管理・AI連携を統合した個人向け仕事管理ブラウザ拡張機能。

- 開発優先ブラウザ: Safari (iPad / iPhone / Mac)
- 移行先ブラウザ: Chrome (Manifest V3)
- 開発言語: Vanilla JavaScript, HTML, CSS
- 配布方法: Safari Web Extension Packager経由でApp Store Connectへアップロード

詳細な設計・機能定義は [`docs/DESIGN.md`](./docs/DESIGN.md) を参照してください。

## ディレクトリ構成（概要）

```
src/
├── core/        # ブラウザ非依存のドメインロジック
├── platform/    # ブラウザAPIラッパー（メソッド単位ファイル分割）
├── background/  # Service Worker（中央ルーター）
├── popup/       # メインUI
├── options/     # 設定画面
└── shared/      # 共有定数・アクション名
```
