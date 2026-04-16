# サイト生成の手順

## このステップで行うこと
入力した設定情報をもとに、SPEC v2.3 + GEO/LLMO準拠（Claude Opus 4.6専用）のWEBサイトを一括生成します。

## 前提条件
サイト生成には以下が必須です：
- サイトパス設定済み
- AIプロバイダーのAPIキー設定済み
- 事業者名（business.name）入力済み
- ドメイン（site.domain）入力済み

## 生成されるもの
- **index.html** — トップページ（ヒーロー・サービス・FAQ・問合せフォーム）
- **services/各サービス/index.html** — サービス個別ページ
- **privacy/index.html** — プライバシーポリシー
- **profile/index.html** — 代表者プロフィール（E-E-A-T）
- **404.html** — エラーページ
- **thanks.html** — フォーム送信後ページ
- **tailwind.config.js** — デザイン設定
- **spec-checker.js** — SPEC準拠チェッカー
- **package.json** — ビルド環境

## 生成後の自動処理
1. **npm install** — CSSビルドに必要なパッケージをインストール
2. **git init** — Gitリポジトリを初期化（未初期化の場合）
3. **CSSビルド** — Tailwind CSSをコンパイル

## 生成後にやること
1. 「検証・デプロイ」タブでSPECチェックを実行
2. プレビューで見た目を確認
3. 問題なければデプロイ

## UI対応箇所
- サイト生成タブ
