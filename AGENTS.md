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

詳細は `docs/architecture.md` を参照。要点は以下のとおり。

※ 画面のビジュアルデザイン（色・タイポ・レイアウトなど）は `DESIGN.md` を参照。`docs/architecture.md` はコード設計の指針。

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
│   ├── login/                         # ログイン・セッション関連
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
│   ├── components/
│   │   ├── AppShell.tsx               # 共通ヘッダ・フッタ
│   │   └── UserMenu.tsx               # アカウントメニュー（アバター・ログアウト）
│   ├── lib/
│   │   ├── supabaseClient.ts          # Supabase クライアント
│   │   └── getAvatarUrl.ts            # Google アバター URL 取得
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
# WARN / ERROR、または SECURITY カテゴリの指摘があれば異常終了する
pnpm splinter

# Supabase 型定義を生成（shared/types/database.ts に出力）
pnpm gen-types

# 生成済み型定義がマイグレーションと一致しているか検証
pnpm check-gen-types
```

---

## CI（GitHub Actions）

| ワークフロー | トリガー | 内容 |
|---|---|---|
| `.github/workflows/ci.yml` | PR全般 / `main` への push | `pnpm lint` → `pnpm test:run` → `pnpm build`（`tsc -b` 込み） |
| `.github/workflows/db.yml` | `supabase/**` などを含む PR | ローカル Supabase を起動して `db reset` → `pnpm splinter` → `pnpm check-gen-types` |
| `.github/workflows/db-deploy.yml` | `supabase/migrations/**` を含む `main` への push | 承認後に `supabase link` → `supabase db push` でリモートへマイグレーション適用 |

- `db.yml` の型定義チェックがあるため、マイグレーションを変更したら `pnpm gen-types` の結果を必ずコミットする
- `db-deploy.yml` は GitHub Environment `production` の承認待ちで停止する。Secrets は `SUPABASE_ACCESS_TOKEN` / `SUPABASE_DB_PASSWORD` / `SUPABASE_PROJECT_ID` が必要
- `db push` はマイグレーションのみを反映する。`config.toml` の認証設定は自動化せず、ダッシュボードで手動設定する（`docs/deploy-guide.md` 参照）
- 依存更新は `.github/dependabot.yml` で週次（minor / patch はグループ化）

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

### スタイリング / UIデザイン

画面の見た目・レイアウト・カラー・タイポグラフィなどは **`DESIGN.md` に従う**（カラーパレット、フォント、コンポーネント方針、Do/Don't など）。

- Tailwind CSS のユーティリティクラスを使用
- shadcn/ui のコンポーネントを積極的に活用する
- クラス名の結合には `cn()` ユーティリティを使用する
- 色・余白・角丸・影などは `DESIGN.md` のトークン・指針に合わせる（独自の見た目を増やさない）
- **同じ意味のボタンは色と形を揃える。** 画面が違っても、取り消し・確定・破壊的操作は既存のボタンと見た目を一致させる。shadcn の `outline` や `destructive`（薄い赤）をそのまま使うと既存ダイアログとずれて見づらくなるので、次のクラスに合わせる
  - 取り消し（「キャンセル」）: `h-12 rounded-full bg-[#F5EFEB] text-base font-semibold text-[#78716C] hover:bg-[#eae1da]`
  - 主アクションの確定（追加・保存など）: `h-12 rounded-full bg-[#0EA5E9] text-base font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7]`
  - 破壊的な確定（削除など）: `h-12 rounded-full bg-[#ba1a1a] text-base font-semibold text-white hover:bg-[#93000a]`

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

### Git / ファイルのリネーム・移動

ファイルやディレクトリのリネーム・移動は、履歴を引き継ぐために `git mv` を使う（通常の削除＋新規作成や OS の `mv` のみは避ける）。

### Git / バージョンアップ（PR作成前）

PR を作成する前に、その PR に**ソースコードの変更**（`src/` などアプリ本体の変更。ドキュメントのみ・CI設定のみなどは対象外）がある場合は、当該ブランチ上でバージョンアップを行い、その変更も同じ PR に含める。

```bash
# minor / patch はエージェントが判断する（メジャーは個別指示があるときのみ）
pnpm version minor   # または pnpm version patch

# pnpm version が作成した tag を origin に push
git push origin vX.Y.Z
```

判断の目安:

| 種別 | 使うとき |
|---|---|
| `patch` | バグ修正、小さな改善、リファクタなど |
| `minor` | ユーザー向けの新機能・挙動の追加など |
| `major` | **行わない**（ユーザーから個別に指示があった場合のみ） |

- `pnpm version` は `package.json` の更新・コミット・tag 作成を行う。バージョンコミットは PR のブランチに乗せる
- tag の push（`git push origin vX.Y.Z`）を忘れない
- ドキュメントのみ・依存の自動更新のみなど、ソースコード変更がない PR ではバージョンアップしない

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

### PR作成前（ソースコード変更がある場合）

```bash
pnpm version minor   # または patch（エージェントが判断）
git push origin vX.Y.Z
```

バージョンアップのコミット・tag を当該 PR に含めること。

---

## 注意事項

- **`splinter` の実行について**: `supabase db advisors --local` は古いバンドル版 splinter を使うため一部警告が拾えない。`pnpm splinter` を使うこと（詳細は `docs/knowledge/splinter.md`）
- **マイグレーション変更時**: `pnpm exec supabase db reset` でローカルに再適用するか、`pnpm exec supabase db push` でリモートへ反映する
- **`shared/types/database.ts`**: Supabase CLIの型生成コマンド（`supabase gen types typescript`）の出力先として想定。手動編集しない
- **ローカル認証**: Google OAuth 用の `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が `.env` に必要。`db reset` 後は `pnpm seed-users` で許可ユーザーを再作成する
