# 🐾 pet-water-tracker

ペット（猫など）の1日の飲水量を記録・可視化するプライベートWebアプリです。  
家族2名で共有して使うことを前提とした、シンプルなトラッカーです。

---

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フロントエンド | React 19, TypeScript, Vite |
| スタイリング | Tailwind CSS v4, shadcn/ui |
| フォーム | React Hook Form + Zod |
| データフェッチ | TanStack Query (React Query v5) |
| ルーティング | React Router v8 |
| グラフ | Recharts |
| バックエンド / DB | Supabase (PostgreSQL) |
| 認証 | Supabase Auth（Google SSO） |
| Linter | oxlint |
| テスト | Vitest |
| パッケージマネージャ | pnpm |

---

## 機能概要

- **水皿記録**：水皿ごとに「交換〜次の交換」の1サイクルを記録し、飲水量を自動算出
- **個別記録**：シリンジ等で直接飲ませた量を別途記録
- **日別集計**：対象日の飲水量合計をグラフで可視化
- **認証**：Google SSO のみ（事前登録2名・新規サインアップ禁止）

---

## セットアップ

### クイックスタート（最短手順）

```bash
# 1. 依存パッケージをインストール
pnpm install

# 2. 環境変数ファイルを作成
cp .env.example .env

# 3. ローカル Supabase を起動（Docker が必要）
pnpm exec supabase start
#   → 表示された API URL と anon key を .env に記入

# 4. DBスキーマを適用
pnpm exec supabase db reset

# 5. 開発サーバーを起動
pnpm dev
```

### 必要な環境変数（`.env`）

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

| 変数名 | 説明 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase プロジェクトの API URL。ローカルの場合は `supabase start` 実行後に表示される URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase の publishable（anon）キー。ローカルの場合は `supabase start` 実行後に表示される anon key |

---

## スクリプト一覧

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm preview` | ビルド結果をプレビュー |
| `pnpm test` | Vitest をウォッチモードで実行 |
| `pnpm test:run` | Vitest を1回実行 |
| `pnpm lint` | oxlint でLintチェック |
| `pnpm splinter` | [splinter](https://github.com/supabase/splinter) でDBアドバイスを確認 |

---

## DBスキーマ概要

```
auth.users (Supabase 管理)
    └── public.users          # アプリ用プロフィール（1:1）
         ├── public.bowls     # 水皿マスタ
         │    └── public.bowl_records      # 水皿ごとの記録サイクル
         └── public.individual_records    # 個別（シリンジ等）記録
```

詳細は [`docs/table-definitions.md`](docs/table-definitions.md) を参照してください。

### RLS

全テーブルで Row Level Security を有効化。認可判定は `private.is_authorized(uid)` 関数に集約しており、将来「家」単位の共有機能を追加する際もこの関数を差し替えるだけで対応できます。

---

## ディレクトリ構成

```
pet-water-tracker/
├── src/
│   ├── app/                     # ルーティング・プロバイダ
│   ├── features/
│   │   ├── auth/                # 認証
│   │   ├── bowls/               # 水皿管理
│   │   ├── bowl-records/        # 水皿記録（components / hooks / api / domain）
│   │   ├── individual-records/  # 個別記録
│   │   └── visualization/       # ホーム画面（カレンダー・グラフ）
│   ├── shared/
│   │   ├── components/ui/       # shadcn/ui コンポーネント
│   │   ├── lib/
│   │   │   └── supabaseClient.ts
│   │   └── types/
│   │       └── database.ts      # Supabase CLIで生成した型定義
│   └── main.tsx
├── supabase/
│   ├── config.toml
│   └── migrations/              # SQLマイグレーション
├── docs/                        # 設計ドキュメント
│   ├── table-definitions.md
│   └── design-guidelines.md
├── .env.example
└── package.json
```

詳細なフォルダ構成は [`docs/design-guidelines.md`](docs/design-guidelines.md) を参照してください。

---

## 認証について

- Google SSO のみ対応（他のプロバイダは使用しない）
- 利用者は事前登録した2名のみ
- 新規サインアップは Supabase 側で無効化する

ローカル開発でも Google プロバイダの設定が必要です（`supabase/config.toml` の `[auth.external.google]`）。

---

## ライセンス

プライベートリポジトリのため、ライセンスは適用しません。
