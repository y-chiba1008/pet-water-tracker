# AGENTS.md — AI エージェント向けガイド

このファイルはAIコーディングアシスタント（Cursor Agent など）がこのリポジトリを理解・作業するための情報をまとめたものです。

---

## プロジェクト概要

**pet-water-tracker** は、ペットの飲水量を記録・可視化するプライベートWebアプリです。  
家族2名で共有して使うことを想定しています。

---

## 技術スタック

| カテゴリ | 採用技術 | バージョン目安 |
|---|---|---|
| フロントエンド | React | 19 |
| 言語 | TypeScript | ~6.0 |
| ビルドツール | Vite | 8 |
| スタイリング | Tailwind CSS | v4 |
| UIコンポーネント | shadcn/ui（radix-ui ベース） | — |
| フォーム | React Hook Form + Zod | — |
| データフェッチ | TanStack Query (React Query) | v5 |
| ルーティング | React Router | v8 |
| グラフ | Recharts | — |
| バックエンド / DB | Supabase (PostgreSQL) | — |
| 認証 | Supabase Auth（Google SSO のみ） | — |
| Linter | oxlint | — |
| テスト | Vitest | — |
| パッケージマネージャ | pnpm | — |

---

## アーキテクチャ方針

詳細は `docs/design-guidelines.md` を参照。要点は以下のとおり。

### Repository パターン（データアクセス層の分離）

Supabaseへのクエリはコンポーネント・hookに直書きせず、`api/xxxRepository.ts` に集約する。

- コンポーネントやhookから `supabase.from(...)` を直接呼ばない
- 将来の `house_id` 追加などスキーマ変更の影響範囲を `api/` 層に限定できる

### Functional Core（ドメインロジックの純粋関数化）

飲水量計算・異常値判定・日別集計など、副作用のないロジックは `domain/` に純粋関数として切り出す。

```ts
// features/bowl-records/domain/bowlRecord.ts
export function calcWaterAmount(start: number, end: number): number
export function isAbnormal(start: number, end: number): boolean
export function isActiveCycle(record: BowlRecord): boolean
```

`domain/` は `bowl-records` と `visualization` にのみ配置（単純なCRUDの feature には置かない）。

### カスタムHook + TanStack Query（状態管理）

- コンポーネントからは `useActiveCycle(bowlId)` / `useDailySummary(date)` のようなhookを呼ぶ
- キャッシュ・ローディング・再検証は TanStack Query に委譲する

### 判別可能なUnion型でフォーム状態をモデリング

水皿記録フォームの「進行中サイクルあり/なし」を型で表現し、素朴なif分岐で管理しない。

```ts
type BowlFormState =
  | { mode: "no-active-cycle" }
  | { mode: "active-cycle"; current: BowlRecord };
```

### feature ベースのフォルダ構成

`components/` `hooks/` のような型別ではなく、機能単位でまとめる。

```
src/features/<feature-name>/
  ├── components/
  ├── hooks/
  ├── api/          # Supabase クエリ（Repository）
  ├── domain/       # 純粋関数（bowl-records / visualization のみ）
  └── types.ts
```

---

## ディレクトリ構成

```
src/
├── app/
│   ├── App.tsx                        # ルーティング定義
│   ├── routes.tsx
│   └── providers/
│       ├── AuthProvider.tsx           # Supabase Authセッション管理
│       └── QueryProvider.tsx          # TanStack Query設定
│
├── features/
│   ├── auth/
│   ├── bowls/                         # 水皿管理
│   ├── bowl-records/                  # 水皿記録
│   │   ├── domain/
│   │   │   └── bowlRecord.ts          # calcWaterAmount, isAbnormal, isActiveCycle
│   │   └── api/
│   │       └── bowlRecordRepository.ts
│   ├── individual-records/            # 個別記録
│   └── visualization/                 # ホーム画面（カレンダー・折れ線グラフ）
│       ├── domain/
│       │   └── dailySummary.ts        # 純粋関数での集計ロジック
│       └── api/
│           └── summaryRepository.ts   # bowl_records + individual_records から集計
│
├── shared/
│   ├── components/ui/                 # shadcn/ui コンポーネント
│   ├── lib/
│   │   └── supabaseClient.ts          # Supabase クライアント
│   └── types/
│       └── database.ts                # Supabase CLIで生成した型定義
│
└── main.tsx
```

---

## DBスキーマ

### テーブル一覧

| テーブル | 用途 |
|---|---|
| `public.users` | `auth.users` と1:1対応のアプリ用プロフィール |
| `public.bowls` | 水皿マスタ（`is_active` で論理削除） |
| `public.bowl_records` | 水皿ごとの記録サイクル（交換〜次の交換が1レコード） |
| `public.individual_records` | シリンジ等での個別記録 |

詳細は `docs/table-definitions.md` を参照。

### 重要な設計ポイント

- **`bowl_records` の進行中サイクル**: `end_time IS NULL` で判定。同一 `bowl_id` に対して1件のみ許可（部分ユニークインデックス `bowl_records_active_cycle_idx` で強制）
- **飲水量の算出**: `start_amount_ml - end_amount_ml`（アプリ側で計算、カラムとしては持たない）
- **日別集計**: `bowl_records`（`end_time` の日付）と `individual_records`（`recorded_at` の日付）の合計をオンデマンドに算出

### RLSポリシー設計

全テーブルで Row Level Security を有効化。

```sql
-- 認可判定関数（private スキーマに配置 → PostgREST 経由で直接呼び出し不可）
create or replace function private.is_authorized(uid uuid) returns boolean ...
-- users テーブルに uid が存在すれば true を返す（現状は認証済み = 許可）
```

- 各テーブルの SELECT / INSERT / UPDATE ポリシーはすべて `private.is_authorized(auth.uid())` を条件とする
- **将来「家」単位の共有を導入する際**は、この関数の中身のみを差し替える（各テーブルのポリシー定義変更は不要）

### トリガー

| トリガー名 | タイミング | 内容 |
|---|---|---|
| `on_auth_user_created` | `auth.users` INSERT後 | `public.users` にレコードを自動作成 |
| `bowl_records_set_updated_at` | `bowl_records` UPDATE前 | `updated_at` を `now()` に更新 |

---

## 認証

- **Google SSO のみ**（他プロバイダ不使用）
- 利用者は**事前登録した2名のみ**
- 新規サインアップは無効（`supabase/config.toml` の `enable_signup = false`）
- Google プロバイダは `[auth.external.google]` で有効化。Client ID / Secret は `.env` の `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を `env(...)` で参照する
- 許可ユーザーは `pnpm seed-users` で Admin API 経由で事前作成する（`scripts/seed-users.config.json` のメール一覧）

---

## 環境変数

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

| 変数名 | 説明 |
|---|---|
| `SUPABASE_URL` | Supabase の API URL |
| `SUPABASE_PUBLISHABLE_KEY` | publishable（anon）キー |
| `SUPABASE_SECRET_KEY` | service role（secret）キー。`pnpm seed-users` で使用 |
| `VITE_SUPABASE_URL` | フロントエンド用 API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | フロントエンド用 publishable キー |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth Client ID（`config.toml` が参照） |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth Client Secret（`config.toml` が参照） |

---

## よく使うコマンド

```bash
# 開発サーバー起動
pnpm dev

# ローカル Supabase 起動（Docker 必要）
pnpm exec supabase start

# DBリセット＆マイグレーション適用
pnpm exec supabase db reset

# 許可ユーザーを事前登録（Admin API）
pnpm seed-users

# テスト
pnpm test:run

# Lint
pnpm lint

# DBアドバイス（splinter）
# ※ supabase-cli のバンドル版は古いため、最新版を GitHub から直接取得して実行している
pnpm splinter

# Supabase 型定義を生成（shared/types/database.ts に出力）
pnpm exec supabase gen types typescript --local > src/shared/types/database.ts
```

---

## コーディング規約

### TypeScript / React

- 関数コンポーネントのみ使用（クラスコンポーネント禁止）
- パスエイリアスは `@/` を使用（`src/` にマッピング）
- `import type` を活用して型インポートを明示する

### Supabase

- クライアントは `src/shared/lib/supabaseClient.ts` からインポートする
- データアクセスは必ず `api/xxxRepository.ts` 経由で行う（コンポーネント・hookから `supabase.from(...)` を直接呼ばない）
- RLS を信頼し、クライアント側で認可チェックを二重実装しない

### フォーム

- React Hook Form + Zod のセットで実装する
- スキーマ定義（`z.object(...)`）はコンポーネントファイルの外に切り出す

### スタイリング

- Tailwind CSS のユーティリティクラスを使用
- shadcn/ui のコンポーネントを積極的に活用する
- クラス名の結合には `cn()` ユーティリティを使用する

### Git / ブランチ命名

Issue に紐づく作業では、ブランチ名を `<プレフィックス>/#<issue番号>_<短い説明>` の形式にする。

プレフィックスは作業内容に応じて使い分ける（よく使われるもの）:

| プレフィックス | 用途 |
|---|---|
| `feature` | 新機能の追加 |
| `fix` | バグ修正 |
| `hotfix` | 本番向けの緊急修正 |
| `refactor` | 挙動を変えずに内部構造を整理・改善 |
| `chore` | ビルド設定・依存関係・雑務などプロダクト機能外の変更 |
| `docs` | ドキュメントのみの変更 |
| `test` | テストの追加・修正 |
| `ci` | CI/CD 設定の変更 |

例:

- `feature/#1_sample_branch`
- `fix/#12_login_redirect`
- `docs/#3_update_agents_md`

---

## チェックリスト

### コード修正後

```bash
pnpm build   # ビルドエラーがないことを確認
pnpm lint    # Lint 警告・エラーがないことを確認
```

警告を残したままにしない。

### DB（マイグレーション）修正後

```bash
pnpm splinter  # 警告がないことを確認
```

警告を残したままにしない。

---

## 注意事項

- **`splinter` の実行について**: `supabase db advisors --local` は古いバンドル版 splinter を使うため一部警告が拾えない。`pnpm splinter` を使うこと（詳細は `docs/splinter-memo.md`）
- **マイグレーション変更時**: `pnpm exec supabase db reset` でローカルに再適用するか、`pnpm exec supabase db push` でリモートへ反映する
- **`shared/types/database.ts`**: Supabase CLIの型生成コマンド（`supabase gen types typescript`）の出力先として想定。手動編集しない
- **ローカル認証**: Google OAuth 用の `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が `.env` に必要。`db reset` 後は `pnpm seed-users` で許可ユーザーを再作成する
